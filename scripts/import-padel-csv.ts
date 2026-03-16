/**
 * Import padel products from CSV (padel_dandoy_sports_products.csv)
 *
 * Usage: npx tsx scripts/import-padel-csv.ts [path-to-csv] [--resume]
 * Example: npx tsx scripts/import-padel-csv.ts "d:\Dev Download\BEM Group\padel_dandoy_sports_products.csv"
 * Example: npx tsx scripts/import-padel-csv.ts "d:\Dev Download\BEM Group\padel_dandoy_sports_products.csv" --resume
 *
 * --resume: Skip rows whose slug (from URL) already exists in DB (use if import stopped partway)
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import Papa from "papaparse";

const prisma = new PrismaClient();

type CsvRow = {
  url: string;
  product_title: string;
  description: string;
  Size: string;
  Colors: string;
  Manufacturer: string;
  MainColor: string;
  product_images: string;
  category: string;
  price: string;
};

function slugFromUrl(url: string): string | null {
  if (!url?.trim()) return null;
  try {
    const u = new URL(url);
    const pathname = u.pathname;
    // Try to extract slug from patterns like:
    // /stiga-padel-racket-black-blue.html
    // /catalog/product/view/id/21370/s/stiga-padel-racket-act-black-olive/category/41/
    const htmlMatch = pathname.match(/\/([^/]+)\.html$/);
    if (htmlMatch) return htmlMatch[1].toLowerCase();
    const sMatch = pathname.match(/\/s\/([^/]+)/);
    if (sMatch) return sMatch[1].toLowerCase();
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

async function main() {
  const csvPathArg = process.argv[2];
  const defaultPath = path.join(
    process.cwd(),
    "padel_dandoy_sports_products.csv"
  );
  const csvPath = csvPathArg || defaultPath;

  if (!fs.existsSync(csvPath)) {
    console.error(
      `CSV file not found: ${csvPath}\nUsage: npx tsx scripts/import-padel-csv.ts [path-to-csv]`
    );
    process.exit(1);
  }

  const csvContent = fs.readFileSync(csvPath, "utf-8");
  const parsed = Papa.parse<CsvRow>(csvContent, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    console.error("CSV parse errors:", parsed.errors);
    process.exit(1);
  }

  const rows = parsed.data;
  if (rows.length === 0) {
    console.error("No rows in CSV");
    process.exit(1);
  }

  const resumeMode = process.argv.includes("--resume");
  if (resumeMode) {
    console.log("Resume mode: will skip products that already exist (by URL slug)");
  }

  console.log(`Found ${rows.length} rows in CSV`);

  // Ensure Padel category exists
  const padel = await prisma.category.upsert({
    where: { slug: "padel" },
    create: { name: "Padel", slug: "padel" },
    update: {},
  });
  console.log(`Category: ${padel.name} (${padel.id})`);

  const existingSlugs = new Set(
    (await prisma.product.findMany({ select: { slug: true } })).map(
      (p) => p.slug
    )
  );
  console.log(`${existingSlugs.size} existing products in DB`);

  let created = 0;
  let skipped = 0;
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
    if (resumeMode && slugFromUrlResult && existingSlugs.has(slugFromUrlResult)) {
      skipped++;
      if (skipped <= 5 || skipped % 500 === 0) {
        console.log(`  [resume] Skipping existing: ${slugFromUrlResult}`);
      }
      continue;
    }
    slug = ensureUniqueSlug(slug, existingSlugs);

    const price = parseFloat(row.price?.replace(",", ".") || "0");
    const priceCents = Math.round(price * 100);

    const images = parseImages(row.product_images);
    const imageArray =
      images.length > 0 ? images : ["/images/placeholder.svg"];

    const shortDesc = (row.description?.trim() || name).slice(0, 300);
    const longDesc = row.description?.trim() || null;

    const tags = [
      "padel",
      ...name
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 2)
        .slice(0, 5),
    ];

    try {
      const product = await prisma.product.create({
        data: {
          slug,
          name,
          priceCents,
          images: JSON.stringify(imageArray),
          categoryId: padel.id,
          tags: JSON.stringify(Array.from(new Set(tags))),
          shortDesc,
          longDesc,
          stock: 0,
          trackInventory: false,
        },
      });

      // Add attributes for columns D, E, F, G (Size, Colors, Manufacturer, MainColor)
      const attrMap: Record<string, string> = {
        Size: row.Size?.trim() || "",
        Colors: row.Colors?.trim() || "",
        Manufacturer: row.Manufacturer?.trim() || "",
        MainColor: row.MainColor?.trim() || "",
      };

      for (const [attrName, valuesStr] of Object.entries(attrMap)) {
        if (!valuesStr) continue;
        // Split by comma/semicolon only; "Black/White" is one value
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
      console.log(`  ${created}. ${name} (${slug})`);
    } catch (e: unknown) {
      errors++;
      console.error(`Row ${i + 2}: ${name}`, e);
      if (errors === 1) {
        console.error("\nTip: If import was interrupted, run again with --resume to skip existing products and continue.");
      }
    }
  }

  console.log(`\nDone. Created: ${created}, Skipped: ${skipped}, Errors: ${errors}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
