import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml", "image/x-icon", "image/vnd.microsoft.icon"];
const MAX_SIZE = 5 * 1024 * 1024;

const KEY_MAP: Record<string, string> = {
  logo: "branding_logo_url",
  favicon: "branding_favicon_url",
};

const FILE_MAP: Record<string, string> = {
  logo: "craftkit-logo",
  favicon: "craftkit-favicon",
};

export async function POST(req: Request) {
  const { authorized } = await requireAdmin();
  if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const type = formData.get("type") as string | null;

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!type || !KEY_MAP[type]) {
    return NextResponse.json({ error: "type must be logo or favicon" }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Only PNG, JPG, WebP, SVG, or ICO files allowed" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Max file size is 5 MB" }, { status: 400 });
  }

  const ext = path.extname(file.name) || ".png";
  const filename = `${FILE_MAP[type]}${ext}`;
  const dir = path.join(process.cwd(), "public", "images");
  await mkdir(dir, { recursive: true });
  const filePath = path.join(dir, filename);

  const bytes = await file.arrayBuffer();
  await writeFile(filePath, Buffer.from(bytes));

  const url = `/images/${filename}`;
  await prisma.setting.upsert({
    where: { key: KEY_MAP[type] },
    create: { key: KEY_MAP[type], value: url },
    update: { value: url },
  });

  return NextResponse.json({ url });
}
