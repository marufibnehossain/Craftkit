import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const applications = await prisma.sellerApplication.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json(applications);
  } catch (e) {
    console.error("[Admin] Seller applications list error:", e);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await req.json();
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    await prisma.sellerApplication.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[Admin] Seller application delete error:", e);
    return NextResponse.json({ error: "Failed to delete application" }, { status: 500 });
  }
}
