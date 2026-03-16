import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const UPLOAD_DIR = "storage/downloads";
const ALLOWED_TYPES = [
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "application/vnd.rar",
  "application/epub+zip",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "video/mp4",
  "video/webm",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "application/octet-stream",
  "text/plain",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_SIZE = 50 * 1024 * 1024;

export async function POST(req: Request) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(pdf|zip|rar|epub|mp3|mp4|wav|webm|csv|xlsx|docx|txt|png|jpg|jpeg|webp|svg)$/i)) {
      return NextResponse.json({ error: "File type not allowed." }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large. Max 50MB." }, { status: 400 });
    }
    const ext = path.extname(file.name) || "";
    const base = path.basename(file.name, ext).replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 50);
    const filename = `${base}-${Date.now()}${ext}`;
    const dir = path.join(process.cwd(), UPLOAD_DIR);
    await mkdir(dir, { recursive: true });
    const filepath = path.join(dir, filename);
    const bytes = await file.arrayBuffer();
    await writeFile(filepath, Buffer.from(bytes));
    const url = `storage://${filename}`;
    return NextResponse.json({
      url,
      name: file.name,
      size: file.size,
    });
  } catch (e) {
    console.error("[Admin] File upload error:", e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
