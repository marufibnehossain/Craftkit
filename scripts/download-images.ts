import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import * as crypto from "crypto";

const prisma = new PrismaClient();
const DEST_DIR = "public/uploads/products";
const CONCURRENCY = 50;
const TIMEOUT_MS = 15000;

function urlToFilename(url: string): string {
  const hash = crypto.createHash("md5").update(url).digest("hex");
  const ext = url.match(/\.(jpe?g|png|webp|gif)$/i)?.[0] || ".jpg";
  return hash + ext;
}

function downloadFile(url: string, dest: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (fs.existsSync(dest)) {
      resolve(true);
      return;
    }

    const timeout = setTimeout(() => {
      resolve(false);
    }, TIMEOUT_MS);

    const req = https.get(url, { timeout: TIMEOUT_MS }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        clearTimeout(timeout);
        if (res.headers.location) {
          downloadFile(res.headers.location, dest).then(resolve);
        } else {
          resolve(false);
        }
        return;
      }

      if (res.statusCode !== 200) {
        clearTimeout(timeout);
        res.resume();
        resolve(false);
        return;
      }

      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on("finish", () => {
        clearTimeout(timeout);
        file.close();
        resolve(true);
      });
      file.on("error", () => {
        clearTimeout(timeout);
        fs.unlinkSync(dest);
        resolve(false);
      });
    });

    req.on("error", () => {
      clearTimeout(timeout);
      resolve(false);
    });

    req.on("timeout", () => {
      req.destroy();
      clearTimeout(timeout);
      resolve(false);
    });
  });
}

async function downloadBatch(
  urls: string[],
  urlToLocal: Map<string, string>,
  startIdx: number
): Promise<number> {
  let success = 0;
  const promises = urls.map(async (url) => {
    const filename = urlToFilename(url);
    const dest = path.join(DEST_DIR, filename);
    const ok = await downloadFile(url, dest);
    if (ok) {
      urlToLocal.set(url, `/uploads/products/${filename}`);
      success++;
    }
  });
  await Promise.all(promises);
  return success;
}

async function main() {
  fs.mkdirSync(DEST_DIR, { recursive: true });

  console.log("Collecting all image URLs from database...");

  const allProducts = await prisma.product.findMany({
    select: { id: true, images: true },
  });
  const allVariations = await prisma.productVariation.findMany({
    select: { id: true, productId: true, images: true, attributes: true },
  });
  const allAttributes = await prisma.productAttribute.findMany({
    select: { id: true, productId: true, name: true, values: true, displayType: true },
  });

  const uniqueUrls = new Set<string>();

  for (const p of allProducts) {
    try {
      const imgs: string[] = JSON.parse(p.images);
      imgs.forEach((u) => { if (u.startsWith("http")) uniqueUrls.add(u); });
    } catch {}
  }

  for (const v of allVariations) {
    if (v.images) {
      try {
        const imgs: string[] = JSON.parse(v.images);
        imgs.forEach((u) => { if (u.startsWith("http")) uniqueUrls.add(u); });
      } catch {}
    }
  }

  const allUrls = [...uniqueUrls];
  console.log(`Found ${allUrls.length} unique image URLs to download`);

  const urlToLocal = new Map<string, string>();

  const alreadyExists = allUrls.filter((url) => {
    const filename = urlToFilename(url);
    const dest = path.join(DEST_DIR, filename);
    if (fs.existsSync(dest)) {
      urlToLocal.set(url, `/uploads/products/${filename}`);
      return true;
    }
    return false;
  });

  console.log(`${alreadyExists.length} already downloaded, ${allUrls.length - alreadyExists.length} remaining`);

  const toDownload = allUrls.filter((url) => !urlToLocal.has(url));
  let downloaded = 0;
  let failed = 0;

  for (let i = 0; i < toDownload.length; i += CONCURRENCY) {
    const batch = toDownload.slice(i, i + CONCURRENCY);
    const ok = await downloadBatch(batch, urlToLocal, i);
    downloaded += ok;
    failed += batch.length - ok;

    if ((i + CONCURRENCY) % 200 === 0 || i + CONCURRENCY >= toDownload.length) {
      console.log(
        `  Progress: ${Math.min(i + CONCURRENCY, toDownload.length)}/${toDownload.length} ` +
        `(${downloaded} ok, ${failed} failed)`
      );
    }
  }

  console.log(`\nDownload complete: ${downloaded} succeeded, ${failed} failed`);
  console.log("Updating database records...");

  let prodUpdated = 0;
  for (const p of allProducts) {
    try {
      const imgs: string[] = JSON.parse(p.images);
      const newImgs = imgs.map((u) => urlToLocal.get(u) || u);
      if (JSON.stringify(newImgs) !== JSON.stringify(imgs)) {
        await prisma.product.update({
          where: { id: p.id },
          data: { images: JSON.stringify(newImgs) },
        });
        prodUpdated++;
      }
    } catch {}
  }

  let varUpdated = 0;
  for (const v of allVariations) {
    if (v.images) {
      try {
        const imgs: string[] = JSON.parse(v.images);
        const newImgs = imgs.map((u) => urlToLocal.get(u) || u);
        if (JSON.stringify(newImgs) !== JSON.stringify(imgs)) {
          await prisma.productVariation.update({
            where: { id: v.id },
            data: { images: JSON.stringify(newImgs) },
          });
          varUpdated++;
        }
      } catch {}
    }
  }

  console.log(`Updated ${prodUpdated} products, ${varUpdated} variations with local paths`);

  console.log("Updating product attributes to use image swatches...");

  const variationsByProduct = new Map<string, typeof allVariations>();
  for (const v of allVariations) {
    const list = variationsByProduct.get(v.productId) || [];
    list.push(v);
    variationsByProduct.set(v.productId, list);
  }

  let attrUpdated = 0;
  for (const attr of allAttributes) {
    const vars = variationsByProduct.get(attr.productId) || [];
    const displayData: Record<string, string> = {};

    for (const v of vars) {
      try {
        const attrs = JSON.parse(v.attributes) as Record<string, string>;
        const value = attrs[attr.name];
        if (value && v.images) {
          const imgs: string[] = JSON.parse(v.images);
          const localPath = imgs[0];
          if (localPath) {
            displayData[value] = localPath;
          }
        }
      } catch {}
    }

    if (Object.keys(displayData).length > 0) {
      await prisma.productAttribute.update({
        where: { id: attr.id },
        data: {
          displayType: "image",
          displayData: JSON.stringify(displayData),
        },
      });
      attrUpdated++;
    }
  }

  console.log(`Updated ${attrUpdated} attributes to image swatch type`);

  const totalFiles = fs.readdirSync(DEST_DIR).length;
  console.log(`\nDone! ${totalFiles} image files in ${DEST_DIR}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
