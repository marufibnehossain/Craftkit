/**
 * Mark migration as applied in _prisma_migrations table.
 * Run: npx tsx scripts/mark-migration-applied.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const migrationName = "20260227000000_add_attribute_display_type";
  const checksum = "manual_run";
  await prisma.$executeRawUnsafe(
    `INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
     SELECT gen_random_uuid()::text, $1, NOW(), $2, NULL, NULL, NOW(), 1
     WHERE NOT EXISTS (SELECT 1 FROM "_prisma_migrations" WHERE migration_name = $2)`,
    checksum,
    migrationName
  );
  console.log(`Migration ${migrationName} marked as applied.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
