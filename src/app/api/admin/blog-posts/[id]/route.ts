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
    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });
    if (!post) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }
    return NextResponse.json({
      ...post,
      publishedAt: post.publishedAt?.toISOString() ?? null,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    });
  } catch (e) {
    console.error("[Admin] Blog post get error:", e);
    return NextResponse.json({ error: "Failed to fetch blog post" }, { status: 500 });
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
    const {
      title,
      slug,
      excerpt,
      body: bodyContent,
      image,
      authorName,
      categoryId,
      publishedAt,
    } = body as {
      title?: string;
      slug?: string;
      excerpt?: string;
      body?: string | null;
      image?: string | null;
      authorName?: string;
      categoryId?: string;
      publishedAt?: string | null;
    };

    const hasUpdates =
      title !== undefined ||
      slug !== undefined ||
      excerpt !== undefined ||
      bodyContent !== undefined ||
      image !== undefined ||
      authorName !== undefined ||
      categoryId !== undefined ||
      publishedAt !== undefined;
    if (!hasUpdates) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const updated = await prisma.blogPost.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(slug !== undefined && { slug: slug.trim().toLowerCase().replace(/\s+/g, "-") }),
        ...(excerpt !== undefined && { excerpt: excerpt.trim() }),
        ...(bodyContent !== undefined && { body: bodyContent?.trim() || null }),
        ...(image !== undefined && { image: image?.trim() || null }),
        ...(authorName !== undefined && { authorName: authorName.trim() }),
        ...(categoryId !== undefined && { categoryId }),
        ...(publishedAt !== undefined && { publishedAt: publishedAt ? new Date(publishedAt) : null }),
      },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });

    return NextResponse.json({
      ...updated,
      publishedAt: updated.publishedAt?.toISOString() ?? null,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "A blog post with this slug already exists" }, { status: 400 });
    }
    if (err?.code === "P2003") {
      return NextResponse.json({ error: "Invalid categoryId" }, { status: 400 });
    }
    console.error("[Admin] Blog post update error:", e);
    return NextResponse.json({ error: "Failed to update blog post" }, { status: 500 });
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
    await prisma.blogPost.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[Admin] Blog post delete error:", e);
    return NextResponse.json({ error: "Failed to delete blog post" }, { status: 500 });
  }
}
