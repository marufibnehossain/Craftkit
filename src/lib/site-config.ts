/**
 * Centralized site configuration.
 * Values come from environment variables with sensible defaults.
 */

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "Craftkit",
  tagline: process.env.NEXT_PUBLIC_SITE_TAGLINE ?? "The Art of the Handmade",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  logo: process.env.NEXT_PUBLIC_LOGO_URL ?? "/images/craftkit-logo.png",
  logoDark: process.env.NEXT_PUBLIC_LOGO_DARK_URL ?? "/images/craftkit-logo.png",
  favicon: process.env.NEXT_PUBLIC_FAVICON ?? "/images/craftkit-logo.png",

  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? process.env.CONTACT_EMAIL ?? "hello@craftkit.store",
  contactPhone: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "",
  contactAddress: process.env.NEXT_PUBLIC_CONTACT_ADDRESS ?? "Company Address, City name",
} as const;
