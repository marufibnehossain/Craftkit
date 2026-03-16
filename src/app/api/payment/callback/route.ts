import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCallbackSignature } from "@/lib/payment";
import { getPaymentConfig } from "@/lib/payment-config";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const transactionId = String(data.TransactionID ?? "");
    const merchantRef = String(data.MerchantRef ?? "");
    const responseCode = String(data.ResponseCode ?? "");
    const currency = String(data.Currency ?? "");
    const amount = String(data.Amount ?? "");
    const signature = String(data.Signature ?? "");

    console.log(`[Payment Callback] MerchantRef=${merchantRef} ResponseCode=${responseCode} TransactionID=${transactionId}`);

    if (!merchantRef || !transactionId) {
      console.error("[Payment Callback] Missing MerchantRef or TransactionID");
      return NextResponse.json({ ok: true });
    }

    if (!signature) {
      console.error("[Payment Callback] Missing signature — rejecting unsigned callback for MerchantRef:", merchantRef);
      return NextResponse.json({ ok: true });
    }

    const config = await getPaymentConfig();
    const valid = verifyCallbackSignature({
      merchantPassword: config.merchantPassword,
      transactionId,
      merchantRef,
      currency,
      amount,
      responseCode,
      receivedSignature: signature,
    });
    if (!valid) {
      console.error("[Payment Callback] Invalid signature for MerchantRef:", merchantRef);
      return NextResponse.json({ ok: true });
    }

    const approved = responseCode === "0";

    try {
      await prisma.order.update({
        where: { id: merchantRef },
        data: {
          status: approved ? "PROCESSING" : "FAILED",
          transactionId: transactionId,
        },
      });
      console.log(`[Payment Callback] Order ${merchantRef} updated: ${approved ? "PROCESSING" : "FAILED"}`);
    } catch (dbErr) {
      console.error("[Payment Callback] DB update failed for MerchantRef:", merchantRef, dbErr);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[Payment Callback] Error:", e);
    return NextResponse.json({ ok: true });
  }
}
