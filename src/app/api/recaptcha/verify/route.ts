import { NextResponse } from "next/server";
import { verifyRecaptchaToken } from "@/lib/recaptcha-config";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = typeof body?.token === "string" ? body.token : "";
    const valid = await verifyRecaptchaToken(token);
    return NextResponse.json({ valid });
  } catch {
    return NextResponse.json({ valid: false });
  }
}
