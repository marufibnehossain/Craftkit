# New Store Checklist — Copy This Project

Use this checklist when you create a **new store** from this repo. Same features (auth, cart, checkout, admin, wishlist, reviews, coupons, etc.); you only change **design**, **branding**, and **niche** (categories/products).

---

## Step 1: Copy the project

1. **Clone or copy** this repo into a new folder (e.g. `MyNewStore`).
2. **Create a new Git repo** (e.g. new GitHub repo) and connect it:
   ```bash
   cd MyNewStore
   rm -rf .git
   git init
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_NEW_REPO.git
   ```
3. **New database**: Create a new Supabase (or Neon) project and copy the Postgres `DATABASE_URL`. You’ll use it in Step 4.

---

## Step 2: Design (colors, fonts, look & feel)

### 2.1 Design tokens — `src/app/globals.css`

Update the CSS variables in `:root` to your new palette:

| Variable     | Current (Velvety) | What to do |
|-------------|-------------------|------------|
| `--bg`      | `#faf8f5`         | Page background |
| `--surface` | `#f5f2ed`         | Cards, panels |
| `--sage-1`  | `#e8ebe6`         | Light accent |
| `--sage-2`  | `#d4dcd4`         | Mid accent |
| `--sage-dark` | `#4a5c4a`       | Buttons, headings, dark accent |
| `--hero-text` | `#eef0eb`       | Text on dark (hero) |
| `--text`    | `#2c332c`         | Body text |
| `--muted`   | `#6b736b`         | Secondary text |
| `--border`  | `#e0e4e0`         | Borders |

You can keep the same variable names and only change the hex values, or rename (e.g. `sage-*` → `brand-*`) and then update `tailwind.config.ts` to match.

### 2.2 Tailwind — `tailwind.config.ts`

- If you renamed CSS variables in `globals.css`, update the `theme.extend.colors` and `theme.extend.fontFamily` keys here so they still point to your `var(--...)` names.
- Optional: add new color names or spacing for your design.

### 2.3 Fonts — `src/app/layout.tsx`

- Replace `Playfair_Display` and `Source_Sans_3` with your fonts (e.g. from `next/font/google`).
- Update the `variable` names if you use something other than `--font-display` and `--font-sans` (and keep those in sync with `tailwind.config.ts`).

### 2.4 Components that carry the most “look”

Restyle as needed; structure can stay the same.

| File | Purpose |
|------|--------|
| `src/components/Header.tsx` | Logo text, nav, cart; uses `sage-dark`, `border`, etc. |
| `src/components/Footer.tsx` | Footer copy, links, brand name |
| `src/components/Button.tsx` | Primary/secondary button styles |
| `src/components/ProductCard.tsx` | Product grid card (image, title, price, etc.) |
| `src/components/StoreShell.tsx` | Wrapper layout (header + footer) |
| `src/app/page.tsx` | Homepage hero, sections, testimonials |
| `src/app/checkout/page.tsx` | Checkout form layout |
| `src/app/cart/page.tsx` | Cart table/cards |

Use your new `globals.css` tokens (e.g. `bg-sage-dark`, `text-sage-dark`) so one place (globals) drives the whole theme.

---

## Step 3: Niche & branding

### 3.1 Brand name and copy (search for “Velvety” / “velvety”)

Replace **brand name** and **tagline/copy** in these files:

| File | What to change |
|------|----------------|
| `src/app/layout.tsx` | `metadata.title`, `metadata.description` (e.g. "Velvety — Beauty & Wellness" → "YourStore — Your Tagline") |
| `src/components/Header.tsx` | Logo text: `Velvety` |
| `src/components/Footer.tsx` | Brand name "Velvety", email "hello@velvety.com", "© 2026 Velvety" |
| `src/app/admin/layout.tsx` | "Velvety Admin" in sidebar/title |
| `src/app/admin/login/page.tsx` | "Velvety Admin" |
| `src/app/contact/page.tsx` | Email e.g. "hello@velvety.com" |
| `src/app/product/[slug]/page.tsx` | `title` (e.g. `${product.name} \| Velvety`), `baseUrl` fallback "https://velvety.example.com" |
| `src/app/page.tsx` | Hero alt text "Velvety product", brand story "Velvety beauty and skincare company", testimonial quote mentioning "Velvety" |
| `src/app/about/page.tsx` | Title and body copy "Velvety beauty and skincare company", "Velvety started with..." |
| `src/lib/email.ts` | Subject lines and signatures: "Verify your Velvety account", "Your Velvety order confirmation", "Reset your Velvety password", "— Velvety" |

### 3.2 LocalStorage / store keys (optional but recommended)

So the new store doesn’t share cart/wishlist with the old one:

| File | Key | Change to |
|------|-----|-----------|
| `src/lib/cart-store.ts` | `velvety-cart` | e.g. `mynewstore-cart` |
| `src/lib/wishlist-store.ts` | `velvety-wishlist` | e.g. `mynewstore-wishlist` |
| `src/lib/recently-viewed-store.ts` | `velvety-recently-viewed` | e.g. `mynewstore-recently-viewed` |

Use a short, unique slug for your store.

### 3.3 Categories and products — `prisma/seed.ts`

- Replace the `categories` array with **your** categories (id, name, slug).
- Replace the `products` array with **your** products (same shape: id, slug, productCode, name, priceCents, compareAtCents, rating, reviewCount, images, categoryId, tags, shortDesc, longDesc, ingredients, howToUse, stock).
- Optionally change coupon codes/values or add new coupons (same `prisma.coupon.upsert` pattern).

If you use `prisma/seed-products.ts` or another seed file, update that too so all seed data matches your niche.

### 3.4 Homepage and about copy

- `src/app/page.tsx`: Hero headline, subtext, “Brand story” paragraph, testimonial (name, quote), any “As seen in” or partner logos.
- `src/app/about/page.tsx`: Full about page text and title.

### 3.5 Public assets

- Replace `public/images/` placeholders (e.g. logo, hero, product placeholders) with your own.
- Add or replace `favicon.ico` in `public/` if you use one (and reference it in `src/app/layout.tsx` metadata if needed).

---

## Step 4: Environment and config

### 4.1 `.env` and `.env.example`

Copy `.env.example` to `.env` and set:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | **New** Postgres URL (Supabase/Neon) for this store |
| `NEXTAUTH_URL` | Root URL of the new site (e.g. `https://mynewstore.onrender.com`) |
| `NEXTAUTH_SECRET` | New secret: `openssl rand -base64 32` |
| `RESEND_API_KEY` | Your Resend API key (same or new) |
| `RESEND_FROM_EMAIL` | Sender e.g. `YourStore <onboarding@resend.dev>` or your verified domain |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | If you use Supabase client features; point to **new** project if separate |
| `NEXT_PUBLIC_SITE_URL` | Optional; same as `NEXTAUTH_URL` for canonical URLs / emails |

Update `.env.example` with the same variable names and placeholder values (no secrets) so the next deploy/docs stay correct.

### 4.2 Package name (optional)

In `package.json`, change `"name"` from `"ecommerce"` to e.g. `"mynewstore"` if you want.

---

## Step 5: Deploy (e.g. Render)

1. Push the new repo to GitHub.
2. Create a **new** Web Service on Render linked to the **new** repo.
3. In Render: set **Build Command** (and optionally Pre-deploy) as in `RENDER_DEPLOYMENT.md`; set **Environment** to the new `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, Resend vars, and optional `NEXT_PUBLIC_SITE_URL`.
4. After first deploy, run migrations/seed from Render (or Pre-deploy/Build command) so the new DB has schema + seed data.

Use the same steps as this project (see `RENDER_DEPLOYMENT.md`, `LAUNCH_CHECKLIST.md`), but with the new env and URL.

---

## Quick reference: files to touch

| Category | Files |
|----------|--------|
| **Design** | `src/app/globals.css`, `tailwind.config.ts`, `src/app/layout.tsx`, `src/components/Header.tsx`, `Footer.tsx`, `Button.tsx`, `ProductCard.tsx`, `StoreShell.tsx`, `src/app/page.tsx`, `cart/page.tsx`, `checkout/page.tsx` |
| **Branding / copy** | `src/app/layout.tsx`, `Header.tsx`, `Footer.tsx`, `admin/layout.tsx`, `admin/login/page.tsx`, `contact/page.tsx`, `product/[slug]/page.tsx`, `page.tsx`, `about/page.tsx`, `src/lib/email.ts` |
| **Storage keys** | `src/lib/cart-store.ts`, `src/lib/wishlist-store.ts`, `src/lib/recently-viewed-store.ts` |
| **Niche data** | `prisma/seed.ts` (and any other seed files) |
| **Env** | `.env`, `.env.example` |
| **Assets** | `public/images/*`, `public/favicon.ico` (if used) |

---

## After you’re done

- Run `npm run build` and fix any type/lint errors.
- Run `npx prisma db push` (or migrate) and `npx prisma db seed` against the new DB once (or rely on Render Pre-deploy/Build).
- Test: sign up, login, cart, checkout, admin, and one product flow end-to-end.

You now have a second store with the same features and a different design and niche.
