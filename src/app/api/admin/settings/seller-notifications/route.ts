import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const setting = await prisma.setting.findUnique({ where: { key: "seller_notification_emails" } });
  return NextResponse.json({ emails: setting?.value || "" });
}

export async function PATCH(req: Request) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { emails } = await req.json();
  if (typeof emails !== "string") {
    return NextResponse.json({ error: "Invalid emails" }, { status: 400 });
  }
  await prisma.setting.upsert({
    where: { key: "seller_notification_emails" },
    update: { value: emails },
    create: { key: "seller_notification_emails", value: emails },
  });
  return NextResponse.json({ ok: true });
}
