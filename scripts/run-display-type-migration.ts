/**
 * Run the displayType migration manually.
 * Use when: npx prisma migrate deploy hangs (common with Supabase pooler).
 * Run: npx tsx scripts/run-display-type-migration.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Running displayType migration...");
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "ProductAttribute" ADD COLUMN IF NOT EXISTS "displayType" TEXT NOT NULL DEFAULT 'button';
    `);
    console.log("Added displayType column");
  } catch (e: unknown) {
    if (String(e).includes("already exists")) console.log("displayType column exists");
    else throw e;
  }
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "ProductAttribute" ADD COLUMN IF NOT EXISTS "displayData" TEXT;
    `);
    console.log("Added displayData column");
  } catch (e: unknown) {
    if (String(e).includes("already exists")) console.log("displayData column exists");
    else throw e;
  }
  console.log("Migration complete. Run: npx prisma migrate resolve --applied 20260227000000_add_attribute_display_type");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
