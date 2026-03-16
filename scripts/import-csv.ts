import { PrismaClient } from "@prisma/client";
import * as fs from "fs";

const prisma = new PrismaClient();

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (line[i] === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += line[i];
    }
  }
  result.push(current);
  return result;
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface VariableRow {
  sku: string;
  title: string;
  subtitle: string;
  category: string;
  totalReview: number;
  reviewRate: number;
  oldPrice: number;
  newPrice: number;
  discount: number;
  brand: string;
  blend: string;
  length: string;
  needles: string;
  netWeight: string;
  tension: string;
  crochetHooks: string;
  description: string;
  productImages: string[];
  attributeName: string;
  attributeValue: string;
}

interface VariationRow {
  sku: string;
  parentSku: string;
  position: number;
  image: string;
  attributeName: string;
  attributeValue: string;
}

async function main() {
  const csvPath = "attached_assets/lovecrafts_products_update_1773238493989.csv";
  const raw = fs.readFileSync(csvPath, "utf-8");
  const lines = raw.split("\n");
  const header = parseCSVLine(lines[0]);

  const col = (name: string) => header.indexOf(name);

  const variables: VariableRow[] = [];
  const variations: VariationRow[] = [];
  const skuToVar = new Map<string, VariableRow>();

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const f = parseCSVLine(line);
    const type = f[col("type")];

    if (type === "variable") {
      const v: VariableRow = {
        sku: f[col("sku")]?.trim(),
        title: f[col("Product_title")]?.trim(),
        subtitle: f[col("Sub_title")]?.trim(),
        category: f[col("category")]?.trim(),
        totalReview: parseInt(f[col("total_review")]) || 0,
        reviewRate: parseFloat(f[col("review_rate")]) || 0,
        oldPrice: parseFloat(f[col("old_price")]) || 0,
        newPrice: parseFloat(f[col("new_price")]) || 0,
        discount: parseFloat(f[col("discount")]) || 0,
        brand: f[col("Brand")]?.trim() || "",
        blend: f[col("Blend")]?.trim() || "",
        length: f[col("Length")]?.trim() || "",
        needles: f[col("Needles")]?.trim() || "",
        netWeight: f[col("Net Weight")]?.trim() || "",
        tension: f[col("Tension")]?.trim() || "",
        crochetHooks: f[col("Crochet Hooks")]?.trim() || "",
        description: f[col("description")]?.trim() || "",
        productImages: (f[col("product_images")] || "")
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean),
        attributeName: f[col("attributes_name")]?.trim() || "",
        attributeValue: f[col("attributes_value")]?.trim() || "",
      };
      if (v.sku && v.title) {
        variables.push(v);
        skuToVar.set(v.sku, v);
      }
    } else if (type === "variation") {
      const vr: VariationRow = {
        sku: f[col("sku")]?.trim(),
        parentSku: f[col("parent")]?.trim(),
        position: parseInt(f[col("position")]) || 0,
        image: f[col("product_images")]?.trim() || "",
        attributeName: f[col("attributes_name")]?.trim() || "",
        attributeValue: f[col("attributes_value")]?.trim() || "",
      };
      if (vr.parentSku) {
        variations.push(vr);
      }
    }
  }

  console.log(`Parsed ${variables.length} products, ${variations.length} variations`);

  const allCategories = new Set<string>();
  for (const v of variables) {
    if (v.category) allCategories.add(v.category);
  }

  console.log(`Found ${allCategories.size} unique categories`);
  console.log("Deleting existing data...");

  await prisma.orderItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productVariation.deleteMany();
  await prisma.productAttribute.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  console.log("Deleted all existing products and categories");

  const categoryIdMap = new Map<string, string>();

  const parentCats = new Set<string>();
  const childCats = new Map<string, string>();

  for (const catPath of allCategories) {
    const parts = catPath.split(">").map((s) => s.trim());
    if (parts.length === 1) {
      parentCats.add(parts[0]);
    } else {
      parentCats.add(parts[0]);
      childCats.set(catPath, parts[0]);
    }
  }

  for (const parentName of parentCats) {
    const cat = await prisma.category.create({
      data: {
        name: parentName,
        slug: slugify(parentName),
      },
    });
    categoryIdMap.set(parentName, cat.id);
    console.log(`  Created parent category: ${parentName}`);
  }

  for (const [fullPath, parentName] of childCats) {
    const childName = fullPath.split(">").map((s) => s.trim()).pop()!;
    const parentId = categoryIdMap.get(parentName)!;
    const slug = slugify(fullPath.replace(">", "-"));
    const cat = await prisma.category.create({
      data: {
        name: childName,
        slug,
        parentId,
      },
    });
    categoryIdMap.set(fullPath, cat.id);
    console.log(`  Created child category: ${childName} (under ${parentName})`);
  }

  const variationsByParent = new Map<string, VariationRow[]>();
  for (const vr of variations) {
    const list = variationsByParent.get(vr.parentSku) || [];
    list.push(vr);
    variationsByParent.set(vr.parentSku, list);
  }

  const BATCH = 50;
  let created = 0;

  for (let b = 0; b < variables.length; b += BATCH) {
    const batch = variables.slice(b, b + BATCH);

    await prisma.$transaction(
      async (tx) => {
        for (const v of batch) {
          const categoryId = categoryIdMap.get(v.category) || categoryIdMap.get("Yarns") || [...categoryIdMap.values()][0];

          const priceCents = Math.round((v.newPrice || v.oldPrice) * 100);
          const compareAtCents = v.oldPrice > (v.newPrice || 0) ? Math.round(v.oldPrice * 100) : undefined;

          const shortDesc = v.subtitle || "";
          const specs: string[] = [];
          if (v.brand) specs.push(`<strong>Brand:</strong> ${v.brand}`);
          if (v.blend) specs.push(`<strong>Blend:</strong> ${v.blend}`);
          if (v.length) specs.push(`<strong>Length:</strong> ${v.length}`);
          if (v.netWeight) specs.push(`<strong>Weight:</strong> ${v.netWeight}`);
          if (v.needles) specs.push(`<strong>Needles:</strong> ${v.needles}`);
          if (v.crochetHooks) specs.push(`<strong>Crochet Hooks:</strong> ${v.crochetHooks}`);
          if (v.tension) specs.push(`<strong>Tension:</strong> ${v.tension}`);

          let longDesc = v.description || "";
          if (specs.length > 0) {
            longDesc += `<br/><br/><h3>Specifications</h3><ul>${specs.map((s) => `<li>${s}</li>`).join("")}</ul>`;
          }

          const slug = slugify(v.title) + "-" + v.sku.toLowerCase();
          const productVars = variationsByParent.get(v.sku) || [];

          const attrValues = productVars
            .filter((pv) => pv.attributeValue)
            .sort((a, b) => a.position - b.position)
            .map((pv) => pv.attributeValue);
          const uniqueValues = [...new Set(attrValues)];

          const attrName = productVars.find((pv) => pv.attributeName)?.attributeName || v.attributeName || "Color";

          const product = await tx.product.create({
            data: {
              slug,
              productCode: v.sku,
              name: v.title,
              priceCents,
              compareAtCents,
              rating: v.reviewRate,
              reviewCount: v.totalReview,
              images: JSON.stringify(v.productImages),
              categoryId,
              tags: JSON.stringify([v.brand, v.blend].filter(Boolean)),
              shortDesc,
              longDesc,
              stock: 999,
              trackInventory: false,
            },
          });

          if (uniqueValues.length > 0) {
            const displayType = attrName === "Color" ? "swatch" : "button";

            await tx.productAttribute.create({
              data: {
                productId: product.id,
                name: attrName,
                values: JSON.stringify(uniqueValues),
                displayType,
              },
            });

            for (const pv of productVars) {
              const images = pv.image ? [pv.image] : [];
              await tx.productVariation.create({
                data: {
                  productId: product.id,
                  attributes: JSON.stringify({ [attrName]: pv.attributeValue }),
                  sku: pv.sku,
                  stock: 999,
                  images: images.length > 0 ? JSON.stringify(images) : undefined,
                },
              });
            }
          }

          created++;
        }
      },
      { timeout: 120000 }
    );

    console.log(`  Imported ${Math.min(b + BATCH, variables.length)}/${variables.length} products...`);
  }

  console.log(`\nDone! Created ${created} products with their variations.`);
  const productCount = await prisma.product.count();
  const variationCount = await prisma.productVariation.count();
  const categoryCount = await prisma.category.count();
  console.log(`Database: ${productCount} products, ${variationCount} variations, ${categoryCount} categories`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
