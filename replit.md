# Craftkit — E-commerce Craft Supplies Store

A Next.js 15 e-commerce application for handmade craft supplies, featuring a warm artisan-inspired design system. Contact email: hello@craftkit.store

## Architecture

- **Framework**: Next.js 14 (App Router)
- **ORM**: Prisma with PostgreSQL
- **Auth**: NextAuth v4
- **Styling**: Tailwind CSS v3 + Radix UI
- **State**: Zustand
- **Email**: Nodemailer
- **PDF**: PDFKit
- **Carousel**: Embla Carousel

## Design System

### Fonts
- **Body**: Inter Tight (300/400/500 weights) — `font-sans`
- **Display**: Cormorant (serif) — `font-display`

### Color Tokens (CSS Variables + Tailwind)
- **Brand palette** (warm ivory/beige): `bg` (#F5EDE2), `surface` (#FAF6F1), `brand-light` (#FBF4EB), `brand-mid` (#F5EDE2), `brand-dark` (#E0D6C9)
- **Secondary** (dusty rose/wine): `secondary-light` (#F5EAE2), `secondary-60` (#CCA2A0), `secondary-40` (#B57A7B), `secondary-100` (#862830)
- **Dark**: `dark-100` (#1B1718), `dark-80` (#5F5D5D), `dark-60` (#8D8B8B), `dark-40` (#BBB9BA)
- **Body muted**: #A1A1A1
- **Neutral**: #7B7B7C

### Component Conventions
- **Buttons**: Rectangular CTAs (no border-radius), `h-14 px-10` sizing, `text-lg`
  - Primary: `bg-secondary-100 text-white` (wine)
  - Secondary: `bg-dark-100 text-white`
  - Outline: `border border-dark-100 text-dark-100`
- **Section headings**: Mixed font pattern — body text in Inter Tight (font-sans) + keyword in Cormorant (font-display font-medium)
- **Section labels**: `font-display text-base font-medium tracking-widest uppercase` in #8d8b8b
- **Product cards**: No border-radius, 20px product name, 32px Cormorant price in secondary-100, full-width "Add to Cart" bar
- `tracking-wider` on body text, `tracking-widest` on labels
- `max-w-[1440px] px-6 md:px-20` for page containers
- Section spacing: `py-16 md:py-24`

## Project Structure

- `src/app/` — Next.js App Router pages and API routes
- `src/components/` — Shared React components
- `src/lib/` — Utilities and server-side logic
- `src/types/` — TypeScript type definitions
- `prisma/` — Prisma schema and migrations
- `public/` — Static assets

## Static Assets (public/images/)

### Figma-Sourced Images
- `craftkit-logo.png` — Craftkit brand logo PNG (alpha-corrected from original; used by `Logo.tsx`, email template, and receipt PDF)
- `craftkit-logo.svg` — Craftkit brand logo SVG fallback file
- `craftly-logo.svg` — Legacy Craftly logo (kept for backward compatibility)
- `hero-right.png` — Hero section main craft image (knitting hands)
- `hero-left-small.png` — Hero section small secondary image
- `yarn-section-large.png` — "Our Yarns" section large image
- `yarn-section-small.png` — "How To Learn" section granny square image
- `services-image.png` — "Shop Rowan Yarn" section image
- `partners/` — Partner brand logos: logo1.svg, logo2.svg, logo5.svg, logo7.svg (SVG from Figma), logo3.webp, logo4.webp, logo6.webp (composite raster from Figma screenshots). Displayed as Embla carousel with autoplay, 7 logos per view, 104px gap, muted gray (#BBB9BA) fill.
- `categories/` — Category icons (cat-icon-1 through cat-icon-6.png)
- `blog-preview-1/2/3.png` — Blog article preview images

### AI-Generated Product Images
- `products/` — 16 product images for demo data

### AI-Generated Blog Images
- `blog/` — 6 blog article hero images

## Pages

| Route | Description |
|---|---|
| `/` | Homepage — hero, marquee, categories, products, services, blog |
| `/products` | Shop page with sidebar filters, sorting, pagination |
| `/product/[slug]` | Product detail with gallery, variations, accordion |
| `/cart` | Shopping cart (also off-canvas drawer via cart icon) |
| `/checkout` | Checkout with step indicator, billing details, order notes, payment, order summary |
| `/account` | Account dashboard — sidebar navigation (Figma design), greeting, links to sub-sections |
| `/account/orders` | Order history with sidebar navigation |
| `/account/addresses` | Address management with sidebar navigation |
| `/account/settings` | Account details/settings with sidebar navigation |
| `/account/login` | Login — split layout with Figma background image, social login buttons, terms text |
| `/account/register` | Register — split layout with password strength indicator, social login, Figma image |
| `/blog` | Blog listing |
| `/blog/[slug]` | Blog post detail |
| `/about` | About Us |
| `/contact` | Contact Us with form |
| `/faq` | FAQ with accordion |
| `/sell` | Seller application form (submissions saved to DB) |
| `/admin/*` | Admin dashboard |

## Running the App

```bash
npm run dev      # Start dev server on port 5000
npm run build    # Build for production
npm run start    # Start production server on port 5000
```

## Downloadable Products

Products can be marked as downloadable in the admin dashboard. Digital files are stored privately in `storage/downloads/` (not publicly accessible). File URLs use the `storage://` scheme (e.g., `storage://filename-123456.pdf`). Downloads are served through an authenticated API at `/api/download/[orderId]/[productId]`.

- **Schema fields**: `isDownloadable` (Boolean), `downloadFiles` (JSON string: `[{name, url, size}]`)
- **Upload API**: `POST /api/admin/upload-file` — admin-only, max 50MB, supports PDF/ZIP/EPUB/MP3/MP4/etc.
- **Download API**: `GET /api/download/[orderId]/[productId]?file=0&email=...` — verifies order ownership via session or email param
- **Admin UI**: Checkbox + file upload area in the product form
- **Customer access**: Download links on thank-you page and account order details page

## Seller Applications

- **Model**: `SellerApplication` in Prisma — stores role, level, categories, platforms, displayName, bio, email
- **Public API**: `POST /api/seller-application` — validates role/level/categories against allowlists, saves to DB, sends email notification
- **Admin API**: `GET /api/admin/seller-applications` — returns recent applications (auth-protected)
- **Admin page**: `/admin/seller-applications` — expandable table view with all application details
- **Email**: `sendSellerApplicationNotificationEmail` in `src/lib/email.ts` — HTML-escaped notification to `contactEmail`

## Database

- Uses PostgreSQL via Prisma. `DATABASE_URL` is configured as a Replit secret.
- Run migrations: `npm run db:migrate`
- Seed data: `npm run db:seed`
- Product seed: `npx tsx prisma/seed-products.ts`
- Prisma Studio: `npm run db:studio`

### Product Data (imported from CSV)
- **28 categories** in a 2-level hierarchy: Bargains (9 subcategories), Yarns (13 subcategories), Crochet, Cross Stitch & Embroidery (1 sub), Hobbies & Crafts
- **955 products** with real product images hosted on `isv.prod.lovecrafts.co`
- **15,107 variations** — mostly color variations with individual swatch images
- Products include yarn brands: Paintbox Yarns, Rowan, Debbie Bliss, King Cole, Sirdar, etc.
- Import script: `scripts/import-csv.ts` (reads from CSV, creates categories/products/variations)
- Image download script: `scripts/download-images.ts` (downloads all external images to `public/uploads/products/`, updates DB paths, sets image-based swatches)
- Restore script: `scripts/restore-cdn-urls.ts` (reverts local paths back to original LoveCrafts CDN URLs — run after download-images.ts if deploying without local images)
- **Image hosting (current)**: All 17,713 product/variation/swatch images reference `isv.prod.lovecrafts.co` CDN directly. The 7GB of downloaded files still exist in `public/uploads/products/` but are not referenced in the DB.
- **Image hosting (TODO on production deployment)**: Migrate images to a dedicated object storage service (e.g. Replit App Storage, S3, Cloudflare R2). Run `scripts/download-images.ts` to fetch from LoveCrafts CDN, then upload to the storage bucket and update DB URLs accordingly. This prevents breakage if LoveCrafts removes their images.
- Variation swatches use `displayType: "image"` with CDN image URLs in `displayData`

## Environment Variables

Key env vars configured in Replit:
- `DATABASE_URL` — PostgreSQL connection string
- `NEXTAUTH_SECRET` — NextAuth signing secret
- `NEXTAUTH_URL` — Set per-environment (development only; production auto-detects via REPLIT_DOMAINS)
- `NEXT_PUBLIC_SITE_URL` — Set per-environment (development only; production auto-detects)
- `NEXT_PUBLIC_SITE_NAME` — "Craftkit" (shared)
- `NEXT_PUBLIC_LOGO_URL` / `NEXT_PUBLIC_LOGO_DARK_URL` — `/images/craftkit-logo.png` (overridable via Admin > Settings > Branding)
- `NEXT_PUBLIC_FAVICON` — `/images/craftkit-logo.png` (overridable via Admin > Settings > Branding)

Branding settings (logo, favicon, site name, tagline) can be overridden at runtime via Admin > Settings > Branding — stored in the `Setting` table, served by `/api/site-config`, consumed by `BrandingProvider.tsx` context.

Optional (configure in Admin dashboard or as secrets):
- `SMTP_*` — Email sending credentials (configurable via Admin > Email)
- `RECAPTCHA_SITE_KEY` / `RECAPTCHA_SECRET_KEY` — Google reCAPTCHA (configurable via Admin > reCAPTCHA, supports v2 checkbox/invisible/v3)
- `CCHEROES_*` — Payment gateway credentials (processTransact)
- `NEXT_PUBLIC_SUPABASE_*` — Supabase client credentials

## Payment Integration (processTransact / ccHeroes)

- **Gateway**: processTransact API v1.27 (JSON over HTTPS POST)
- **Test URL**: `https://sandbox.processtransact.com/api/json.ashx`
- **Live URL**: `https://gw.processtransact.com/api/json.ashx`
- **Config**: Admin → Payment (DB settings `payment_ccheroes_*`, `payment_gateway_currency`), or env vars `CCHEROES_*`
- **Gateway currency**: Multi-currency supported. Checkout sends the customer's selected currency (from `useCurrencyStore`) to the charge route. Fallback currency configurable in Admin → Payment (DB key `payment_gateway_currency`, default EUR).
- **Core lib**: `src/lib/payment.ts` — `purchaseTransaction`, `captureTransaction`, `cancelTransaction`, `refundTransaction`, `checkTransactionStatus`
- **Field format**: PascalCase per API spec (GatewayID, MerchantName, CardNo, ExpiryYear, ExpiryMonth, etc.)
- **Card brand**: Auto-detected from BIN (VISA, MASTERCARD, AMEX, DINERS, ELECTRON, MAESTRO)
- **Response handling**: ResponseCode 0=approved, 600=3D Secure redirect, else=declined
- **3D Secure flow**: Checkout creates order (PENDING) → charges card → if redirect needed, user sent to gateway → callback updates order → user returned to `/api/payment/return`
- **Callback endpoint**: `POST /api/payment/callback` — receives server-side callback from processTransact, verifies SHA-1 signature, updates order status
- **Return endpoint**: `GET|POST /api/payment/return` — user redirect after 3D Secure, redirects to success/failure page
- **Signature verification**: SHA-1 of `MerchantPassword+TransactionID+MerchantRef+Currency+Amount+ResponseCode`
- **Admin refund**: `POST /api/admin/orders/[id]/refund` — sends TransTypeID=5 to gateway, updates order to REFUNDED
- **Country codes**: `countryToIso()` in `european-countries.ts` converts full names to ISO 3166-1 alpha-2 for processTransact

## Replit Configuration

- Dev server runs on port 5000 with `0.0.0.0` host binding
- Workflow: `npm run dev` via "Start application"
