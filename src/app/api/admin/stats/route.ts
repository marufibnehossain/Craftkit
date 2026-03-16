import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

const HAS_DATABASE_URL = !!process.env.DATABASE_URL?.trim();

export async function GET() {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!HAS_DATABASE_URL) {
    return NextResponse.json({
      totalOrders: 0,
      pendingOrders: 0,
      ordersToday: 0,
      ordersThisWeek: 0,
      revenueTodayCents: 0,
      revenueThisWeekCents: 0,
      lowStockProducts: [],
      revenueByDay: [],
    });
  }
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
    const sevenDaysAgo = new Date(startOfToday);
    sevenDaysAgo.setDate(startOfToday.getDate() - 6);

    const [totalOrders, pendingOrders, ordersToday, ordersThisWeek, revenueTodayAgg, revenueWeekAgg, lowStockProducts, recentOrders] =
      await Promise.all([
        prisma.order.count(),
        prisma.order.count({ where: { status: "PENDING" } }),
        prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
        prisma.order.count({ where: { createdAt: { gte: startOfWeek } } }),
        prisma.order.aggregate({
          _sum: { totalCents: true },
          where: {
            createdAt: { gte: startOfToday },
            status: { not: "CANCELLED" },
          },
        }),
        prisma.order.aggregate({
          _sum: { totalCents: true },
          where: {
            createdAt: { gte: startOfWeek },
            status: { not: "CANCELLED" },
          },
        }),
        prisma.product.findMany({
          where: {
            trackInventory: true,
            stock: { gt: 0, lte: 5 },
          },
          orderBy: { stock: "asc" },
          take: 10,
          select: { id: true, name: true, stock: true },
        }),
        prisma.order.findMany({
          where: { createdAt: { gte: sevenDaysAgo } },
          select: { createdAt: true, totalCents: true, status: true },
        }),
      ]);

    const revenueTodayCents = revenueTodayAgg._sum.totalCents ?? 0;
    const revenueThisWeekCents = revenueWeekAgg._sum.totalCents ?? 0;

    const revenueMap = new Map<string, { orders: number; revenue: number }>();
    for (const order of recentOrders) {
      const key = order.createdAt.toISOString().slice(0, 10);
      const entry = revenueMap.get(key) ?? { orders: 0, revenue: 0 };
      entry.orders += 1;
      if (order.status !== "CANCELLED") {
        entry.revenue += order.totalCents;
      }
      revenueMap.set(key, entry);
    }
    const revenueByDay = Array.from(revenueMap.entries())
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([date, { orders, revenue }]) => ({ date, orders, revenue }));

    return NextResponse.json({
      totalOrders,
      pendingOrders,
      ordersToday,
      ordersThisWeek,
      revenueTodayCents,
      revenueThisWeekCents,
      lowStockProducts,
      revenueByDay,
    });
  } catch (e) {
    console.error("[Admin] Stats error:", e);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
