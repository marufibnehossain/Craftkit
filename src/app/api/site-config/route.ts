import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site-config";

async function getSetting(key: string): Promise<string | null> {
  try {
    const row = await prisma.setting.findUnique({ where: { key } });
    return row?.value ?? null;
  } catch {
    return null;
  }
}

export async function GET() {
  const [siteName, tagline, logoUrl, faviconUrl] = await Promise.all([
    getSetting("branding_site_name"),
    getSetting("branding_tagline"),
    getSetting("branding_logo_url"),
    getSetting("branding_favicon_url"),
  ]);

  return NextResponse.json({
    siteName: siteName ?? siteConfig.name,
    tagline: tagline ?? siteConfig.tagline,
    logoUrl: logoUrl ?? "",
    faviconUrl: faviconUrl ?? "",
  });
}
