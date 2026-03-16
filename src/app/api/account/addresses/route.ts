import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth-options";

async function getUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email.toLowerCase() },
    select: { id: true },
  });

  return user?.id ?? null;
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
      select: {
        id: true,
        label: true,
        address: true,
        city: true,
        zip: true,
        country: true,
        isDefault: true,
      },
    });

    return NextResponse.json(addresses);
  } catch (e) {
    console.error("[Account] Addresses GET error:", e);
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { label, address, city, zip, country, isDefault } = body as {
      label?: string;
      address: string;
      city: string;
      zip: string;
      country: string;
      isDefault?: boolean;
    };

    if (!address || !city || !zip || !country) {
      return NextResponse.json({ error: "address, city, zip, country required" }, { status: 400 });
    }

    const def = Boolean(isDefault);

    if (def) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const created = await prisma.address.create({
      data: {
        userId,
        label: typeof label === "string" ? label.trim() || null : null,
        address: String(address).trim(),
        city: String(city).trim(),
        zip: String(zip).trim(),
        country: String(country).trim(),
        isDefault: def,
      },
      select: {
        id: true,
        label: true,
        address: true,
        city: true,
        zip: true,
        country: true,
        isDefault: true,
      },
    });

    return NextResponse.json(created);
  } catch (e) {
    console.error("[Account] Addresses POST error:", e);
    return NextResponse.json({ error: "Failed to create address" }, { status: 500 });
  }
}
