import { NextResponse } from "next/server";
import { purchaseTransaction } from "@/lib/payment";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { countryToIso } from "@/lib/european-countries";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      amountCents,
      currency,
      cardNumber,
      cardExpiry,
      cardCvv,
      cardholderName,
      merchantRef,
      firstName,
      surname,
      streetLine1,
      streetLine2,
      city,
      postalCode,
      stateProvince,
      country,
      email,
      telephone,
      successURL,
      failURL,
      callbackURL,
    } = body as {
      amountCents: number;
      currency?: string;
      cardNumber: string;
      cardExpiry: string;
      cardCvv: string;
      cardholderName: string;
      merchantRef?: string;
      firstName: string;
      surname: string;
      streetLine1: string;
      streetLine2?: string;
      city: string;
      postalCode: string;
      stateProvince?: string;
      country: string;
      email: string;
      telephone?: string;
      successURL?: string;
      failURL?: string;
      callbackURL?: string;
    };

    const cardNum = String(cardNumber ?? "").replace(/\D/g, "");
    const cardExp = String(cardExpiry ?? "").replace(/\D/g, "");
    const cardCvvVal = String(cardCvv ?? "").trim();
    const cardNameVal = String(cardholderName ?? "").trim();

    if (
      typeof amountCents !== "number" ||
      amountCents < 1 ||
      cardNum.length < 13 ||
      cardExp.length < 4 ||
      !cardCvvVal ||
      !cardNameVal
    ) {
      const issues: string[] = [];
      if (typeof amountCents !== "number" || amountCents < 1) issues.push("amount");
      if (cardNum.length < 13) issues.push("card number (min 13 digits)");
      if (cardExp.length < 4) issues.push("expiry (MMYY)");
      if (!cardCvvVal) issues.push("CVV");
      if (!cardNameVal) issues.push("cardholder name");
      console.error("[Payment] Validation failed:", issues.join(", "));
      return NextResponse.json(
        { error: `Invalid: ${issues.join(", ")}` },
        { status: 400 }
      );
    }

    const hdrs = await headers();
    const forwarded = hdrs.get("x-forwarded-for");
    const userIP = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";

    const ref = merchantRef || `ORD-${Date.now()}`;

    const result = await purchaseTransaction({
      amountCents,
      currency: currency || undefined,
      cardNumber: cardNum,
      cardExpiry: cardExp.padStart(4, "0").slice(-4),
      cardCvv: cardCvvVal,
      cardholderName: cardNameVal,
      merchantRef: ref,
      firstName: String(firstName ?? "").trim() || cardNameVal.split(" ")[0] || "N/A",
      surname: String(surname ?? "").trim() || cardNameVal.split(" ").slice(1).join(" ") || "N/A",
      streetLine1: String(streetLine1 ?? "").trim() || "N/A",
      streetLine2: streetLine2 ? String(streetLine2).trim() : undefined,
      city: String(city ?? "").trim() || "N/A",
      postalCode: String(postalCode ?? "").trim() || "00000",
      stateProvince: stateProvince ? String(stateProvince).trim() : undefined,
      country: countryToIso(String(country ?? "").trim() || "US"),
      email: String(email ?? "").trim() || "noreply@example.com",
      telephone: telephone ? String(telephone).trim() : undefined,
      userIP,
      successURL: successURL || undefined,
      failURL: failURL || undefined,
      callbackURL: callbackURL || undefined,
    });

    if (result.ok) {
      if (merchantRef) {
        try {
          await prisma.order.update({
            where: { id: merchantRef },
            data: {
              status: "PROCESSING",
              transactionId: result.transactionId,
            },
          });
        } catch (dbErr) {
          console.error("[Payment] Failed to update order status after approval:", dbErr);
        }
      }

      return NextResponse.json({
        ok: true,
        transactionId: result.transactionId,
      });
    }

    if ("redirect" in result && result.redirect) {
      return NextResponse.json({
        ok: false,
        redirect: true,
        redirectUrl: result.redirectUrl,
        transactionId: result.transactionId,
        merchantRef: result.merchantRef,
      });
    }

    if (merchantRef) {
      try {
        await prisma.order.update({
          where: { id: merchantRef },
          data: { status: "FAILED" },
        });
      } catch {}
    }

    console.error("[Payment] Charge declined:", result.error);
    return NextResponse.json(
      { error: result.error },
      { status: 400 }
    );
  } catch (e) {
    console.error("[Payment] Charge error:", e);
    return NextResponse.json(
      { error: "Payment failed" },
      { status: 500 }
    );
  }
}
