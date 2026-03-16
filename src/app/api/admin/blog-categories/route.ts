import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const categories = await prisma.blogCategory.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, createdAt: true, updatedAt: true },
    });
    return NextResponse.json(
      categories.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      }))
    );
  } catch (e) {
    console.error("[Admin] Blog categories list error:", e);
    return NextResponse.json({ error: "Failed to fetch blog categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { name, slug } = body as { name: string; slug: string };

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
    }

    const slugClean = slug.trim().toLowerCase().replace(/\s+/g, "-");

    const created = await prisma.blogCategory.create({
      data: { name: name.trim(), slug: slugClean },
      select: { id: true, name: true, slug: true },
    });

    return NextResponse.json(created);
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "A blog category with this slug already exists" }, { status: 400 });
    }
    console.error("[Admin] Blog category create error:", e);
    return NextResponse.json({ error: "Failed to create blog category" }, { status: 500 });
  }
}
