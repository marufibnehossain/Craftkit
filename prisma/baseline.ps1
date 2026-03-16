# Mark all existing migrations (except add_blog) as already applied.
# Run from project root: .\prisma\baseline.ps1
# If you get "timed out trying to acquire a postgres advisory lock" (Supabase),
#   use the Direct connection URL (port 6543) as DATABASE_URL in .env when running this.

$migrations = @(
  "20260220000000_init",
  "20260220000001_add_password_reset",
  "20260220000002_add_coupons",
  "20260220000003_admin_and_orders",
  "20260220000004_add_products",
  "20260220000005_add_variations",
  "20260220000006_order_item_variations",
  "20260220000007_add_reviews",
  "20260220000008_add_addresses",
  "20260220000009_track_inventory",
  "20260220100000_add_features"
)

foreach ($m in $migrations) {
  Write-Host "Marking as applied: $m"
  npx prisma migrate resolve --applied $m
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

Write-Host "Done. Now run: npx prisma migrate deploy"
