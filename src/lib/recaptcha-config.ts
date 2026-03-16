import { prisma } from "@/lib/prisma";

export type RecaptchaVersion = "v2_checkbox" | "v2_invisible" | "v3";

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
  try {
    const row = await prisma.setting.findUnique({ where: { key } });
    return row?.value ?? null;
  } catch (e) {
    console.error(`[reCAPTCHA] Failed to read setting "${key}":`, e);
    return null;
  }
}

export interface RecaptchaConfig {
  siteKey: string;
  secretKey: string;
  enabled: boolean;
  version: RecaptchaVersion;
}

export async function getRecaptchaConfig(): Promise<RecaptchaConfig> {
  const [dbSiteKey, dbSecretKey, dbEnabled, dbVersion] = await Promise.all([
    getSetting(KEYS.SITE_KEY),
    getSetting(KEYS.SECRET_KEY),
    getSetting(KEYS.ENABLED),
    getSetting(KEYS.VERSION),
  ]);

  const siteKey = dbSiteKey ?? process.env.RECAPTCHA_SITE_KEY ?? "";
  const secretKey = dbSecretKey ?? process.env.RECAPTCHA_SECRET_KEY ?? "";
  const enabled = dbEnabled ? dbEnabled === "true" : !!(siteKey && secretKey);
  const version: RecaptchaVersion =
    dbVersion === "v2_checkbox" || dbVersion === "v2_invisible" || dbVersion === "v3"
      ? dbVersion
      : "v2_checkbox";

  return { siteKey, secretKey, enabled, version };
}

export async function getRecaptchaPublicConfig(): Promise<{ siteKey: string | null; version: RecaptchaVersion }> {
  const config = await getRecaptchaConfig();
  if (!config.enabled || !config.siteKey) return { siteKey: null, version: config.version };
  return { siteKey: config.siteKey, version: config.version };
}

export async function verifyRecaptchaToken(token: string): Promise<boolean> {
  const config = await getRecaptchaConfig();
  if (!config.enabled || !config.secretKey) return true;
  if (!token) return false;

  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${encodeURIComponent(config.secretKey)}&response=${encodeURIComponent(token)}`,
    });
    const data = await res.json();
    if (config.version === "v3") {
      return !!data.success && typeof data.score === "number" && data.score >= 0.5;
    }
    return !!data.success;
  } catch (e) {
    console.error("[reCAPTCHA] Verification failed:", e);
    return false;
  }
}
