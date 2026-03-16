import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { refundTransaction } from "@/lib/payment";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const partialAmountCents = typeof body.amountCents === "number" ? body.amountCents : undefined;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!order.transactionId) {
      return NextResponse.json(
        { error: "No transaction ID on this order. Cannot process gateway refund." },
        { status: 400 }
      );
    }

    if (order.status === "REFUNDED") {
      return NextResponse.json(
        { error: "Order has already been refunded." },
        { status: 400 }
      );
    }

    const result = await refundTransaction({
      transactionId: order.transactionId,
      merchantRef: order.id,
      amountCents: partialAmountCents,
    });

    if (!result.ok) {
      console.error(`[Admin Refund] Failed for order ${id}:`, result.error);
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    await prisma.order.update({
      where: { id },
      data: { status: "REFUNDED" },
    });

    console.log(`[Admin Refund] Order ${id} refunded. Gateway TX: ${result.transactionId}`);

    return NextResponse.json({
      ok: true,
      refundTransactionId: result.transactionId,
      responseDescription: result.responseDescription,
    });
  } catch (e) {
    console.error("[Admin Refund] Error:", e);
    return NextResponse.json({ error: "Refund failed" }, { status: 500 });
  }
}
