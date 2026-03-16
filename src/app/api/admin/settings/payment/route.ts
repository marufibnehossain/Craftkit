import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

const KEYS = {
  LIVE_MERCHANT_NAME: "payment_ccheroes_live_merchant_name",
  LIVE_MERCHANT_PASSWORD: "payment_ccheroes_live_merchant_password",
  TEST_MERCHANT_NAME: "payment_ccheroes_test_merchant_name",
  TEST_MERCHANT_PASSWORD: "payment_ccheroes_test_merchant_password",
  TEST_MODE: "payment_ccheroes_test_mode",
  COD_ENABLED: "payment_cod_enabled",
  GATEWAY_CURRENCY: "payment_gateway_currency",
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

const ENV_FALLBACK = {
  liveName: "CCHEROES_LIVE_MERCHANT_NAME",
  livePassword: "CCHEROES_LIVE_MERCHANT_PASSWORD",
  testName: "CCHEROES_TEST_MERCHANT_NAME",
  testPassword: "CCHEROES_TEST_MERCHANT_PASSWORD",
  legacyName: "CCHEROES_MERCHANT_NAME",
  legacyPassword: "CCHEROES_MERCHANT_PASSWORD",
} as const;

export async function GET() {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const [liveName, livePassword, testName, testPassword, testMode, codEnabled, gatewayCurrency] = await Promise.all([
      getSetting(KEYS.LIVE_MERCHANT_NAME),
      getSetting(KEYS.LIVE_MERCHANT_PASSWORD),
      getSetting(KEYS.TEST_MERCHANT_NAME),
      getSetting(KEYS.TEST_MERCHANT_PASSWORD),
      getSetting(KEYS.TEST_MODE),
      getSetting(KEYS.COD_ENABLED),
      getSetting(KEYS.GATEWAY_CURRENCY),
    ]);

    const env = process.env;
    const useTest = testMode !== null ? testMode === "true" : env.CCHEROES_TEST_MODE !== "false";
    const codOn = codEnabled !== null ? codEnabled === "true" : true;

    return NextResponse.json({
      liveMerchantName: liveName ?? env[ENV_FALLBACK.liveName] ?? env[ENV_FALLBACK.legacyName] ?? "",
      liveMerchantPasswordMasked: (livePassword ?? env[ENV_FALLBACK.livePassword] ?? env[ENV_FALLBACK.legacyPassword]) ? "••••••••••••" : "",
      liveHasPassword: !!(livePassword ?? env[ENV_FALLBACK.livePassword] ?? env[ENV_FALLBACK.legacyPassword]),
      testMerchantName: testName ?? env[ENV_FALLBACK.testName] ?? env[ENV_FALLBACK.legacyName] ?? "",
      testMerchantPasswordMasked: (testPassword ?? env[ENV_FALLBACK.testPassword] ?? env[ENV_FALLBACK.legacyPassword]) ? "••••••••••••" : "",
      testHasPassword: !!(testPassword ?? env[ENV_FALLBACK.testPassword] ?? env[ENV_FALLBACK.legacyPassword]),
      testMode: useTest,
      codEnabled: codOn,
      gatewayCurrency: gatewayCurrency ?? "EUR",
    });
  } catch (e) {
    console.error("[Admin] Payment settings get error:", e);
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
    const {
      liveMerchantName,
      liveMerchantPassword,
      testMerchantName,
      testMerchantPassword,
      testMode,
      codEnabled,
      gatewayCurrency,
    } = body as {
      liveMerchantName?: string;
      liveMerchantPassword?: string;
      testMerchantName?: string;
      testMerchantPassword?: string;
      testMode?: boolean;
      codEnabled?: boolean;
      gatewayCurrency?: string;
    };

    if (typeof liveMerchantName === "string") {
      await setSetting(KEYS.LIVE_MERCHANT_NAME, liveMerchantName.trim());
    }
    if (typeof liveMerchantPassword === "string" && liveMerchantPassword !== "") {
      await setSetting(KEYS.LIVE_MERCHANT_PASSWORD, liveMerchantPassword);
    }
    if (typeof testMerchantName === "string") {
      await setSetting(KEYS.TEST_MERCHANT_NAME, testMerchantName.trim());
    }
    if (typeof testMerchantPassword === "string" && testMerchantPassword !== "") {
      await setSetting(KEYS.TEST_MERCHANT_PASSWORD, testMerchantPassword);
    }
    if (typeof testMode === "boolean") {
      await setSetting(KEYS.TEST_MODE, testMode ? "true" : "false");
    }
    if (typeof codEnabled === "boolean") {
      await setSetting(KEYS.COD_ENABLED, codEnabled ? "true" : "false");
    }
    if (typeof gatewayCurrency === "string" && gatewayCurrency.trim()) {
      const cur = gatewayCurrency.trim().toUpperCase();
      if (!/^[A-Z]{3}$/.test(cur)) {
        return NextResponse.json({ error: "Gateway currency must be a 3-letter ISO code (e.g. EUR, USD, GBP)" }, { status: 400 });
      }
      await setSetting(KEYS.GATEWAY_CURRENCY, cur);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[Admin] Payment settings update error:", e);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
