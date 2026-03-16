import { prisma } from "@/lib/prisma";

function hasSettingModel(): boolean {
  return typeof (prisma as { setting?: unknown }).setting !== "undefined";
}

const KEYS = {
  LIVE_MERCHANT_NAME: "payment_ccheroes_live_merchant_name",
  LIVE_MERCHANT_PASSWORD: "payment_ccheroes_live_merchant_password",
  TEST_MERCHANT_NAME: "payment_ccheroes_test_merchant_name",
  TEST_MERCHANT_PASSWORD: "payment_ccheroes_test_merchant_password",
  TEST_MODE: "payment_ccheroes_test_mode",
  GATEWAY_CURRENCY: "payment_gateway_currency",
} as const;

const env = process.env;
const legacyName = env.CCHEROES_MERCHANT_NAME ?? "";
const legacyPassword = env.CCHEROES_MERCHANT_PASSWORD ?? "";

const DEFAULT_TEST_NAME = "cchDummy1";
const DEFAULT_TEST_PASSWORD = "p@s5w0Rd123";

export async function getPaymentConfig(): Promise<{
  merchantName: string;
  merchantPassword: string;
  useTestMode: boolean;
  gatewayCurrency: string;
}> {
  try {
    if (!hasSettingModel()) {
      const useTestMode = env.CCHEROES_TEST_MODE !== "false";
      const name = useTestMode
        ? (env.CCHEROES_TEST_MERCHANT_NAME ?? legacyName) || DEFAULT_TEST_NAME
        : (env.CCHEROES_LIVE_MERCHANT_NAME ?? legacyName);
      const password = useTestMode
        ? (env.CCHEROES_TEST_MERCHANT_PASSWORD ?? legacyPassword) || DEFAULT_TEST_PASSWORD
        : (env.CCHEROES_LIVE_MERCHANT_PASSWORD ?? legacyPassword);
      return { merchantName: name, merchantPassword: password, useTestMode, gatewayCurrency: "EUR" };
    }
    const rows = await prisma.setting.findMany({
      where: { key: { in: [...Object.values(KEYS)] } },
    });
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));

    const useTestMode =
      map[KEYS.TEST_MODE] !== undefined
        ? map[KEYS.TEST_MODE] === "true"
        : env.CCHEROES_TEST_MODE !== "false";

    const merchantName = useTestMode
      ? (map[KEYS.TEST_MERCHANT_NAME] ?? env.CCHEROES_TEST_MERCHANT_NAME ?? legacyName) || DEFAULT_TEST_NAME
      : map[KEYS.LIVE_MERCHANT_NAME] ?? env.CCHEROES_LIVE_MERCHANT_NAME ?? legacyName;

    const merchantPassword = useTestMode
      ? (map[KEYS.TEST_MERCHANT_PASSWORD] ?? env.CCHEROES_TEST_MERCHANT_PASSWORD ?? legacyPassword) || DEFAULT_TEST_PASSWORD
      : map[KEYS.LIVE_MERCHANT_PASSWORD] ?? env.CCHEROES_LIVE_MERCHANT_PASSWORD ?? legacyPassword;

    const gatewayCurrency = map[KEYS.GATEWAY_CURRENCY] || "EUR";

    return { merchantName, merchantPassword, useTestMode, gatewayCurrency };
  } catch {
    const useTestMode = env.CCHEROES_TEST_MODE !== "false";
    const name = useTestMode
      ? (env.CCHEROES_TEST_MERCHANT_NAME ?? legacyName) || DEFAULT_TEST_NAME
      : (env.CCHEROES_LIVE_MERCHANT_NAME ?? legacyName);
    const password = useTestMode
      ? (env.CCHEROES_TEST_MERCHANT_PASSWORD ?? legacyPassword) || DEFAULT_TEST_PASSWORD
      : (env.CCHEROES_LIVE_MERCHANT_PASSWORD ?? legacyPassword);
    return { merchantName: name, merchantPassword: password, useTestMode, gatewayCurrency: "EUR" };
  }
}
