# Running migrations with Supabase

Supabase’s **pooled** connection (port 5432) does not support advisory locks, so `prisma migrate` will time out if it uses the pooler.

Use the **Direct** connection for migrations.

## 1. Get the Direct connection string

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. Go to **Project Settings** (gear) → **Database**.
3. Under **Connection string**, select the **“Direct connection”** tab (or “Session mode”).
4. Copy the URI. It should use **port 6543** (not 5432). It may look like:
   - `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`
   - or `postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres` (some projects use 5432 for direct; use whatever the dashboard shows for “Direct”).

## 2. Add DIRECT_URL to `.env`

Keep your existing `DATABASE_URL` (pooler is fine for the app). Add a **second** variable, `DIRECT_URL`, and paste the **Direct** connection string:

```env
# App uses this (pooler is fine)
DATABASE_URL="postgresql://postgres.xxx:...@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?pgbouncer=..."

# Migrations use this (Direct connection – required for Supabase)
DIRECT_URL="postgresql://postgres.xxx:...@aws-1-ap-south-1.pooler.supabase.com:6543/postgres"
```

Use the exact host and port from the “Direct connection” string in the dashboard (often the same host with port **6543**).

## 3. Run migrations

```powershell
.\prisma\baseline.ps1
npx prisma migrate deploy
npx prisma db seed
```

After this, you can keep both variables in `.env`; the app keeps using `DATABASE_URL`, and Prisma CLI uses `DIRECT_URL` for migrate/resolve.
