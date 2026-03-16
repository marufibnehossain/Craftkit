# Apply blog migration in Supabase (when Prisma CLI is stuck)

If `prisma migrate deploy` or `prisma migrate resolve` hangs (e.g. advisory lock timeout with Supabase), apply the blog migration directly in Supabase:

1. **Stop any running baseline/migrate** (Ctrl+C).

2. **Open Supabase Dashboard** → your project → **SQL Editor** → **New query**.

3. **Copy the entire contents** of `prisma/apply-blog-manually.sql` and paste into the editor.

4. **Run** the query (Run button or Ctrl+Enter).

5. If you see an error on the `INSERT INTO "_prisma_migrations"` part (e.g. column name mismatch), that’s okay:
   - The blog tables will already be created by the first part of the script.
   - You can ignore the insert and just run the seed (step 6). Avoid running `prisma migrate deploy` on this database in the future, or Prisma may try to create the blog tables again and fail.

6. **Seed the blog data** from your machine (uses your normal `DATABASE_URL`; no advisory lock):
   ```powershell
   npx prisma db seed
   ```
   If seed fails because of the blog section, you can add blog categories and posts from the admin UI (**Blog categories**, **Blog posts**) after the app is running.

7. **Done.** The app and blog page will work. You don’t need to run the baseline script or `migrate deploy` for the blog.
