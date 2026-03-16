import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as crypto from "crypto";

const prisma = new PrismaClient();
const CSV_FILE = "./attached_assets/lovecrafts_products_update_1773238493989.csv";

function md5(s: string) {
  return crypto.createHash("md5").update(s).digest("hex");
}

function localPathFromUrl(url: string): string {
  const ext = url.match(/\.(jpe?g|png|webp|gif)/i)?.[0] || ".jpg";
  return `/uploads/products/${md5(url)}${ext}`;
}

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { field += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      fields.push(field); field = "";
    } else {
      field += ch;
    }
  }
  fields.push(field);
  return fields;
}

async function main() {
  const raw = fs.readFileSync(CSV_FILE, "utf8");
  const lines = raw.split(/\r?\n/).filter(Boolean);
  const headers = parseCSVLine(lines[0]);
  const col = (name: string) => headers.indexOf(name);

  const typeIdx = col("type");
  const skuIdx = col("sku");
  const parentIdx = col("parent");
  const imgIdx = col("product_images");

  // Build map: localPath -> cdnUrl
  const localToCdn = new Map<string, string>();

  for (let i = 1; i < lines.length; i++) {
    const f = parseCSVLine(lines[i]);
    const type = f[typeIdx]?.trim();
    const imgField = f[imgIdx]?.trim() || "";

    // Parse image URLs (may be comma-separated or single)
    const urls = imgField.split(/,\s*(?=https?:\/\/)/).map(u => u.trim()).filter(u => u.startsWith("http"));

    for (const url of urls) {
      const local = localPathFromUrl(url);
      localToCdn.set(local, url);
    }
  }

  console.log(`Built reverse map with ${localToCdn.size} entries`);

  function parseImgs(raw: unknown): string[] {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw as string[];
    if (typeof raw === "string") {
      try { const p = JSON.parse(raw); return Array.isArray(p) ? p : []; } catch { return []; }
    }
    return [];
  }

  // Update Product images
  const products = await prisma.product.findMany({ select: { id: true, images: true } });
  let productUpdated = 0;
  for (const p of products) {
    const imgs = parseImgs(p.images);
    const restored = imgs.map(img => localToCdn.get(img) || img);
    if (restored.some((r, i) => r !== imgs[i])) {
      await prisma.product.update({ where: { id: p.id }, data: { images: JSON.stringify(restored) } });
      productUpdated++;
    }
  }
  console.log(`Updated images for ${productUpdated} products`);

  // Update ProductVariation images
  const variations = await prisma.productVariation.findMany({ select: { id: true, images: true } });
  let varUpdated = 0;
  for (const v of variations) {
    const imgs = parseImgs(v.images);
    if (imgs.length === 0) continue;
    const restored = imgs.map(img => localToCdn.get(img) || img);
    if (restored.some((r, i) => r !== imgs[i])) {
      await prisma.productVariation.update({ where: { id: v.id }, data: { images: JSON.stringify(restored) } });
      varUpdated++;
    }
  }
  console.log(`Updated images for ${varUpdated} variations`);

  // Update ProductAttribute displayData (color swatches)
  const attrs = await prisma.productAttribute.findMany({ select: { id: true, displayData: true } });
  let attrUpdated = 0;
  for (const a of attrs) {
    if (!a.displayData) continue;
    const dd = (typeof a.displayData === 'string' ? JSON.parse(a.displayData) : a.displayData) as unknown as Record<string, string>;
    let changed = false;
    const updated: Record<string, string> = {};
    for (const [k, v] of Object.entries(dd)) {
      const cdn = localToCdn.get(v);
      if (cdn) { updated[k] = cdn; changed = true; }
      else updated[k] = v;
    }
    if (changed) {
      await prisma.productAttribute.update({ where: { id: a.id }, data: { displayData: updated } });
      attrUpdated++;
    }
  }
  console.log(`Updated displayData for ${attrUpdated} attributes`);

  await prisma.$disconnect();
  console.log("Done! Image URLs restored to CDN. You can now redeploy without the 7GB images.");
}

main().catch(console.error);
