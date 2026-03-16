import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

const HAS_DATABASE_URL = !!process.env.DATABASE_URL?.trim();

export async function GET() {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!HAS_DATABASE_URL) {
    return NextResponse.json([]);
  }
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            addresses: true,
            wishlistItems: true,
          },
        },
      },
    });
    return NextResponse.json(users);
  } catch (e) {
    console.error("[Admin] Users list error:", e);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!HAS_DATABASE_URL) {
    return NextResponse.json({ error: "No database" }, { status: 500 });
  }
  try {
    const body = await req.json();
    const { id, name, email, role, emailVerified } = body;
    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }
    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(role !== undefined && { role }),
        ...(emailVerified !== undefined && {
          emailVerified: emailVerified ? new Date() : null,
        }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            addresses: true,
            wishlistItems: true,
          },
        },
      },
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error("[Admin] User update error:", e);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!HAS_DATABASE_URL) {
    return NextResponse.json({ error: "No database" }, { status: 500 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }
    await prisma.verificationToken.deleteMany({ where: { userId: id } });
    await prisma.passwordResetToken.deleteMany({ where: { userId: id } });
    await prisma.wishlistItem.deleteMany({ where: { userId: id } });
    await prisma.address.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[Admin] User delete error:", e);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
