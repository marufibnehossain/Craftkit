-- AlterTable (IF NOT EXISTS for idempotency if run manually first)
ALTER TABLE "ProductAttribute" ADD COLUMN IF NOT EXISTS "displayType" TEXT NOT NULL DEFAULT 'button';
ALTER TABLE "ProductAttribute" ADD COLUMN IF NOT EXISTS "displayData" TEXT;
