import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { readFile } from "fs/promises";
import path from "path";

interface RouteParams {
  params: Promise<{ orderId: string; productId: string }>;
}

function resolveFilePath(fileUrl: string): string {
  if (fileUrl.startsWith("storage://")) {
    const filename = fileUrl.replace("storage://", "");
    return path.join(process.cwd(), "storage", "downloads", filename);
  }
  if (fileUrl.startsWith("/downloads/")) {
    return path.join(process.cwd(), "storage", "downloads", path.basename(fileUrl));
  }
  return path.join(process.cwd(), "storage", "downloads", path.basename(fileUrl));
}

export async function GET(_req: Request, { params }: RouteParams) {
  const { orderId, productId } = await params;

  const session = await getServerSession(authOptions);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const url = new URL(_req.url);
  const emailParam = url.searchParams.get("email")?.toLowerCase();

  const isAdmin = (session?.user as any)?.role === "ADMIN";
  const isLoggedInOwner = session?.user?.email && session.user.email.toLowerCase() === order.email.toLowerCase();
  const isGuestOwner = emailParam && emailParam === order.email.toLowerCase();

  const hasAccess = isAdmin || isLoggedInOwner || isGuestOwner;

  if (!hasAccess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const orderItem = order.items.find((item) => item.productId === productId);
  if (!orderItem) {
    return NextResponse.json({ error: "Product not in this order" }, { status: 404 });
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { isDownloadable: true, downloadFiles: true, name: true },
  });

  if (!product || !product.isDownloadable || !product.downloadFiles) {
    return NextResponse.json({ error: "No downloadable files available" }, { status: 404 });
  }

  let files: { name: string; url: string; size: number }[];
  try {
    files = JSON.parse(product.downloadFiles);
  } catch {
    return NextResponse.json({ error: "Invalid file data" }, { status: 500 });
  }

  if (!files.length) {
    return NextResponse.json({ error: "No files available" }, { status: 404 });
  }

  const fileIndex = parseInt(url.searchParams.get("file") || "0", 10);
  const fileEntry = files[fileIndex] || files[0];

  const filePath = resolveFilePath(fileEntry.url);

  try {
    const buffer = await readFile(filePath);
    const ext = path.extname(fileEntry.name).toLowerCase();
    const mimeMap: Record<string, string> = {
      ".pdf": "application/pdf",
      ".zip": "application/zip",
      ".rar": "application/x-rar-compressed",
      ".epub": "application/epub+zip",
      ".mp3": "audio/mpeg",
      ".mp4": "video/mp4",
      ".wav": "audio/wav",
      ".webm": "video/webm",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp",
      ".txt": "text/plain",
      ".csv": "text/csv",
    };
    const contentType = mimeMap[ext] || "application/octet-stream";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileEntry.name}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found on server" }, { status: 404 });
  }
}
