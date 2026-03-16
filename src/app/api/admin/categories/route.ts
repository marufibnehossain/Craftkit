import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { HAS_DATABASE_URL } from "@/lib/has-database";

export async function GET() {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!HAS_DATABASE_URL) {
    return NextResponse.json([]);
  }
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        parentId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return NextResponse.json(
      categories.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      }))
    );
  } catch (e) {
    console.error("[Admin] Categories list error:", e);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!HAS_DATABASE_URL) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  try {
    const body = await req.json();
    const {
      name,
      slug,
      image,
      parentId,
    } = body as {
      name: string;
      slug: string;
      image?: string | null;
      parentId?: string | null;
    };

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
    }

    const slugClean = slug.trim().toLowerCase().replace(/\s+/g, "-");

    const created = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: slugClean,
        image: image?.trim() || null,
        parentId: parentId || null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        parentId: true,
      },
    });

    return NextResponse.json(created);
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "A category with this slug already exists" }, { status: 400 });
    }
    console.error("[Admin] Category create error:", e);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
