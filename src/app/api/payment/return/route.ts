import { NextResponse } from "next/server";
import { verifyCallbackSignature } from "@/lib/payment";
import { getPaymentConfig } from "@/lib/payment-config";

function getBaseUrl(): string {
  return process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

async function handleReturn(params: Record<string, string>): Promise<Response> {
  const merchantRef = params.MerchantRef ?? "";
  const responseCode = params.ResponseCode ?? "";
  const transactionId = params.TransactionID ?? "";
  const signature = params.Signature ?? "";
  const currency = params.Currency ?? "";
  const amount = params.Amount ?? "";
  const responseDescription = params.ResponseDescription ?? "";

  console.log(`[Payment Return] MerchantRef=${merchantRef} ResponseCode=${responseCode}`);

  const approved = responseCode === "0";

  if (signature && merchantRef) {
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
      console.error("[Payment Return] Invalid signature — treating as failure");
      return NextResponse.redirect(
        new URL(`/checkout?error=${encodeURIComponent("Payment verification failed. Please contact support.")}`, getBaseUrl()),
        303
      );
    }
  } else if (!signature) {
    console.warn("[Payment Return] No signature present — treating as failure for security");
    return NextResponse.redirect(
      new URL(`/checkout?error=${encodeURIComponent("Payment could not be verified. Please contact support.")}`, getBaseUrl()),
      303
    );
  }

  if (approved && merchantRef) {
    return NextResponse.redirect(
      new URL(`/checkout/success?orderId=${encodeURIComponent(merchantRef)}`, getBaseUrl()),
      303
    );
  }

  const errorMsg = responseDescription || "Payment was not approved";
  return NextResponse.redirect(
    new URL(`/checkout?error=${encodeURIComponent(errorMsg)}`, getBaseUrl()),
    303
  );
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const params: Record<string, string> = {};
  url.searchParams.forEach((v, k) => { params[k] = v; });
  return handleReturn(params);
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const params: Record<string, string> = {};
  formData.forEach((v, k) => { params[k] = String(v); });
  return handleReturn(params);
}
