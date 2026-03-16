import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(
      coupons.map((c) => ({
        ...c,
        expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
        createdAt: c.createdAt.toISOString(),
      }))
    );
  } catch (e) {
    console.error("[Admin] Coupons list error:", e);
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { code, type, value, minOrderCents, maxUses, expiresAt } = body as {
      code: string;
      type: string;
      value: number | string;
      minOrderCents?: number | string | null;
      maxUses?: number | string | null;
      expiresAt?: string | null;
    };
    const codeStr = typeof code === "string" ? code.trim().toUpperCase() : "";
    if (!codeStr) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }
    if (!["PERCENT", "FIXED"].includes(type)) {
      return NextResponse.json({ error: "Type must be PERCENT or FIXED" }, { status: 400 });
    }
    const valueNum = parseInt(String(value), 10);
    if (Number.isNaN(valueNum) || valueNum < 0) {
      return NextResponse.json({ error: "Value must be a positive number" }, { status: 400 });
    }
    if (type === "PERCENT" && valueNum > 100) {
      return NextResponse.json({ error: "Percent value cannot exceed 100" }, { status: 400 });
    }
    const minCentsRaw = minOrderCents != null ? parseInt(String(minOrderCents), 10) : null;
    const minCents = Number.isNaN(minCentsRaw as number) ? null : (minCentsRaw as number | null);
    const expires = expiresAt ? new Date(expiresAt) : null;
    const maxUsesRaw = maxUses != null && maxUses !== "" ? parseInt(String(maxUses), 10) : null;
    const maxUsesNum =
      maxUsesRaw != null && !Number.isNaN(maxUsesRaw) && maxUsesRaw > 0 ? maxUsesRaw : null;

    const created = await prisma.coupon.create({
      data: {
        code: codeStr,
        type,
        value: valueNum,
        minOrderCents: minCents,
        maxUses: maxUsesNum,
        usedCount: 0,
        expiresAt: expires && !Number.isNaN(expires.getTime()) ? expires : null,
      },
    });

    return NextResponse.json({
      ...created,
      expiresAt: created.expiresAt ? created.expiresAt.toISOString() : null,
      createdAt: created.createdAt.toISOString(),
    });
  } catch (e: any) {
    if (e?.code === "P2002" || e?.message?.includes("UNIQUE")) {
      return NextResponse.json({ error: "A coupon with this code already exists" }, { status: 400 });
    }
    console.error("[Admin] Coupon create error:", e);
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}
