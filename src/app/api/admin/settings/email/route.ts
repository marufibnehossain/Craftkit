import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { siteConfig } from "@/lib/site-config";

const KEYS = {
  HOST: "smtp_host",
  PORT: "smtp_port",
  USER: "smtp_user",
  PASS: "smtp_pass",
  FROM_EMAIL: "smtp_from_email",
} as const;

function hasSettingModel(): boolean {
  return typeof (prisma as { setting?: unknown }).setting !== "undefined";
}

async function getSetting(key: string): Promise<string | null> {
  if (!hasSettingModel()) return null;
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? null;
}

async function setSetting(key: string, value: string): Promise<boolean> {
  if (!hasSettingModel()) return false;
  await prisma.setting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
  return true;
}

export async function GET() {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const [host, port, user, pass, fromEmail] = await Promise.all([
      getSetting(KEYS.HOST),
      getSetting(KEYS.PORT),
      getSetting(KEYS.USER),
      getSetting(KEYS.PASS),
      getSetting(KEYS.FROM_EMAIL),
    ]);

    const env = process.env;
    return NextResponse.json({
      host: host ?? env.SMTP_HOST ?? "",
      port: port ?? env.SMTP_PORT ?? "587",
      user: user ?? env.SMTP_USER ?? "",
      passwordMasked: (pass ?? env.SMTP_PASS) ? "••••••••••••" : "",
      hasPassword: !!(pass ?? env.SMTP_PASS),
      fromEmail: fromEmail ?? env.SMTP_FROM_EMAIL ?? `${siteConfig.name} <${siteConfig.contactEmail}>`,
    });
  } catch (e) {
    console.error("[Admin] Email settings get error:", e);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { host, port, user, password, fromEmail } = body as {
      host?: string;
      port?: string | number;
      user?: string;
      password?: string;
      fromEmail?: string;
    };

    if (typeof host === "string") {
      await setSetting(KEYS.HOST, host.trim());
    }
    if (port !== undefined) {
      await setSetting(KEYS.PORT, String(Number(port) || 587));
    }
    if (typeof user === "string") {
      await setSetting(KEYS.USER, user.trim());
    }
    if (typeof password === "string" && password !== "") {
      await setSetting(KEYS.PASS, password);
    }
    if (typeof fromEmail === "string") {
      await setSetting(KEYS.FROM_EMAIL, fromEmail.trim());
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[Admin] Email settings update error:", e);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
