/**
 * Import table tennis products from dandoy_sports_products.csv
 *
 * Usage: npx tsx scripts/import-dandoy-sports.ts [path-to-csv] [--resume] [--update-categories]
 * Example: npx tsx scripts/import-dandoy-sports.ts "d:\Dev Download\BEM Group\dandoy_sports_products.csv"
 * Example: npx tsx scripts/import-dandoy-sports.ts "d:\Dev Download\BEM Group\dandoy_sports_products.csv" --resume
 * Example: npx tsx scripts/import-dandoy-sports.ts "d:\Dev Download\BEM Group\dandoy_sports_products.csv" --update-categories
 *
 * --resume: Skip rows whose slug already exists in DB (use if import stopped partway)
 * --update-categories: For existing products, update categoryId to match CSV (incl. child categories)
 */

import "dotenv/config";
// Prefer direct connection; add pgbouncer=true to avoid "prepared statement already exists"
const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || "";
if (dbUrl && !dbUrl.includes("pgbouncer=true")) {
  process.env.DATABASE_URL = dbUrl.includes("?") ? `${dbUrl}&pgbouncer=true` : `${dbUrl}?pgbouncer=true`;
}

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import Papa from "papaparse";

const prisma = new PrismaClient();

type CsvRow = {
  url: string;
  product_title: string;
  Colors: string;
  price: string;
  description: string;
  MainColor: string;
  Type: string;
  Pimples: string;
  Hardness: string;
  product_images: string;
  category: string;
  Manufacturer: string;
  "Blade type": string;
  Layers: string;
  "Blades Feeling": string;
  Material: string;
  Usage: string;
  Quantity: string;
};

function slugFromUrl(url: string): string | null {
  if (!url?.trim()) return null;
  try {
    const u = new URL(url);
    const pathname = u.pathname;
    const htmlMatch = pathname.match(/\/([^/]+)\.html$/);
    if (htmlMatch) return htmlMatch[1].toLowerCase();
    const lastSegment = pathname.split("/").filter(Boolean).pop();
    if (lastSegment) return lastSegment.replace(/\.html$/, "").toLowerCase();
  } catch {
    // ignore
  }
  return null;
}

function slugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseImages(imagesStr: string): string[] {
  if (!imagesStr?.trim()) return [];
  return imagesStr
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function ensureUniqueSlug(slug: string, existing: Set<string>): string {
  let s = slug;
  let n = 1;
  while (existing.has(s)) {
    s = `${slug}-${n}`;
    n++;
  }
  existing.add(s);
  return s;
}

/** Convert category name to slug */
function categoryToSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "other";
}

/**
 * Parse category string - supports "Parent > Child", "Parent/Child", "Parent - Child"
 * Returns [parent, child] or [parent] for top-level only
 */
function parseCategoryPath(raw: string): string[] {
  const s = raw?.trim() || "Accessories";
  const parts = s.split(/\s*[>\/\-]\s*/).map((p) => p.trim()).filter(Boolean);
  return parts.length > 0 ? parts : ["Accessories"];
}

/** Get or create category (and parent if needed). Returns category id. */
async function getOrCreateCategory(
  pathParts: string[],
  cache: Map<string, string>
): Promise<string> {
  const key = pathParts.join(" > ");
  const cached = cache.get(key);
  if (cached) return cached;

  let parentId: string | null = null;
  const slugParts: string[] = [];
  for (let i = 0; i < pathParts.length; i++) {
    const name = pathParts[i];
    slugParts.push(categoryToSlug(name));
    const slug = slugParts.join("-"); // e.g. rubbers-inverted for unique slug
    const fullKey = pathParts.slice(0, i + 1).join(" > ");

    const existing = cache.get(fullKey);
    if (existing) {
      parentId = existing;
      continue;
    }

    const cat: { id: string } = await prisma.category.upsert({
      where: { slug },
      create: { name, slug, parentId },
      update: parentId !== null ? { parentId } : {},
    });
    cache.set(fullKey, cat.id);
    cache.set(name, cat.id);
    cache.set(slug, cat.id);
    parentId = cat.id;
  }
  return parentId!;
}

async function loadCategoryMap(rows: CsvRow[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();

  // Ensure base categories exist first
  const baseCategories = [
    { name: "Rubbers", slug: "rubbers" },
    { name: "Blades", slug: "blades" },
    { name: "Bats", slug: "bats" },
    { name: "Balls", slug: "balls" },
    { name: "Cleaners & Glue", slug: "cleaners-glue" },
    { name: "Cleaners and Glue", slug: "cleaners-glue" },
    { name: "Accessories", slug: "accessories" },
  ];
  for (const c of baseCategories) {
    const cat: { id: string } = await prisma.category.upsert({
      where: { slug: c.slug },
      create: { name: c.name, slug: c.slug },
      update: {},
    });
    map.set(c.name, cat.id);
    map.set(c.slug, cat.id);
  }

  // Collect all unique category paths from CSV, sort by depth (parents before children)
  const categoryPaths = new Set<string>();
  for (const row of rows) {
    const raw = row.category?.trim() || "Accessories";
    categoryPaths.add(raw);
  }
  const sorted = Array.from(categoryPaths).sort((a, b) => {
    const aLen = parseCategoryPath(a).length;
    const bLen = parseCategoryPath(b).length;
    return aLen - bLen;
  });

  // Create child categories as needed
  for (const raw of sorted) {
    const parts = parseCategoryPath(raw);
    await getOrCreateCategory(parts, map);
  }

  return map;
}

async function main() {
  const csvPathArg = process.argv[2];
  const defaultPath = path.join(process.cwd(), "dandoy_sports_products.csv");
  const csvPath = csvPathArg || defaultPath;

  if (!fs.existsSync(csvPath)) {
    console.error(
      `CSV file not found: ${csvPath}\nUsage: npx tsx scripts/import-dandoy-sports.ts [path-to-csv]`
    );
    process.exit(1);
  }

  const csvContent = fs.readFileSync(csvPath, "utf-8");
  const parsed = Papa.parse<CsvRow>(csvContent, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    console.error("CSV parse errors:", parsed.errors.slice(0, 5));
    if (parsed.errors.length > 5) console.error(`... and ${parsed.errors.length - 5} more`);
  }

  const rows = parsed.data;
  if (rows.length === 0) {
    console.error("No rows in CSV");
    process.exit(1);
  }

  const resumeMode = process.argv.includes("--resume");
  const updateCategoriesMode = process.argv.includes("--update-categories");
  if (resumeMode) {
    console.log("Resume mode: will skip products that already exist");
  }
  if (updateCategoriesMode) {
    console.log("Update-categories mode: will update category for existing products");
  }

  console.log(`Found ${rows.length} rows in CSV`);

  const categoryMap = await loadCategoryMap(rows);
  console.log("Categories loaded");

  const existingSlugs = new Set(
    (await prisma.product.findMany({ select: { slug: true } })).map((p) => p.slug)
  );
  console.log(`${existingSlugs.size} existing products in DB`);

  let created = 0;
  let skipped = 0;
  let updated = 0;
  let errors = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const name = row.product_title?.trim();
    if (!name) {
      console.warn(`Row ${i + 2}: empty product_title, skipping`);
      skipped++;
      continue;
    }

    const slugFromUrlResult = slugFromUrl(row.url);
    let slug = slugFromUrlResult || slugFromTitle(name);
    const categoryRaw = row.category?.trim() || "Accessories";
    const pathParts = parseCategoryPath(categoryRaw);
    const categoryKey = pathParts.join(" > ");
    const categoryId = categoryMap.get(categoryKey) || categoryMap.get(pathParts[pathParts.length - 1]) || categoryMap.get("accessories")!;

    // In resume/update-categories mode: product exists, optionally update category
    const existingSlug = slugFromUrlResult && existingSlugs.has(slugFromUrlResult) ? slugFromUrlResult : (existingSlugs.has(slug) ? slug : null);
    if ((resumeMode || updateCategoriesMode) && existingSlug) {
      skipped++;
      if (updateCategoriesMode) {
        try {
          const updatedProduct = await prisma.product.updateMany({
            where: { slug: existingSlug },
            data: { categoryId },
          });
          if (updatedProduct.count > 0) {
            updated++;
            if (updated <= 5 || updated % 500 === 0) {
              console.log(`  [update] ${existingSlug} -> ${categoryKey}`);
            }
          }
        } catch (e: unknown) {
          errors++;
          console.error(`Row ${i + 2}: ${name} (update category)`, e);
        }
      } else if (skipped <= 5 || skipped % 500 === 0) {
        console.log(`  [resume] Skipping existing: ${existingSlug}`);
      }
      continue;
    }
    slug = ensureUniqueSlug(slug, existingSlugs);

    const price = parseFloat(row.price?.replace(",", ".") || "0");
    const priceCents = Math.round(price * 100);

    const images = parseImages(row.product_images);
    const imageArray = images.length > 0 ? images : ["/images/placeholder.svg"];

    const shortDesc = (row.description?.trim() || name).slice(0, 300);
    const longDesc = row.description?.trim() || null;

    const tags = [
      ...name
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 2)
        .slice(0, 5),
      row.Manufacturer?.toLowerCase(),
      ...pathParts.map((p) => p.toLowerCase()),
    ].filter(Boolean);

    try {
      const product = await prisma.product.create({
        data: {
          slug,
          name,
          priceCents,
          images: JSON.stringify(imageArray),
          categoryId,
          tags: JSON.stringify(Array.from(new Set(tags))),
          shortDesc,
          longDesc,
          stock: 0,
          trackInventory: false,
        },
      });

      // Add attributes from CSV columns
      const attrMap: Record<string, string> = {
        Colors: row.Colors?.trim() || "",
        MainColor: row.MainColor?.trim() || "",
        Type: row.Type?.trim() || "",
        Pimples: row.Pimples?.trim() || "",
        Hardness: row.Hardness?.trim() || "",
        Manufacturer: row.Manufacturer?.trim() || "",
        "Blade type": row["Blade type"]?.trim() || "",
        Layers: row.Layers?.trim() || "",
        "Blades Feeling": row["Blades Feeling"]?.trim() || "",
        Material: row.Material?.trim() || "",
        Usage: row.Usage?.trim() || "",
      };

      for (const [attrName, valuesStr] of Object.entries(attrMap)) {
        if (!valuesStr) continue;
        const values = valuesStr
          .split(/[,;]/)
          .map((v) => v.trim())
          .filter(Boolean);
        if (values.length === 0) continue;

        await prisma.productAttribute.create({
          data: {
            productId: product.id,
            name: attrName,
            values: JSON.stringify(values),
          },
        });
      }

      created++;
      if (created <= 20 || created % 500 === 0) {
        console.log(`  ${created}. ${name} (${slug})`);
      }
    } catch (e: unknown) {
      errors++;
      console.error(`Row ${i + 2}: ${name}`, e);
      // On first error, log hint about --resume
      if (errors === 1) {
        console.error("\nTip: If import was interrupted, run again with --resume to skip existing products and continue.");
      }
    }
  }

  console.log(`\nDone. Created: ${created}, Skipped: ${skipped}, Updated: ${updated}, Errors: ${errors}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
