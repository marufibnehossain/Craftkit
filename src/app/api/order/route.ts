import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { isCodEnabled } from "@/lib/checkout-settings";

type ItemInput = {
  productId?: string;
  name: string;
  quantity: number;
  price: number;
  variationId?: string;
  variationLabel?: string;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      email,
      name,
      address,
      city,
      zip,
      country,
      items,
      subtotal,
      discount = 0,
      shipping,
      total,
      coupon,
      transactionId,
      paymentMethod,
    } = body as {
      email: string;
      name?: string;
      address: string;
      city: string;
      zip: string;
      country: string;
      items: ItemInput[];
      subtotal: number;
      discount?: number;
      shipping: number;
      total: number;
      coupon?: string | null;
      transactionId?: string;
      paymentMethod?: string;
    };

    if (paymentMethod === "cod") {
      const codOn = await isCodEnabled();
      if (!codOn) {
        return NextResponse.json({ error: "Cash on delivery is not available" }, { status: 400 });
      }
    }

    if (
      !email ||
      typeof email !== "string" ||
      !address ||
      typeof address !== "string" ||
      !city ||
      !zip ||
      !country ||
      !Array.isArray(items) ||
      items.length === 0 ||
      typeof subtotal !== "number" ||
      typeof shipping !== "number" ||
      typeof total !== "number"
    ) {
      return NextResponse.json(
        { error: "Missing or invalid fields: email, address, city, zip, country, items, subtotal, shipping, total" },
        { status: 400 }
      );
    }

    const subtotalCents = Math.round(subtotal * 100);
    const discountCents = Math.round((discount || 0) * 100);
    const shippingCents = Math.round(shipping * 100);
    const totalCents = Math.round(total * 100);

    const couponCode = typeof coupon === "string" ? coupon.trim() || null : null;

    const order = await prisma.order.create({
      data: {
        email: email.trim().toLowerCase(),
        name: typeof name === "string" ? name.trim() || null : null,
        address: String(address).trim(),
        city: String(city).trim(),
        zip: String(zip).trim(),
        country: String(country).trim(),
        subtotalCents,
        discountCents,
        shippingCents,
        totalCents,
        couponCode,
        status: "PENDING",
        transactionId: typeof transactionId === "string" ? transactionId : null,
        paymentMethod: typeof paymentMethod === "string" ? paymentMethod : null,
        items: {
          create: (items as ItemInput[]).map((i) => ({
            productId: i.productId ?? "unknown",
            name: String(i.name),
            priceCents: Math.round(Number(i.price) * 100),
            quantity: Math.max(1, Math.floor(Number(i.quantity) || 1)),
            variationId: i.variationId ?? null,
            variationLabel: i.variationLabel ?? null,
          })),
        },
      },
      include: { items: true },
    });

    if (couponCode) {
      await prisma.coupon.updateMany({
        where: { code: couponCode.toUpperCase() },
        data: { usedCount: { increment: 1 } },
      });
    }

    try {
      await sendOrderConfirmationEmail(email, {
        name: typeof name === "string" ? name.trim() || undefined : undefined,
        items: items.map((i: ItemInput) => ({
          name: i.name,
          quantity: Number(i.quantity) || 1,
          price: Number(i.price) || 0,
        })),
        subtotal,
        discount: discount || 0,
        coupon: typeof coupon === "string" ? coupon.trim() || undefined : undefined,
        shipping,
        total,
      });
    } catch (_) {
      // Order already created; email failure is non-fatal
    }

    return NextResponse.json({ ok: true, orderId: order.id });
  } catch (e) {
    console.error("[Order] Create error:", e);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
