import { NextResponse } from "next/server";
import { isCodEnabled, getDefaultCurrency } from "@/lib/checkout-settings";

export async function GET() {
  try {
    const [codEnabled, defaultCurrency] = await Promise.all([
      isCodEnabled(),
      getDefaultCurrency(),
    ]);
    return NextResponse.json({ codEnabled, defaultCurrency });
  } catch {
    return NextResponse.json({ codEnabled: true, defaultCurrency: "EUR" });
  }
}
