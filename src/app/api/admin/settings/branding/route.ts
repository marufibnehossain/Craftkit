import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { siteConfig } from "@/lib/site-config";

const KEYS = {
  SITE_NAME: "branding_site_name",
  TAGLINE: "branding_tagline",
  LOGO_URL: "branding_logo_url",
  FAVICON_URL: "branding_favicon_url",
} as const;

async function getSetting(key: string): Promise<string | null> {
  try {
    const row = await prisma.setting.findUnique({ where: { key } });
    return row?.value ?? null;
  } catch {
    return null;
  }
}

async function setSetting(key: string, value: string) {
  await prisma.setting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}

async function clearSetting(key: string) {
  await prisma.setting.upsert({
    where: { key },
    create: { key, value: "" },
    update: { value: "" },
  });
}

export async function GET() {
  const { authorized } = await requireAdmin();
  if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [siteName, tagline, logoUrl, faviconUrl] = await Promise.all([
    getSetting(KEYS.SITE_NAME),
    getSetting(KEYS.TAGLINE),
    getSetting(KEYS.LOGO_URL),
    getSetting(KEYS.FAVICON_URL),
  ]);

  return NextResponse.json({
    siteName: siteName ?? siteConfig.name,
    tagline: tagline ?? siteConfig.tagline,
    logoUrl: logoUrl ?? "",
    faviconUrl: faviconUrl ?? "",
    hasCustomLogo: logoUrl !== null && logoUrl !== "",
    hasCustomFavicon: faviconUrl !== null && faviconUrl !== "",
  });
}

export async function PATCH(req: Request) {
  const { authorized } = await requireAdmin();
  if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const updates: Promise<void>[] = [];

  if (typeof body.siteName === "string" && body.siteName.trim()) {
    updates.push(setSetting(KEYS.SITE_NAME, body.siteName.trim()));
  }
  if (typeof body.tagline === "string") {
    updates.push(setSetting(KEYS.TAGLINE, body.tagline.trim()));
  }
  if (typeof body.logoUrl === "string") {
    if (body.logoUrl.trim()) {
      updates.push(setSetting(KEYS.LOGO_URL, body.logoUrl.trim()));
    } else {
      updates.push(clearSetting(KEYS.LOGO_URL));
    }
  }
  if (typeof body.faviconUrl === "string") {
    if (body.faviconUrl.trim()) {
      updates.push(setSetting(KEYS.FAVICON_URL, body.faviconUrl.trim()));
    } else {
      updates.push(clearSetting(KEYS.FAVICON_URL));
    }
  }

  await Promise.all(updates);
  return NextResponse.json({ ok: true });
}
