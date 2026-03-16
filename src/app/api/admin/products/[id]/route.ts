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
    const p = await prisma.product.findUnique({
      where: { id },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });
    if (!p) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({
      id: p.id,
      slug: p.slug,
      productCode: p.productCode,
      name: p.name,
      price: p.priceCents / 100,
      compareAt: p.compareAtCents ? p.compareAtCents / 100 : null,
      rating: p.rating,
      reviewCount: p.reviewCount,
      images: JSON.parse(p.images) as string[],
      category: p.category ?? { id: p.categoryId, name: "Unknown", slug: "" },
      tags: JSON.parse(p.tags) as string[],
      shortDesc: p.shortDesc,
      longDesc: p.longDesc,
      ingredients: p.ingredients,
      howToUse: p.howToUse,
      stock: p.stock,
      trackInventory: p.trackInventory,
      badge: p.badge ?? null,
      isDownloadable: p.isDownloadable,
      downloadFiles: p.downloadFiles ? JSON.parse(p.downloadFiles) : [],
    });
  } catch (e) {
    console.error("[Admin] Product get error:", e);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
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
    const data: Record<string, unknown> = {};
    if (body.slug !== undefined) data.slug = String(body.slug).trim();
    if (body.productCode !== undefined) data.productCode = body.productCode ? String(body.productCode).trim() : null;
    if (body.name !== undefined) data.name = String(body.name).trim();
    if (typeof body.price === "number") data.priceCents = Math.round(body.price * 100);
    if (body.compareAt !== undefined) data.compareAtCents = body.compareAt ? Math.round(body.compareAt * 100) : null;
    if (typeof body.rating === "number") data.rating = body.rating;
    if (typeof body.reviewCount === "number") data.reviewCount = body.reviewCount;
    if (body.images !== undefined) data.images = JSON.stringify(Array.isArray(body.images) ? body.images : [body.images || "/images/placeholder.svg"]);
    if (body.categoryId !== undefined) data.categoryId = String(body.categoryId);
    if (body.tags !== undefined) data.tags = JSON.stringify(Array.isArray(body.tags) ? body.tags : []);
    if (body.shortDesc !== undefined) data.shortDesc = String(body.shortDesc).trim();
    if (body.longDesc !== undefined) data.longDesc = body.longDesc ? String(body.longDesc).trim() : null;
    if (body.ingredients !== undefined) data.ingredients = body.ingredients ? String(body.ingredients).trim() : null;
    if (body.howToUse !== undefined) data.howToUse = body.howToUse ? String(body.howToUse).trim() : null;
    if (typeof body.stock === "number") data.stock = Math.max(0, Math.floor(body.stock));
    if (body.trackInventory !== undefined) data.trackInventory = Boolean(body.trackInventory);
    if (body.badge !== undefined) data.badge = body.badge === "NEW" || body.badge === "BESTSELLER" ? body.badge : null;
    if (body.isDownloadable !== undefined) data.isDownloadable = Boolean(body.isDownloadable);
    if (body.downloadFiles !== undefined) data.downloadFiles = Array.isArray(body.downloadFiles) && body.downloadFiles.length > 0 ? JSON.stringify(body.downloadFiles) : null;
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }
    const p = await prisma.product.update({
      where: { id },
      data,
      include: { category: { select: { id: true, name: true, slug: true } } },
    });
    return NextResponse.json({
      id: p.id,
      slug: p.slug,
      productCode: p.productCode,
      name: p.name,
      price: p.priceCents / 100,
      compareAt: p.compareAtCents ? p.compareAtCents / 100 : null,
      rating: p.rating,
      reviewCount: p.reviewCount,
      images: JSON.parse(p.images) as string[],
      category: p.category ?? { id: p.categoryId, name: "Unknown", slug: "" },
      tags: JSON.parse(p.tags) as string[],
      shortDesc: p.shortDesc,
      longDesc: p.longDesc,
      ingredients: p.ingredients,
      howToUse: p.howToUse,
      stock: p.stock,
      trackInventory: p.trackInventory,
      badge: p.badge ?? null,
      isDownloadable: p.isDownloadable,
      downloadFiles: p.downloadFiles ? JSON.parse(p.downloadFiles) : [],
    });
  } catch (e: unknown) {
    const err = e as { code?: string; message?: string };
    if (err?.code === "P2002" || err?.message?.includes("Unique constraint") || err?.message?.includes("UNIQUE")) {
      return NextResponse.json({ error: "A product with this slug already exists" }, { status: 400 });
    }
    console.error("[Admin] Product update error:", e);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
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
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[Admin] Product delete error:", e);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
