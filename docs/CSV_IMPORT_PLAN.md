# CSV Product Import Plan: padel_dandoy_sports_products.csv

## CSV Structure

| Col | Header        | Sample values | Notes |
|-----|---------------|---------------|-------|
| A   | url           | `https://en.dandoy-sports.eu/stiga-padel-racket-black-blue.html` | Source URL; can derive slug |
| B   | product_title | `Stiga Padel Racket ACT Black/Blue` | Product name |
| C   | description   | Long text (can contain commas, newlines) | Full product description |
| D   | Size          | (mostly empty) | **Attribute** |
| E   | Colors        | `Black/White`, `Black/Black` | **Attribute** |
| F   | Manufacturer  | (mostly empty) | **Attribute** |
| G   | MainColor     | (mostly empty) | **Attribute** |
| H   | product_images| Comma-separated URLs | Multiple images per product |
| I   | category      | `Padel` | Category name |
| J   | price         | `69.9`, `199.9` | Price in EUR |

---

## Product Schema Mapping

| Product field     | CSV source | Transform |
|-------------------|------------|-----------|
| slug              | url or product_title | Extract from URL path (e.g. `stiga-padel-racket-black-blue.html` → `stiga-padel-racket-black-blue`) or slugify product_title. Must be unique. |
| name              | product_title | Use as-is |
| shortDesc         | description | First ~200 chars or first paragraph |
| longDesc          | description | Full text |
| priceCents        | price | `Math.round(price * 100)` |
| images            | product_images | Split by comma, trim, store as JSON array. See [Image handling](#image-handling) below. |
| categoryId        | category | Map "Padel" → create/find Category with slug `padel` |
| tags              | — | Derive from name + category, e.g. `["padel", "racket", "stiga"]` |
| productCode       | — | Optional: derive from slug or leave null |
| stock             | — | Default 0 or a chosen value; set `trackInventory: false` for unlimited |
| trackInventory    | — | Default `true` or `false` depending on your needs |

---

## Attribute Handling (Columns D, E, F, G)

The site uses `ProductAttribute` with:
- `name`: attribute name (e.g. "Size", "Colors", "Manufacturer", "MainColor")
- `values`: JSON array of possible values, e.g. `["Black/White"]`
- `displayType`: "button" | "swatch" | "image"
- `displayData`: optional (for swatches/images)

**Rules:**
1. Only add attributes for columns that have non-empty values.
2. For "Colors", treat each value as one option (e.g. `Black/White` → `["Black/White"]`).
3. If a product has multiple values for one attribute (e.g. Size: S, M, L), store as `["S","M","L"]`.
4. Most rows have empty D, E, F, G — only add attributes when values exist.

**Example from CSV:**
- Row 24 (Stiga Padel Bag Court Black/White): Colors = `Black/White` → `ProductAttribute { name: "Colors", values: ["Black/White"] }`
- Row 25 (Stiga Padel Bag Court Black/Black): Colors = `Black/Black` → `ProductAttribute { name: "Colors", values: ["Black/Black"] }`

**ProductVariation:** Use only if a single product has multiple selectable options (e.g. Size S/M/L). In this CSV, each row is a separate product, so variations are typically not needed unless you decide to merge similar products.

---

## Image Handling

**CSV images:** Full URLs like `https://en.dandoy-sports.eu/media/catalog/product/.../act_black_blue1_1.jpg`

**Options:**
1. **Store external URLs as-is** — Easiest; images load from Dandoy. Risk: links may break if their site changes.
2. **Download and host locally** — Fetch each image, save to `public/uploads/`, store `/uploads/filename.jpg`. More robust but requires a download step and more disk space.
3. **Placeholder first** — Import with `/images/placeholder.svg`, then update images later via admin.

**Recommendation:** Start with option 1 (external URLs) for a quick import; add a separate script later to download and localize if needed.

---

## Category Setup

The CSV uses category `Padel`. You need a Category record:

```ts
// Create if not exists
{ name: "Padel", slug: "padel" }
```

---

## Import Implementation Options

### Option A: Node.js seed/script (recommended)

Create `scripts/import-padel-csv.ts` (or `.js`):

1. Parse CSV with a library (e.g. `csv-parse`, `papaparse`) to handle quoted fields and newlines.
2. Ensure "Padel" category exists.
3. For each row:
   - Derive slug from URL or product_title.
   - Create Product via Prisma.
   - For each of D, E, F, G with values: create ProductAttribute.
4. Run with `npx ts-node scripts/import-padel-csv.ts` or add an npm script.

### Option B: Admin API

Use `POST /api/admin/products` for each product, then `POST /api/admin/products/[id]/attributes` for attributes. Requires:
- Parsing CSV in a script or one-off page.
- Authenticated admin session/cookie.
- More HTTP calls but reuses existing API.

### Option C: Admin UI bulk import

Build an admin page that:
- Accepts CSV upload.
- Parses and shows preview.
- Imports via API or direct Prisma.

---

## Edge Cases

| Issue | Handling |
|-------|----------|
| Duplicate slugs | Use `upsert` on slug, or append `-2`, `-3` for duplicates |
| Empty description | Use product_title as shortDesc, empty longDesc |
| Malformed image URLs | Validate before adding; fallback to placeholder |
| Price format | Assume decimal (e.g. 69.9); multiply by 100 for cents |
| CSV encoding | Ensure UTF-8; handle BOM if present |
| Quoted fields with commas | Use a proper CSV parser (e.g. papaparse) |

---

## Slug Derivation

From URL: `https://en.dandoy-sports.eu/stiga-padel-racket-black-blue.html`  
→ path: `stiga-padel-racket-black-blue.html`  
→ slug: `stiga-padel-racket-black-blue` (strip `.html`)

From product_title: `Stiga Padel Racket ACT Black/Blue`  
→ slug: `stiga-padel-racket-act-black-blue` (lowercase, replace spaces and `/` with `-`)

Prefer URL-based slug when available; fallback to slugified product_title.

---

## Next Steps

1. Add `csv-parse` or `papaparse` to devDependencies.
2. Create `scripts/import-padel-csv.ts` (or `.js`).
3. Create/find Padel category.
4. Implement row → Product + ProductAttribute mapping.
5. Run import once; verify in admin.
6. (Optional) Add image download step to localize images.
