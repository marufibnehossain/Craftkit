import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { sendOrderStatusEmail } from "@/lib/email";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    const productIds = Array.from(new Set(order.items.map((i) => i.productId).filter(Boolean)));
    const products = productIds.length
      ? await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, slug: true },
        })
      : [];
    const slugByProductId = Object.fromEntries(products.map((p) => [p.id, p.slug]));
    const items = order.items.map((item) => ({
      ...item,
      product: item.productId && slugByProductId[item.productId]
        ? { slug: slugByProductId[item.productId] }
        : null,
    }));
    return NextResponse.json({
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items,
    });
  } catch (e) {
    console.error("[Admin] Order get error:", e);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, trackingNumber, trackingCarrier, transactionId } = body;
    const allowed = ["PENDING", "PROCESSING", "ON_HOLD", "COMPLETED", "CANCELLED", "REFUNDED", "FAILED", "DRAFT"];

    const data: { status?: string; trackingNumber?: string | null; trackingCarrier?: string | null; transactionId?: string | null } = {};
    if (typeof status === "string" && allowed.includes(status)) {
      data.status = status;
    }
    if (trackingNumber !== undefined) {
      data.trackingNumber = typeof trackingNumber === "string" ? trackingNumber : null;
    }
    if (trackingCarrier !== undefined) {
      data.trackingCarrier = typeof trackingCarrier === "string" ? trackingCarrier : null;
    }
    if (transactionId !== undefined) {
      data.transactionId = typeof transactionId === "string" ? transactionId : null;
    }
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id },
      data,
      include: { items: true },
    });

    const productIds = Array.from(new Set(order.items.map((i) => i.productId).filter(Boolean)));
    const products = productIds.length
      ? await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, slug: true },
        })
      : [];
    const slugByProductId = Object.fromEntries(products.map((p) => [p.id, p.slug]));
    const items = order.items.map((item) => ({
      ...item,
      product: item.productId && slugByProductId[item.productId]
        ? { slug: slugByProductId[item.productId] }
        : null,
    }));

    // Send status email when status changed to COMPLETED, CANCELLED, or REFUNDED
    if (typeof status === "string" && ["COMPLETED", "CANCELLED", "REFUNDED"].includes(status)) {
      try {
        await sendOrderStatusEmail(order.email, {
          orderId: order.id,
          name: order.name ?? undefined,
          status,
          trackingNumber: order.trackingNumber ?? undefined,
          trackingCarrier: order.trackingCarrier ?? undefined,
        });
      } catch (_) {
        // Email failure is non-fatal; order was updated successfully
      }
    }

    return NextResponse.json({
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items,
    });
  } catch (e) {
    console.error("[Admin] Order update error:", e);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    await prisma.orderItem.deleteMany({ where: { orderId: id } });
    await prisma.order.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[Admin] Order delete error:", e);
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}
