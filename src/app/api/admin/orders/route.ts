import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

const HAS_DATABASE_URL = !!process.env.DATABASE_URL?.trim();

export async function GET(req: Request) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!HAS_DATABASE_URL) {
    return NextResponse.json([]);
  }
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10)));
    const orders = await prisma.order.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { items: true },
    });
    return NextResponse.json(orders);
  } catch (e) {
    console.error("[Admin] Orders list error:", e);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { ids } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "ids array required" }, { status: 400 });
    }
    await prisma.orderItem.deleteMany({ where: { orderId: { in: ids } } });
    const { count } = await prisma.order.deleteMany({ where: { id: { in: ids } } });
    return NextResponse.json({ ok: true, deleted: count });
  } catch (e) {
    console.error("[Admin] Bulk order delete error:", e);
    return NextResponse.json({ error: "Failed to delete orders" }, { status: 500 });
  }
}
