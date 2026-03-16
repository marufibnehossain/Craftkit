import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const category = await prisma.blogCategory.findUnique({
      where: { id },
      select: { id: true, name: true, slug: true },
    });
    if (!category) {
      return NextResponse.json({ error: "Blog category not found" }, { status: 404 });
    }
    return NextResponse.json(category);
  } catch (e) {
    console.error("[Admin] Blog category get error:", e);
    return NextResponse.json({ error: "Failed to fetch blog category" }, { status: 500 });
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
    const { name, slug } = body as { name?: string; slug?: string };

    if (name === undefined && slug === undefined) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const updated = await prisma.blogCategory.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(slug !== undefined && {
          slug: slug.trim().toLowerCase().replace(/\s+/g, "-"),
        }),
      },
      select: { id: true, name: true, slug: true },
    });

    return NextResponse.json(updated);
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "A blog category with this slug already exists" }, { status: 400 });
    }
    console.error("[Admin] Blog category update error:", e);
    return NextResponse.json({ error: "Failed to update blog category" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const postCount = await prisma.blogPost.count({ where: { categoryId: id } });
    if (postCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${postCount} blog post(s) use this category` },
        { status: 400 }
      );
    }
    await prisma.blogCategory.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[Admin] Blog category delete error:", e);
    return NextResponse.json({ error: "Failed to delete blog category" }, { status: 500 });
  }
}
