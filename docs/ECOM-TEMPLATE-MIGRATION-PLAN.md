# E-Commerce Template Migration Plan

> **Goal:** Transform this project into a **generic e-commerce template** by removing Spin Kit–specific content and extra pages. Changes are made **in place** in this project (another copy is saved separately).

---

## 1. Scope & Approach

- **In-place changes** — Modify this project directly; no migration to another repo.
- **Homepage** — Keep `/` as the homepage route. Use a minimal/placeholder layout for now; add content later.
- **Shop & product pages** — Keep `/products` and `/product/[slug]` working as before.
- **Removal** — Remove About, Contact, FAQ pages and their nav links.

---

## 2. What to Keep vs Remove (Decisions)

### Keep (Full E-Commerce System)
- **Products** – listing, detail, search, filters
- **Cart, wishlist, checkout** – including thank you page
- **Receipt download** – PDF for purchased orders
- **Email system** – order confirmation, password reset, verification (replace branding only)
- **Account** – login, register, orders, addresses, settings
- **Currency & recently viewed** stores
- **Admin panel** – products, orders, coupons, categories, reviews, payment settings
- **Blog** – full feature (listing, [slug], admin CRUD) — keep everything except Spin Kit data
- **Legal pages** – Terms, Privacy, Refund Policy (keep pages; content = generic placeholders; redesign per project)

### Remove (Extra Pages to Build Per Project)
- **About** page (`/about`)
- **Contact** page (`/contact`)
- **FAQ** page (`/faq`)

### Keep but Replace Branding
- Email templates, receipt PDF – use config for site name/contact
- Legal pages – replace "Spinkit" with config; keep structure for redesign per project

---

## 3. Project Overview (Current State)

This is a **Next.js 14** e-commerce app with:

- **Tech stack:** Next.js App Router, TypeScript, TailwindCSS, Prisma (PostgreSQL), NextAuth, Zustand
- **Features:** Products, cart, checkout, wishlist, accounts, admin panel, blog, reviews, coupons, newsletter, multi-currency
- **Original design spec:** `Context.md` describes a **skincare/nature** theme (sage green, cream palette) — but the current build is **Spin Kit Shop** (table tennis)

---

## 4. Memory from Previous Project

From agent transcript [5a7a3b2a-4044-496a-938e-745cce4e2545](agent-transcripts/5a7a3b2a-4044-496a-938e-745cce4e2545):  
The goal is to turn this into a reusable e-commerce template by stripping Spin Kit–specific content and data.

---

## 5. Spin Kit / Table Tennis–Specific Content to Remove or Parameterize

### 5.1 Branding & Metadata

| Location | Current | Action |
|----------|---------|--------|
| `src/app/layout.tsx` | `"Spinkit — Table Tennis Equipment"`, `"Play Better. Play Stronger. Play Smarter."` | Use env/config: `NEXT_PUBLIC_SITE_NAME`, `NEXT_PUBLIC_SITE_TAGLINE` |
| `src/app/layout.tsx` | `icons.icon: "/images/fav-icon.png"` | Use configurable path or placeholder |
| `src/app/product/[slug]/page.tsx` | `title: \`${product.name} \| Spinkit\`` | Use `NEXT_PUBLIC_SITE_NAME` |
| `src/app/admin/login/page.tsx` | "Spinkit Admin" | Use `{SITE_NAME} Admin` |
| `src/app/admin/layout.tsx` | "Spinkit Admin" | Same |

### 5.2 Contact & Legal

| Location | Current | Action |
|----------|---------|--------|
| `src/components/Footer.tsx` | Logo, "hello@spinkitshop.com", "+421 905 557" | Use env: `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_CONTACT_PHONE`, `NEXT_PUBLIC_LOGO_URL` |
| `src/app/terms/page.tsx` | "Spinkit", "hello@spinkitshop.com" | Generic placeholder text + config (redesign per project) |
| `src/app/privacy/page.tsx` | "Spinkit", "hello@spinkitshop.com" | Same |
| `src/app/refund-policy/page.tsx` | "Spinkit", "hello@spinkitshop.com", "+421 905 557" | Same |
| `src/app/contact/page.tsx` | Contact form | **REMOVE** (build per project) |

### 5.3 Email Templates

| Location | Current | Action |
|----------|---------|--------|
| `src/lib/email.ts` | "Spinkit", "hello@spinkit.shop", subject lines | Use `SMTP_FROM_EMAIL`, `CONTACT_EMAIL`, `NEXT_PUBLIC_SITE_NAME` |

### 5.4 Receipt PDF

| Location | Current | Action |
|----------|---------|--------|
| `src/app/api/order/[orderId]/receipt/route.ts` | "Spinkit", "hello@spinkit.shop", "+421 905 557" | Use config/env |

### 5.5 Zustand Storage Keys

| Store | Current Key | New Key |
|-------|-------------|---------|
| `src/lib/cart-store.ts` | `spinkit-cart` | `ecommerce-cart` |
| `src/lib/wishlist-store.ts` | `spinkit-wishlist` | `ecommerce-wishlist` |
| `src/lib/currency-store.ts` | `spinkit-currency` | `ecommerce-currency` |
| `src/lib/recently-viewed-store.ts` | `spinkit-recently-viewed` | `ecommerce-recently-viewed` |
| `src/app/checkout/page.tsx` | `spinkit-checkout-saved` | `ecommerce-checkout-saved` |

### 5.6 Seed Data

| Location | Current | Action |
|----------|---------|--------|
| `prisma/seed.ts` | `admin@spinkit.shop`, table tennis categories (Rubbers, Blades, Bats, Balls, Cleaners & Glue, Accessories) | Use `ADMIN_EMAIL` env, generic categories (e.g. "Uncategorized", "Featured") |
| `prisma/seed.ts` | Blog categories: Tips & Tricks, Equipment Reviews, Player Stories, Training, Technique | Generic: "News", "Tips", "Updates" |
| `prisma/seed.ts` | Blog posts: topspin, racket choice, training drills | **Remove** Spin Kit data; use 1–2 generic samples or none |

### 5.7 Static Data (`src/lib/data.ts`)

| Item | Current | Action |
|------|---------|--------|
| `categories` | Rubbers, Blades, Bats, Balls, Cleaners & Glue, Accessories | Remove; drive from DB only |
| `filterTags` | Same table tennis categories | Drive from DB |
| `asSeenInLogos` | ITTF, Donic, Joola, Butterfly, Stiga | Make configurable or remove |
| `products` (legacy) | Skincare mock products | Keep as type-only; data from DB |

### 5.8 Header Navigation

| Location | Current | Action |
|----------|---------|--------|
| `src/components/Header.tsx` | `TOP_NAV_SLUGS`, `MORE_NAV_SLUGS` (rubbers, blades, bats, etc.) | Drive from DB categories |
| `src/components/Header.tsx` | Logo: `spinkit-shop-logo.png`, `Logo-Black.png` | Use configurable paths |

### 5.9 Home Page Sections (Copy & Images)

**Homepage (`/`) stays** — minimal/placeholder for now; add content later.

| Component | Spin Kit Content | Action |
|-----------|------------------|--------|
| `HomeHero.tsx` | "table tennis gear crafted for precision and power", Hero-Section.png, person-image.png | Replace with minimal placeholder hero (or simple CTA to shop) |
| `InspiredBySection.tsx` | "table tennis equipment", "blades, rubbers, balls, accessories", image-one/two/three.png | Remove or replace with minimal section |
| `PassionQualitySection.tsx` | "Table Tennis", "blades, rubbers, balls, accessories", about.png | Remove or replace with minimal section |
| `PerformanceEditSection.tsx` | "professional blades, high-spin rubbers, competition-ready gear", performance-img1/2.png | Remove or replace with minimal section |
| `DiscoverCategoriesSection.tsx` | "Equipment Categories" | Keep if useful; genericize copy |
| `BottomCtaBanner.tsx` | "READY TO ELEVATE YOUR GAME?", "professional table tennis equipment", bottom-banner.png | Generic CTA; placeholder image |
| `FeaturedProductsBanner.tsx` | featured-product.jpg | Use placeholder or config |

*Option: Simplify homepage to a minimal layout (logo, nav, featured products, CTA to shop) for now.*

### 5.10 Images to Replace with Placeholders

**Spin Kit–specific (remove or replace):**

- `spinkit-shop-logo.png`, `Logo-Black.png` → `logo-placeholder.svg` or env
- `Hero-Section.png` → `hero-placeholder.svg`
- `person-image.png` → placeholder
- `image-one.png`, `image-two.png`, `image-three.png` → placeholders
- `performance-img1.png`, `performance-img2.png` → placeholders
- `about.png`, `our-story.png` → placeholders
- `page-banner.png` → placeholder (used on blog, contact, about, FAQ)
- `contact-us.png` → placeholder
- `featured-product.jpg` → placeholder
- `bottom-banner.png` → placeholder
- `Group-11.png` (Footer newsletter) → placeholder
- `fav-icon.png` → generic favicon

**Keep (already generic):**

- `placeholder.svg`, `logo-placeholder.svg`, `hero-placeholder.svg`
- `truck.svg`, `award.svg`, `credit-card.svg`, `performance.svg`, `innovation.svg`, `community.svg`
- `happy-customers.svg`, `countries-served.svg`, `products.svg`, `satisfaction-rate.svg`

### 5.11 Import Scripts

| Script | Purpose | Action |
|--------|---------|--------|
| `scripts/import-dandoy-sports.ts` | Table tennis CSV import (Dandoy) | Keep as **example** or move to `docs/examples/`; document as optional |
| `scripts/import-padel-csv.ts` | Padel CSV import | Same |

### 5.12 Deploy & Config Docs

| File | Action |
|------|--------|
| `docs/DEPLOY-DROPLET.md` | Replace "Spinkit" with "Ecommerce" or "Your Project" |
| `DEPLOY-NOW.md` | Same |
| `scripts/deploy-to-droplet.sh` | Generic project name |
| `scripts/nginx-spinkit.conf` | Rename to `nginx-ecommerce.conf` or generic |
| `scripts/droplet-setup-db.sh` | Generic DB name (e.g. `ecommerce`) |
| `.env.example` | Replace spinkit emails/URLs with placeholders |

---

## 6. New Configuration (Recommended)

Add to `.env.example` and use throughout:

```env
# Site identity
NEXT_PUBLIC_SITE_NAME="Ecommerce"
NEXT_PUBLIC_SITE_TAGLINE="Your tagline here"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Branding
NEXT_PUBLIC_LOGO_URL="/images/logo-placeholder.svg"
NEXT_PUBLIC_LOGO_DARK_URL="/images/logo-placeholder.svg"
NEXT_PUBLIC_FAVICON="/images/favicon.ico"

# Contact
NEXT_PUBLIC_CONTACT_EMAIL="hello@example.com"
NEXT_PUBLIC_CONTACT_PHONE=""
CONTACT_EMAIL="hello@example.com"

# Admin (seed)
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="ChangeMe123!"
```

---

## 7. Generic Seed Data (Proposed)

**Categories:** `Uncategorized`, `Featured` (or empty — let users add via admin)

**Blog categories:** `News`, `Tips`, `Updates`

**Blog posts:** 1–2 generic samples (e.g. "Welcome to our store", "How to get started") or none — **Blog feature stays; only data is genericized**

**Coupons:** Keep `WELCOME10`, `SAVE5` as examples

---

## 8. Implementation Order

1. **Config layer** – Add env vars, create `src/lib/site-config.ts` (or similar) to centralize site name, logo, contact.
2. **Remove extra pages** – Delete `/about`, `/contact`, `/faq` routes and remove their links from Header, Footer.
3. **Storage keys** – Change all `spinkit-*` to `ecommerce-*`.
4. **Layout & metadata** – Use config in `layout.tsx`, product page, admin.
5. **Footer & Header** – Logo, contact from config; remove About, Contact, FAQ nav links.
6. **Legal pages** – Placeholder text + config for contact (keep pages; redesign per project).
7. **Email & receipt** – Use config in `email.ts` and receipt route (keep functionality).
8. **Seed** – Generic categories, admin email from env, genericize blog data (keep blog feature).
9. **Data.ts** – Remove hardcoded categories/filterTags; drive from DB. Make `asSeenInLogos` configurable.
10. **Home sections** – Generic copy, placeholder images.
11. **Images** – Replace Spin Kit images with placeholders (or remove if missing).
12. **Deploy docs** – Generalize.
13. **Import scripts** – Document as optional examples.

---

## 9. What Stays (Template Core)

- **Routes:** `/` (homepage — minimal/placeholder for now), `/products` (shop), `/product/[slug]` (single product), `/cart`, `/checkout`, `/checkout/success`, `/account/*`, `/admin/*`, `/blog`, `/blog/[slug]`, `/terms`, `/privacy`, `/refund-policy`, `/search`, `/wishlist`
- **Removed routes:** `/about`, `/contact`, `/faq`
- **Shop & product pages** — work as before
- Prisma schema (User, Product, Category, Order, Review, Coupon, BlogPost, BlogCategory, etc.)
- All components (ProductCard, Header, Footer, Button, Accordion, etc.)
- Cart, wishlist, currency, recently viewed stores (with new keys)
- Auth, checkout flow, thank you page, receipt download
- Email system (order confirmation, password reset, etc.)
- Admin panel (products, orders, coupons, blog, categories, reviews, etc.)
- Blog feature (listing, detail, admin CRUD) — data genericized only
- Legal pages (Terms, Privacy, Refund) — generic placeholders; redesign per project
- API routes
- `Context.md` (original design spec — useful reference for future theming)

---

## 10. Files Summary

| Category | Count |
|----------|-------|
| Files with "spinkit" / "Spinkit" references | ~25 |
| Zustand stores to update | 4 |
| Home sections to genericize | 6+ |
| Legal/contact pages | 4 |
| Deploy/script files | 5+ |

---

*Generated from project analysis. Use this as a checklist when converting to a generic e-commerce template.*
