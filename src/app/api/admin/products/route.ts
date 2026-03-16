import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json(
      products.map((p) => ({
        id: p.id,
        slug: p.slug,
        productCode: p.productCode,
        name: p.name,
        price: p.priceCents / 100,
        compareAt: p.compareAtCents ? p.compareAtCents / 100 : null,
        rating: p.rating,
        reviewCount: p.reviewCount,
        images: JSON.parse(p.images),
        category: p.category,
        tags: JSON.parse(p.tags),
        shortDesc: p.shortDesc,
        longDesc: p.longDesc,
        ingredients: p.ingredients,
        howToUse: p.howToUse,
        stock: p.stock,
        trackInventory: p.trackInventory,
        badge: p.badge ?? null,
        isDownloadable: p.isDownloadable,
        downloadFiles: p.downloadFiles ? JSON.parse(p.downloadFiles) : [],
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      }))
    );
  } catch (e) {
    console.error("[Admin] Products list error:", e);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const {
      slug,
      productCode,
      name,
      price,
      compareAt,
      rating,
      reviewCount,
      images,
      categoryId,
      tags,
      shortDesc,
      longDesc,
      ingredients,
      howToUse,
      stock,
      trackInventory,
      badge,
      isDownloadable,
      downloadFiles,
    } = body;

    if (!slug || !name || typeof price !== "number" || !categoryId || !shortDesc) {
      return NextResponse.json(
        { error: "Missing required fields: slug, name, price, categoryId, shortDesc" },
        { status: 400 }
      );
    }
    const imageArray = Array.isArray(images) ? images : [images || "/images/placeholder.svg"];
    const tagArray = Array.isArray(tags) ? tags : [];
    const created = await prisma.product.create({
      data: {
        slug: slug.trim(),
        productCode: productCode?.trim() || null,
        name: name.trim(),
        priceCents: Math.round(price * 100),
        compareAtCents: compareAt ? Math.round(compareAt * 100) : null,
        rating: rating ?? 0,
        reviewCount: reviewCount ?? 0,
        images: JSON.stringify(imageArray),
        categoryId,
        tags: JSON.stringify(tagArray),
        shortDesc: shortDesc.trim(),
        longDesc: longDesc?.trim() || null,
        ingredients: ingredients?.trim() || null,
        howToUse: howToUse?.trim() || null,
        stock: typeof stock === "number" ? Math.max(0, Math.floor(stock)) : 0,
        trackInventory: trackInventory !== false,
        badge: badge === "NEW" || badge === "BESTSELLER" ? badge : null,
        isDownloadable: isDownloadable === true,
        downloadFiles: Array.isArray(downloadFiles) && downloadFiles.length > 0 ? JSON.stringify(downloadFiles) : null,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json({
      id: created.id,
      slug: created.slug,
      productCode: created.productCode,
      name: created.name,
      price: created.priceCents / 100,
      compareAt: created.compareAtCents ? created.compareAtCents / 100 : null,
      rating: created.rating,
      reviewCount: created.reviewCount,
      images: imageArray,
      category: created.category,
      tags: tagArray,
      shortDesc: created.shortDesc,
      longDesc: created.longDesc,
      ingredients: created.ingredients,
      howToUse: created.howToUse,
      stock: created.stock,
      trackInventory: created.trackInventory,
      badge: created.badge ?? null,
      isDownloadable: created.isDownloadable,
      downloadFiles: created.downloadFiles ? JSON.parse(created.downloadFiles) : [],
    });
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "A product with this slug already exists" }, { status: 400 });
    }
    console.error("[Admin] Product create error:", e);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
