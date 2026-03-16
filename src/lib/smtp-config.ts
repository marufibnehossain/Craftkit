/**
 * SMTP configuration – reads from DB (Admin settings) first, then env.
 * Used by email.ts when sending emails.
 */

import { prisma } from "@/lib/prisma";
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
  try {
    const row = await prisma.setting.findUnique({ where: { key } });
    return row?.value ?? null;
  } catch (e) {
    console.error(`[SMTP] Failed to read setting "${key}":`, e);
    return null;
  }
}

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  fromEmail: string;
}

export async function getSmtpConfig(): Promise<SmtpConfig | null> {
  const [dbHost, dbPort, dbUser, dbPass, dbFrom] = await Promise.all([
    getSetting(KEYS.HOST),
    getSetting(KEYS.PORT),
    getSetting(KEYS.USER),
    getSetting(KEYS.PASS),
    getSetting(KEYS.FROM_EMAIL),
  ]);

  const host = dbHost ?? process.env.SMTP_HOST ?? "";
  const port = Number(dbPort ?? process.env.SMTP_PORT ?? "587") || 587;
  const user = dbUser ?? process.env.SMTP_USER ?? "";
  const pass = dbPass ?? process.env.SMTP_PASS ?? "";
  const fromEmail =
    dbFrom ??
    process.env.SMTP_FROM_EMAIL ??
    `${siteConfig.name} <${siteConfig.contactEmail}>`;

  if (!host || !user || !pass) {
    console.log("[SMTP] Config missing –", { hasHost: !!host, hasUser: !!user, hasPass: !!pass, dbHost: !!dbHost, envHost: !!process.env.SMTP_HOST });
    return null;
  }
  return { host, port, user, pass, fromEmail };
}

export async function isSmtpConfigured(): Promise<boolean> {
  const config = await getSmtpConfig();
  return !!config;
}
