import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { sendSellerApplicationNotificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id, emails } = await req.json();
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Missing application id" }, { status: 400 });
    }
    if (!Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: "At least one email is required" }, { status: 400 });
    }
    const validEmails = emails
      .filter((e: unknown) => typeof e === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
      .map((e: string) => e.trim());
    if (validEmails.length === 0) {
      return NextResponse.json({ error: "No valid email addresses provided" }, { status: 400 });
    }

    const app = await prisma.sellerApplication.findUnique({ where: { id } });
    if (!app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const results: { email: string; ok: boolean }[] = [];
    for (const to of validEmails) {
      try {
        const result = await sendSellerApplicationNotificationEmail({
          displayName: app.displayName,
          email: app.email || "Not provided",
          role: app.role,
          level: app.level,
          categories: app.categories,
          platforms: app.platforms,
          bio: app.bio || "",
        }, to);
        results.push({ email: to, ok: result.ok });
      } catch (_) {
        results.push({ email: to, ok: false });
      }
    }

    return NextResponse.json({ ok: true, results });
  } catch (e) {
    console.error("[Admin] Forward seller application error:", e);
    return NextResponse.json({ error: "Failed to forward application" }, { status: 500 });
  }
}
