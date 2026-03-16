# Fonts folder — Neue Montreal (local)

This folder should contain the **Neue Montreal** font files so the site matches your Figma design.

## Required files

Place these files in this folder (`src/app/fonts/`):

| File | Weight |
|------|--------|
| `NeueMontreal-Regular.woff2` | 400 |
| `NeueMontreal-Medium.woff2` | 500 |
| `NeueMontreal-SemiBold.woff2` | 600 |
| `NeueMontreal-Bold.woff2` | 700 |

If your files have different names (e.g. from Figma export), rename them to match the table above, or update the `src` paths in `src/app/layout.tsx` in the `neueMontreal` local font config.

## Where to get the font

1. **From Figma**  
   If your design uses Neue Montreal, you can often export it: select text that uses the font → Inspect → find the font and export, or ask your designer for the `.woff2` (or `.ttf`/`.otf`) files. Convert to `.woff2` if needed (e.g. with [transfonter.org](https://transfonter.org)).

2. **From Pangram Pangram (official)**  
   [Neue Montreal](https://pangrampangram.com/products/neue-montreal) — purchase a license and download. The package includes WOFF2; use the Regular, Medium, SemiBold, and Bold files and place them here with the names above.

## Switching the site to Neue Montreal

Right now the site uses **DM Sans** so it builds without the font files. When you have the four `.woff2` files in this folder:

1. Open `src/app/layout.tsx`.
2. Add at the top: `import localFont from "next/font/local";`
3. Uncomment the `neueMontreal` local font block and remove or comment out the `sansFont` (DM_Sans) block.
4. In the `<html>` tag, replace `sansFont.variable` with `neueMontreal.variable`.

Save and rebuild; the site will use Neue Montreal as the main body font.
