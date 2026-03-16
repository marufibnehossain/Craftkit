import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

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
    const attributes = await prisma.productAttribute.findMany({
      where: { productId: id },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(attributes.map((a) => ({
      id: a.id,
      productId: a.productId,
      name: a.name,
      values: JSON.parse(a.values) as string[],
      displayType: a.displayType ?? "button",
      displayData: a.displayData ? (JSON.parse(a.displayData) as Record<string, string>) : undefined,
    })));
  } catch (e) {
    console.error("[Admin] Attributes get error:", e);
    return NextResponse.json({ error: "Failed to fetch attributes" }, { status: 500 });
  }
}

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
    const body = await req.json();
    const { name, values, displayType, displayData } = body;
    if (!name || !Array.isArray(values) || values.length === 0) {
      return NextResponse.json({ error: "Name and values array are required" }, { status: 400 });
    }
    const attribute = await prisma.productAttribute.create({
      data: {
        productId: id,
        name: name.trim(),
        values: JSON.stringify(values.map((v: string) => String(v).trim())),
        displayType: displayType === "swatch" || displayType === "image" ? displayType : "button",
        displayData: displayData && typeof displayData === "object" ? JSON.stringify(displayData) : null,
      },
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
    console.error("[Admin] Attribute create error:", e);
    return NextResponse.json({ error: "Failed to create attribute" }, { status: 500 });
  }
}
