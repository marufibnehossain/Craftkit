import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSellerApplicationNotificationEmail } from "@/lib/email";
import { verifyRecaptchaToken } from "@/lib/recaptcha-config";

const VALID_ROLES = ["seller", "designer"];
const VALID_LEVELS = ["beginner", "intermediate", "expert"];
const VALID_CATEGORIES = ["knitting", "sewing", "fashion", "other"];
const VALID_PLATFORMS = ["instagram", "marketplaces", "website", "local"];

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const captchaValid = await verifyRecaptchaToken(body?.recaptchaToken ?? "");
    if (!captchaValid) {
      return NextResponse.json({ error: "reCAPTCHA verification failed" }, { status: 400 });
    }
    const role = typeof body?.role === "string" ? body.role.trim() : "";
    const level = typeof body?.level === "string" ? body.level.trim() : "";
    const rawCategories = Array.isArray(body?.categories) ? body.categories.filter((c: unknown) => typeof c === "string") : [];
    const rawPlatforms = Array.isArray(body?.platforms) ? body.platforms.filter((p: unknown) => typeof p === "string") : [];
    const displayName = typeof body?.displayName === "string" ? body.displayName.trim().slice(0, 200) : "";
    const bio = typeof body?.bio === "string" ? body.bio.trim().slice(0, 2000) || null : null;
    const email = typeof body?.email === "string" ? body.email.trim().slice(0, 200) || null : null;

    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    if (!VALID_LEVELS.includes(level)) {
      return NextResponse.json({ error: "Invalid level" }, { status: 400 });
    }
    const categories = rawCategories.filter((c: string) => VALID_CATEGORIES.includes(c));
    const platforms = rawPlatforms.filter((p: string) => VALID_PLATFORMS.includes(p));
    if (categories.length === 0) {
      return NextResponse.json({ error: "At least one category is required" }, { status: 400 });
    }
    if (!displayName) {
      return NextResponse.json({ error: "Display name is required" }, { status: 400 });
    }

    const categoriesStr = categories.join(", ");
    const platformsStr = platforms.join(", ");

    const application = await prisma.sellerApplication.create({
      data: { role, level, categories: categoriesStr, platforms: platformsStr, displayName, bio, email },
    });

    try {
      const notifSetting = await prisma.setting.findUnique({ where: { key: "seller_notification_emails" } });
      const notifEmails = notifSetting?.value
        ? notifSetting.value.split(",").map((e: string) => e.trim()).filter(Boolean)
        : [];

      const emailPayload = {
        displayName,
        email: email || "Not provided",
        role,
        level,
        categories: categoriesStr,
        platforms: platformsStr,
        bio: bio || "",
      };

      await sendSellerApplicationNotificationEmail(emailPayload);

      for (const notifEmail of notifEmails) {
        try {
          await sendSellerApplicationNotificationEmail(emailPayload, notifEmail);
        } catch (_) {}
      }
    } catch (_) {}

    return NextResponse.json({ ok: true, id: application.id });
  } catch (e) {
    console.error("[SellerApplication] Submit error:", e);
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 });
  }
}
