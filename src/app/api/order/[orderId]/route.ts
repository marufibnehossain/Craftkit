import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { requireAdmin } from "@/lib/admin";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await req.json();

    const { authorized: isAdmin } = await requireAdmin();

    if (isAdmin) {
      const data: Record<string, unknown> = {};
      if (typeof body.status === "string") data.status = body.status;
      if (typeof body.transactionId === "string") data.transactionId = body.transactionId;

      if (Object.keys(data).length === 0) {
        return NextResponse.json({ error: "No valid fields" }, { status: 400 });
      }

      const updated = await prisma.order.update({
        where: { id: orderId },
        data,
      });
      return NextResponse.json({ ok: true, status: updated.status });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.email.toLowerCase() !== session.user.email.toLowerCase()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({ ok: true, status: order.status });
  } catch (e) {
    console.error("[Order PATCH] Error:", e);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
