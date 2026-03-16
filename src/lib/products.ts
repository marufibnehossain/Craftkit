import { prisma } from "@/lib/prisma";
import type { Product, Category } from "@/lib/data";
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from "@/lib/mock-products";

const HAS_DATABASE_URL = !!process.env.DATABASE_URL?.trim();

type DbProductRow = {
  id: string;
  slug: string;
  productCode: string | null;
  name: string;
  priceCents: number;
  compareAtCents: number | null;
  rating: number;
  reviewCount: number;
  images: string;
  tags: string;
  shortDesc: string;
  longDesc: string | null;
  ingredients: string | null;
  howToUse: string | null;
  stock: number;
  trackInventory?: boolean;
  badge: string | null;
  isDownloadable?: boolean;
  downloadFiles?: string | null;
  category?: { slug: string } | null;
};

function mapDbRow(p: DbProductRow): Product {
  return parseProduct({
    id: p.id,
    slug: p.slug,
    productCode: p.productCode,
    name: p.name,
    priceCents: p.priceCents,
    compareAtCents: p.compareAtCents,
    rating: p.rating,
    reviewCount: p.reviewCount,
    images: p.images,
    category: { slug: p.category?.slug || "" },
    tags: p.tags,
    shortDesc: p.shortDesc,
    longDesc: p.longDesc,
    ingredients: p.ingredients,
    howToUse: p.howToUse,
    stock: p.stock,
    trackInventory: p.trackInventory,
    isDownloadable: p.isDownloadable,
    downloadFiles: p.downloadFiles,
  });
}

function parseProduct(dbProduct: {
  id: string;
  slug: string;
  productCode: string | null;
  name: string;
  priceCents: number;
  compareAtCents: number | null;
  rating: number;
  reviewCount: number;
  images: string;
  category: { slug: string };
  tags: string;
  shortDesc: string;
  longDesc: string | null;
  ingredients: string | null;
  howToUse: string | null;
  stock: number;
  trackInventory?: boolean;
  isDownloadable?: boolean;
  downloadFiles?: string | null;
}): Product {
  const p: Product = {
    id: dbProduct.id,
    slug: dbProduct.slug,
    productCode: dbProduct.productCode ?? undefined,
    name: dbProduct.name,
    price: dbProduct.priceCents / 100,
    compareAt: dbProduct.compareAtCents ? dbProduct.compareAtCents / 100 : undefined,
    rating: dbProduct.rating,
    reviewCount: dbProduct.reviewCount,
    images: JSON.parse(dbProduct.images) as string[],
    category: dbProduct.category.slug,
    tags: JSON.parse(dbProduct.tags) as string[],
    shortDesc: dbProduct.shortDesc,
    longDesc: dbProduct.longDesc ?? undefined,
    ingredients: dbProduct.ingredients ?? undefined,
    howToUse: dbProduct.howToUse ?? undefined,
    stock: dbProduct.stock,
    trackInventory: dbProduct.trackInventory,
    isDownloadable: dbProduct.isDownloadable ?? false,
  };
  if (dbProduct.downloadFiles) {
    try {
      p.downloadFiles = JSON.parse(dbProduct.downloadFiles);
    } catch (_) {}
  }
  return p;
}

export async function getProducts(): Promise<Product[]> {
  if (!HAS_DATABASE_URL) return [...MOCK_PRODUCTS];

  const dbProducts = await (prisma as any).product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: {
        select: { slug: true },
      },
    },
  }) as Array<DbProductRow>;

  return dbProducts.map(mapDbRow);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!HAS_DATABASE_URL) return MOCK_PRODUCTS.find((p) => p.slug === slug) ?? null;

  const p = await (prisma as any).product.findUnique({
    where: { slug },
    include: {
      category: { select: { slug: true } },
      attributes: true,
      variations: true,
    },
  }) as (DbProductRow & {
    attributes: Array<{ id: string; name: string; values: string; displayType?: string | null; displayData?: string | null }>;
    variations: Array<{
      id: string;
      attributes: string;
      priceCents: number | null;
      stock: number;
      sku: string | null;
      images: string | null;
    }>;
  } | null);

  if (!p) return null;

  const product: Product = mapDbRow(p);
  product.badge = p.badge ?? undefined;

  if (p.attributes.length > 0) {
    product.attributes = p.attributes.map((a: { id: string; name: string; values: string; displayType?: string | null; displayData?: string | null }) => {
      const att: { id: string; name: string; values: string[]; displayType?: "button" | "swatch" | "image"; displayData?: Record<string, string> } = {
        id: a.id,
        name: a.name,
        values: JSON.parse(a.values) as string[],
      };
      if (a.displayType && ["button", "swatch", "image"].includes(a.displayType)) {
        att.displayType = a.displayType as "button" | "swatch" | "image";
      }
      if (a.displayData) {
        try {
          att.displayData = JSON.parse(a.displayData) as Record<string, string>;
        } catch (_) {}
      }
      return att;
    });
  }

  if (p.variations.length > 0) {
    product.variations = p.variations.map((v) => ({
      id: v.id,
      attributes: JSON.parse(v.attributes) as Record<string, string>,
      price: v.priceCents ? v.priceCents / 100 : null,
      stock: v.stock,
      sku: v.sku ?? null,
      images: v.images ? (JSON.parse(v.images) as string[]) : null,
    }));
  }

  return product;
}

export async function getFeaturedProducts(limit = 3): Promise<Product[]> {
  if (!HAS_DATABASE_URL) return MOCK_PRODUCTS.slice(0, limit);

  const dbProducts = await (prisma as any).product.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      category: {
        select: { slug: true },
      },
    },
  }) as Array<DbProductRow>;

  return dbProducts.map(mapDbRow);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  if (!HAS_DATABASE_URL) {
    return MOCK_PRODUCTS.filter((p) => p.id !== product.id).slice(0, limit);
  }

  const categorySlug = product.category || null;
  const firstTag = product.tags[0] || null;

  const orConditions: any[] = [];
  if (categorySlug) {
    orConditions.push({ category: { slug: categorySlug } });
  }
  if (firstTag) {
    orConditions.push({
      tags: { contains: firstTag, mode: "insensitive" as const },
    });
  }

  const where: any = {
    id: { not: product.id },
  };
  if (orConditions.length > 0) {
    where.OR = orConditions;
  }

  const dbProducts = await (prisma as any).product.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      category: { select: { slug: true } },
    },
  }) as Array<DbProductRow>;

  return dbProducts.map(mapDbRow);
}

export async function searchProducts(query: string): Promise<Product[]> {
  if (!HAS_DATABASE_URL) {
    const q = query.toLowerCase().trim();
    if (!q) return [...MOCK_PRODUCTS];
    return MOCK_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.shortDesc.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
  const q = query.toLowerCase().trim();
  if (!q) return getProducts();

  const dbProducts = await (prisma as any).product.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { shortDesc: { contains: q, mode: "insensitive" } },
        { tags: { contains: q, mode: "insensitive" } },
        { category: { slug: { contains: q, mode: "insensitive" } } },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { slug: true } },
    },
  }) as Array<DbProductRow>;

  return dbProducts.map(mapDbRow);
}

export async function getProductsBySlugs(slugs: string[]): Promise<Product[]> {
  if (!HAS_DATABASE_URL) {
    if (slugs.length === 0) return [];
    const slugSet = new Set(slugs);
    return MOCK_PRODUCTS.filter((p) => slugSet.has(p.slug));
  }
  if (slugs.length === 0) return [];

  const dbProducts = await (prisma as any).product.findMany({
    where: {
      slug: { in: slugs },
    },
    include: {
      category: { select: { slug: true } },
    },
  }) as Array<DbProductRow>;

  return dbProducts.map(mapDbRow);
}

export async function getCategories(): Promise<Category[]> {
  if (!HAS_DATABASE_URL) return [...MOCK_CATEGORIES];

  const dbCategories = await (prisma as any).category.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
      parentId: true,
    },
  }) as Array<{
    id: string;
    name: string;
    slug: string;
    image?: string | null;
    parentId?: string | null;
  }>;

  return dbCategories
    .filter((c) => c.slug !== "uncategorized" && c.slug !== "featured")
    .map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      image: c.image ?? null,
      parentId: c.parentId ?? null,
    }));
}

export type CategoryWithChildren = Category & { children: CategoryWithChildren[] };

/** Build a tree of categories (parents with nested children) */
export function buildCategoryTree(categories: Category[]): CategoryWithChildren[] {
  const byParentId = new Map<string | null, Category[]>();
  for (const c of categories) {
    const key = c.parentId ?? null;
    if (!byParentId.has(key)) byParentId.set(key, []);
    byParentId.get(key)!.push(c);
  }
  function addChildren(cat: Category): CategoryWithChildren {
    const children = (byParentId.get(cat.id) ?? [])
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(addChildren);
    return { ...cat, children };
  }
  const roots = (byParentId.get(null) ?? []).sort((a, b) => a.name.localeCompare(b.name));
  return roots.map(addChildren);
}

/** Get all slugs in a subtree (self + descendants) for filtering */
function collectSlugsInSubtree(node: CategoryWithChildren): string[] {
  return [node.slug, ...node.children.flatMap(collectSlugsInSubtree)];
}

/** Build a map: category slug -> all slugs to match when filtering (self + descendants) */
export function buildCategorySlugMap(tree: CategoryWithChildren[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  function walk(node: CategoryWithChildren) {
    map.set(node.slug, collectSlugsInSubtree(node));
    node.children.forEach(walk);
  }
  tree.forEach(walk);
  return map;
}
