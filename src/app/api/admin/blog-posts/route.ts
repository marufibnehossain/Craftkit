import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET(req: Request) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId") || undefined;

    const posts = await prisma.blogPost.findMany({
      where: categoryId ? { categoryId } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json(
      posts.map((p) => ({
        ...p,
        publishedAt: p.publishedAt?.toISOString() ?? null,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      }))
    );
  } catch (e) {
    console.error("[Admin] Blog posts list error:", e);
    return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const json = await req.json();
    const {
      title,
      slug,
      excerpt,
      body: bodyContent,
      image,
      authorName,
      categoryId,
      publishedAt,
    } = json as {
      title: string;
      slug: string;
      excerpt: string;
      body?: string | null;
      image?: string | null;
      authorName: string;
      categoryId: string;
      publishedAt?: string | null;
    };

    if (!title || !slug || !excerpt || !authorName || !categoryId) {
      return NextResponse.json(
        { error: "Title, slug, excerpt, authorName, and categoryId are required" },
        { status: 400 }
      );
    }

    const slugClean = slug.trim().toLowerCase().replace(/\s+/g, "-");
    const publishedAtDate = publishedAt ? new Date(publishedAt) : null;

    const created = await prisma.blogPost.create({
      data: {
        title: title.trim(),
        slug: slugClean,
        excerpt: excerpt.trim(),
        body: bodyContent?.trim() || null,
        image: image?.trim() || null,
        authorName: authorName.trim(),
        categoryId,
        publishedAt: publishedAtDate,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json({
      ...created,
      publishedAt: created.publishedAt?.toISOString() ?? null,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    });
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "A blog post with this slug already exists" }, { status: 400 });
    }
    if (err?.code === "P2003") {
      return NextResponse.json({ error: "Invalid categoryId" }, { status: 400 });
    }
    console.error("[Admin] Blog post create error:", e);
    return NextResponse.json({ error: "Failed to create blog post" }, { status: 500 });
  }
}
