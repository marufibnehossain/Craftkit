import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; varId: string }> }
) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { varId } = await params;
    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (body.attributes !== undefined) {
      if (!body.attributes || typeof body.attributes !== "object") {
        return NextResponse.json({ error: "Attributes must be an object" }, { status: 400 });
      }
      data.attributes = JSON.stringify(body.attributes);
    }
    if (body.price !== undefined) {
      data.priceCents = body.price != null ? Math.round(body.price * 100) : null;
    }
    if (typeof body.stock === "number") {
      data.stock = Math.max(0, Math.floor(body.stock));
    }
    if (body.sku !== undefined) {
      data.sku = body.sku?.trim() || null;
    }
    if (body.images !== undefined) {
      data.images = body.images && Array.isArray(body.images) && body.images.length > 0 ? JSON.stringify(body.images) : null;
    }
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }
    const v = await prisma.productVariation.update({
      where: { id: varId },
      data,
    });
    return NextResponse.json({
      id: v.id,
      productId: v.productId,
      attributes: JSON.parse(v.attributes) as Record<string, string>,
      price: v.priceCents ? v.priceCents / 100 : null,
      stock: v.stock,
      sku: v.sku,
      images: v.images ? (JSON.parse(v.images) as string[]) : null,
    });
  } catch (e) {
    console.error("[Admin] Variation update error:", e);
    return NextResponse.json({ error: "Failed to update variation" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; varId: string }> }
) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { varId } = await params;
    await prisma.productVariation.delete({ where: { id: varId } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[Admin] Variation delete error:", e);
    return NextResponse.json({ error: "Failed to delete variation" }, { status: 500 });
  }
}
