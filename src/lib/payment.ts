import { getPaymentConfig } from "./payment-config";
import { createHash } from "crypto";

const TEST_URL = "https://sandbox.processtransact.com/api/json.ashx";
const LIVE_URL = "https://gw.processtransact.com/api/json.ashx";

export type PurchaseResult =
  | { ok: true; transactionId: string; transTypeId: string }
  | { ok: false; error: string; redirect?: false }
  | { ok: false; redirect: true; redirectUrl: string; transactionId: string; merchantRef: string };

export type TransactionResult =
  | { ok: true; transactionId: string; responseCode: string; responseDescription: string }
  | { ok: false; error: string };

export type StatusResult =
  | {
      ok: true;
      transactionId: string;
      transTypeId: string;
      merchantRef: string;
      currency: string;
      amount: string;
      responseCode: string;
      responseDescription: string;
    }
  | { ok: false; error: string };

function detectBrand(cardNumber: string): string {
  const n = cardNumber.replace(/\D/g, "");
  if (/^4/.test(n)) return "VISA";
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return "MASTERCARD";
  if (/^3[47]/.test(n)) return "AMEX";
  if (/^3(?:0[0-5]|[68])/.test(n)) return "DINERS";
  if (/^(?:4026|417500|4508|4844|4913|4917)/.test(n)) return "ELECTRON";
  if (/^(?:5018|5020|5038|5893|6304|6759|676[1-3])/.test(n)) return "MAESTRO";
  return "VISA";
}

function parseExpiry(expiry: string): { month: string; year: string } | null {
  const digits = expiry.replace(/\D/g, "");
  if (digits.length === 4) {
    const mm = digits.slice(0, 2);
    const yy = digits.slice(2, 4);
    return { month: mm, year: `20${yy}` };
  }
  if (digits.length === 6) {
    return { month: digits.slice(0, 2), year: digits.slice(2, 6) };
  }
  return null;
}

function getGatewayUrl(useTestMode: boolean): string {
  return useTestMode ? TEST_URL : LIVE_URL;
}

async function postToGateway(
  url: string,
  body: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  return data;
}

function interpretResponse(data: Record<string, unknown>): {
  approved: boolean;
  redirectRequired: boolean;
  responseCode: string;
  responseDescription: string;
  transactionId: string;
  redirectUrl?: string;
} {
  const responseCode = String(data.ResponseCode ?? "");
  const responseDescription = String(data.ResponseDescription ?? "");
  const transactionId = String(data.TransactionID ?? "");

  if (responseCode === "0") {
    return {
      approved: true,
      redirectRequired: false,
      responseCode,
      responseDescription,
      transactionId,
    };
  }

  if (responseCode === "600") {
    return {
      approved: false,
      redirectRequired: true,
      responseCode,
      responseDescription,
      transactionId,
      redirectUrl: String(data.RedirectURL ?? ""),
    };
  }

  return {
    approved: false,
    redirectRequired: false,
    responseCode,
    responseDescription,
    transactionId,
  };
}

export async function purchaseTransaction(params: {
  amountCents: number;
  currency?: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  cardholderName: string;
  merchantRef: string;
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
  dateOfBirth?: string;
  userIP: string;
  successURL?: string;
  failURL?: string;
  callbackURL?: string;
}): Promise<PurchaseResult> {
  const config = await getPaymentConfig();
  const { merchantName, merchantPassword, useTestMode, gatewayCurrency } = config;

  if (!merchantName || !merchantPassword) {
    return {
      ok: false,
      error: "Payment gateway not configured. Go to Admin → Payment to add credentials.",
    };
  }

  const cardNumber = params.cardNumber.replace(/\D/g, "");
  if (cardNumber.length < 13 || cardNumber.length > 19) {
    return { ok: false, error: "Invalid card number" };
  }

  const expiry = parseExpiry(params.cardExpiry);
  if (!expiry) {
    return { ok: false, error: "Invalid expiry (use MM/YY)" };
  }

  const brand = detectBrand(cardNumber);
  const currency = params.currency ?? gatewayCurrency;

  const body: Record<string, unknown> = {
    GatewayID: "2",
    PaymentTypeID: "1",
    TransTypeID: "0",
    MerchantName: merchantName,
    MerchantPassword: merchantPassword,
    MerchantRef: params.merchantRef,
    Currency: currency,
    Amount: params.amountCents,
    Brand: brand,
    CardholderName: params.cardholderName,
    CardNo: cardNumber,
    ExpiryYear: expiry.year,
    ExpiryMonth: expiry.month,
    CVV: params.cardCvv,
    Firstname: params.firstName,
    Surname: params.surname,
    StreetLine1: params.streetLine1,
    City: params.city,
    PostalCode: params.postalCode,
    Country: params.country,
    Email: params.email,
    UserIP: params.userIP,
  };

  if (params.streetLine2) body.StreetLine2 = params.streetLine2;
  if (params.stateProvince) body.StateProvince = params.stateProvince;
  if (params.telephone) body.Telephone = params.telephone;
  if (params.dateOfBirth) body.DateOfBirth = params.dateOfBirth;
  if (params.successURL) body.SuccessURL = params.successURL;
  if (params.failURL) body.FailURL = params.failURL;
  if (params.callbackURL) body.CallbackURL = params.callbackURL;

  try {
    console.log("[Payment] Sending purchase to", getGatewayUrl(useTestMode), "currency:", currency, "merchant:", merchantName);
    const data = await postToGateway(getGatewayUrl(useTestMode), body);
    const result = interpretResponse(data);

    if (result.approved) {
      return {
        ok: true,
        transactionId: result.transactionId,
        transTypeId: String(data.TransTypeID ?? "0"),
      };
    }

    if (result.redirectRequired && result.redirectUrl) {
      return {
        ok: false,
        redirect: true,
        redirectUrl: result.redirectUrl,
        transactionId: result.transactionId,
        merchantRef: params.merchantRef,
      };
    }

    return {
      ok: false,
      error: result.responseDescription || `Payment declined (code ${result.responseCode})`,
    };
  } catch (e) {
    console.error("[Payment] Purchase error:", e);
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Payment service unavailable",
    };
  }
}

export async function captureTransaction(params: {
  transactionId: string;
  merchantRef: string;
  amountCents: number;
  currency?: string;
}): Promise<TransactionResult> {
  const config = await getPaymentConfig();
  const { merchantName, merchantPassword, useTestMode, gatewayCurrency } = config;

  if (!merchantName || !merchantPassword) {
    return { ok: false, error: "Payment gateway not configured." };
  }

  const body = {
    PaymentTypeID: "1",
    TransTypeID: "3",
    MerchantName: merchantName,
    MerchantPassword: merchantPassword,
    MerchantRef: params.merchantRef,
    TransactionID: params.transactionId,
    Amount: params.amountCents,
    Currency: params.currency ?? gatewayCurrency,
  };

  try {
    const data = await postToGateway(getGatewayUrl(useTestMode), body);
    const result = interpretResponse(data);

    if (result.approved) {
      return {
        ok: true,
        transactionId: result.transactionId,
        responseCode: result.responseCode,
        responseDescription: result.responseDescription,
      };
    }

    return { ok: false, error: result.responseDescription || "Capture failed" };
  } catch (e) {
    console.error("[Payment] Capture error:", e);
    return { ok: false, error: e instanceof Error ? e.message : "Payment service unavailable" };
  }
}

export async function cancelTransaction(params: {
  transactionId: string;
  merchantRef: string;
}): Promise<TransactionResult> {
  const config = await getPaymentConfig();
  const { merchantName, merchantPassword, useTestMode } = config;

  if (!merchantName || !merchantPassword) {
    return { ok: false, error: "Payment gateway not configured." };
  }

  const body = {
    PaymentTypeID: "1",
    TransTypeID: "4",
    MerchantName: merchantName,
    MerchantPassword: merchantPassword,
    MerchantRef: params.merchantRef,
    TransactionID: params.transactionId,
  };

  try {
    const data = await postToGateway(getGatewayUrl(useTestMode), body);
    const result = interpretResponse(data);

    if (result.approved) {
      return {
        ok: true,
        transactionId: result.transactionId,
        responseCode: result.responseCode,
        responseDescription: result.responseDescription,
      };
    }

    return { ok: false, error: result.responseDescription || "Cancel failed" };
  } catch (e) {
    console.error("[Payment] Cancel error:", e);
    return { ok: false, error: e instanceof Error ? e.message : "Payment service unavailable" };
  }
}

export async function refundTransaction(params: {
  transactionId: string;
  merchantRef: string;
  amountCents?: number;
  currency?: string;
}): Promise<TransactionResult> {
  const config = await getPaymentConfig();
  const { merchantName, merchantPassword, useTestMode, gatewayCurrency } = config;

  if (!merchantName || !merchantPassword) {
    return { ok: false, error: "Payment gateway not configured." };
  }

  const body = {
    PaymentTypeID: "1",
    TransTypeID: "5",
    MerchantName: merchantName,
    MerchantPassword: merchantPassword,
    MerchantRef: params.merchantRef,
    TransactionID: params.transactionId,
    Amount: params.amountCents,
    Currency: params.currency ?? gatewayCurrency,
  };

  try {
    const data = await postToGateway(getGatewayUrl(useTestMode), body);
    const result = interpretResponse(data);

    if (result.approved) {
      return {
        ok: true,
        transactionId: result.transactionId,
        responseCode: result.responseCode,
        responseDescription: result.responseDescription,
      };
    }

    return { ok: false, error: result.responseDescription || "Refund failed" };
  } catch (e) {
    console.error("[Payment] Refund error:", e);
    return { ok: false, error: e instanceof Error ? e.message : "Payment service unavailable" };
  }
}

export async function checkTransactionStatus(params: {
  merchantRef: string;
}): Promise<StatusResult> {
  const config = await getPaymentConfig();
  const { merchantName, merchantPassword, useTestMode } = config;

  if (!merchantName || !merchantPassword) {
    return { ok: false, error: "Payment gateway not configured." };
  }

  const body = {
    PaymentTypeID: "1",
    TransTypeID: "8",
    MerchantName: merchantName,
    MerchantPassword: merchantPassword,
    MerchantRef: params.merchantRef,
  };

  try {
    const data = await postToGateway(getGatewayUrl(useTestMode), body);
    const responseCode = String(data.ResponseCode ?? "");
    const transTypeId = String(data.TransTypeID ?? "");

    if (transTypeId === "99") {
      return { ok: false, error: "Transaction not found" };
    }

    return {
      ok: true,
      transactionId: String(data.TransactionID ?? ""),
      transTypeId,
      merchantRef: String(data.MerchantRef ?? ""),
      currency: String(data.Currency ?? ""),
      amount: String(data.Amount ?? ""),
      responseCode,
      responseDescription: String(data.ResponseDescription ?? ""),
    };
  } catch (e) {
    console.error("[Payment] Status check error:", e);
    return { ok: false, error: e instanceof Error ? e.message : "Payment service unavailable" };
  }
}

export function computeCallbackSignature(
  merchantPassword: string,
  transactionId: string,
  merchantRef: string,
  currency: string,
  amount: string,
  responseCode: string
): string {
  const raw = `${merchantPassword}${transactionId}${merchantRef}${currency}${amount}${responseCode}`;
  return createHash("sha1").update(raw, "utf8").digest("hex");
}

export function verifyCallbackSignature(params: {
  merchantPassword: string;
  transactionId: string;
  merchantRef: string;
  currency: string;
  amount: string;
  responseCode: string;
  receivedSignature: string;
}): boolean {
  const expected = computeCallbackSignature(
    params.merchantPassword,
    params.transactionId,
    params.merchantRef,
    params.currency,
    params.amount,
    params.responseCode
  );
  return expected.toLowerCase() === params.receivedSignature.toLowerCase();
}
