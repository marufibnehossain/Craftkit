import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

const KEYS = {
  SITE_KEY: "recaptcha_site_key",
  SECRET_KEY: "recaptcha_secret_key",
  ENABLED: "recaptcha_enabled",
  VERSION: "recaptcha_version",
} as const;

function hasSettingModel(): boolean {
  return typeof (prisma as { setting?: unknown }).setting !== "undefined";
}

async function getSetting(key: string): Promise<string | null> {
  if (!hasSettingModel()) return null;
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? null;
}

async function setSetting(key: string, value: string): Promise<boolean> {
  if (!hasSettingModel()) return false;
  await prisma.setting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
  return true;
}

export async function GET() {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const [siteKey, secretKey, enabled, version] = await Promise.all([
      getSetting(KEYS.SITE_KEY),
      getSetting(KEYS.SECRET_KEY),
      getSetting(KEYS.ENABLED),
      getSetting(KEYS.VERSION),
    ]);

    const env = process.env;
    const actualSiteKey = siteKey ?? env.RECAPTCHA_SITE_KEY ?? "";
    const hasSecretKey = !!(secretKey ?? env.RECAPTCHA_SECRET_KEY);

    return NextResponse.json({
      siteKey: actualSiteKey,
      secretKeyMasked: hasSecretKey ? "••••••••••••" : "",
      hasSecretKey,
      enabled: enabled ? enabled === "true" : !!(actualSiteKey && hasSecretKey),
      version: version ?? "v2_checkbox",
    });
  } catch (e) {
    console.error("[Admin] reCAPTCHA settings get error:", e);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { siteKey, secretKey, enabled, version } = body as {
      siteKey?: string;
      secretKey?: string;
      enabled?: boolean;
      version?: string;
    };

    if (typeof siteKey === "string") {
      await setSetting(KEYS.SITE_KEY, siteKey.trim());
    }
    if (typeof secretKey === "string" && secretKey !== "") {
      await setSetting(KEYS.SECRET_KEY, secretKey.trim());
    }
    if (typeof enabled === "boolean") {
      await setSetting(KEYS.ENABLED, String(enabled));
    }
    if (typeof version === "string" && ["v2_checkbox", "v2_invisible", "v3"].includes(version)) {
      await setSetting(KEYS.VERSION, version);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[Admin] reCAPTCHA settings update error:", e);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
