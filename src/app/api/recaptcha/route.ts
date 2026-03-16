import { NextResponse } from "next/server";
import { getRecaptchaPublicConfig } from "@/lib/recaptcha-config";

export async function GET() {
  try {
    const config = await getRecaptchaPublicConfig();
    return NextResponse.json(config);
  } catch {
    return NextResponse.json({ siteKey: null, version: "v2_checkbox" });
  }
}
