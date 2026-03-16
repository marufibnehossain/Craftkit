import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; attrId: string }> }
) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { attrId } = await params;
    const body = await req.json();
    const { name, values, displayType, displayData } = body;
    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name.trim();
    if (values !== undefined) {
      if (!Array.isArray(values) || values.length === 0) {
        return NextResponse.json({ error: "Values must be a non-empty array" }, { status: 400 });
      }
      data.values = JSON.stringify(values.map((v: string) => String(v).trim()));
    }
    if (displayType !== undefined) {
      data.displayType = displayType === "swatch" || displayType === "image" ? displayType : "button";
    }
    if (displayData !== undefined) {
      data.displayData = displayData && typeof displayData === "object" ? JSON.stringify(displayData) : null;
    }
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }
    const attribute = await prisma.productAttribute.update({
      where: { id: attrId },
      data,
    });
    return NextResponse.json({
      id: attribute.id,
      productId: attribute.productId,
      name: attribute.name,
      values: JSON.parse(attribute.values) as string[],
      displayType: attribute.displayType ?? "button",
      displayData: attribute.displayData ? (JSON.parse(attribute.displayData) as Record<string, string>) : undefined,
    });
  } catch (e) {
    console.error("[Admin] Attribute update error:", e);
    return NextResponse.json({ error: "Failed to update attribute" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; attrId: string }> }
) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { attrId } = await params;
    await prisma.productAttribute.delete({ where: { id: attrId } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[Admin] Attribute delete error:", e);
    return NextResponse.json({ error: "Failed to delete attribute" }, { status: 500 });
  }
}
