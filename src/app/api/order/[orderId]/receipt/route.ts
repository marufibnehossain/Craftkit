import { NextResponse } from "next/server";
import path from "path";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site-config";
import PDFDocument from "pdfkit";

const MARGIN = 48;
const PAGE_WIDTH = 595;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const BRAND = "#862830";
const DARK = "#1B1718";
const MUTED = "#7a7270";
const BORDER = "#d4c8be";
const BG = "#FAF6F1";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function drawDashedCircle(doc: PDFKit.PDFDocument, cx: number, cy: number, r: number) {
  const dashLen = 6;
  const gapLen = 4;
  const circumference = 2 * Math.PI * r;
  const totalSegLen = dashLen + gapLen;
  const segments = Math.floor(circumference / totalSegLen);
  const anglePerSeg = (2 * Math.PI) / segments;
  const dashAngle = anglePerSeg * (dashLen / totalSegLen);

  doc.strokeColor("#2E7D32").lineWidth(1.5);
  for (let i = 0; i < segments; i++) {
    const startAngle = i * anglePerSeg - Math.PI / 2;
    const endAngle = startAngle + dashAngle;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    doc.moveTo(x1, y1);
    doc.lineTo(x2, y2);
  }
  doc.stroke();
}

function drawCheckmark(doc: PDFKit.PDFDocument, cx: number, cy: number, size: number) {
  const s = size / 2;
  doc.strokeColor("#2E7D32").lineWidth(2).lineJoin("round").lineCap("round");
  doc.moveTo(cx - s * 0.45, cy + s * 0.05)
    .lineTo(cx - s * 0.05, cy + s * 0.4)
    .lineTo(cx + s * 0.55, cy - s * 0.35)
    .stroke();
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  if (!orderId) {
    return NextResponse.json({ error: "Order ID required" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const createdAt = new Date(order.createdAt);
  const orderShortId = order.id.slice(-8).toUpperCase();
  const fs = await import("fs");
  let logoPath: string | null = null;
  if (siteConfig.logoDark.startsWith("/")) {
    const configuredPath = path.join(process.cwd(), "public", siteConfig.logoDark.replace(/^\//, ""));
    const ext = path.extname(configuredPath).toLowerCase();
    if ([".png", ".jpg", ".jpeg"].includes(ext) && fs.existsSync(configuredPath)) {
      logoPath = configuredPath;
    } else {
      const baseName = configuredPath.replace(/\.[^.]+$/, "");
      for (const tryExt of [".png", ".jpg", ".jpeg"]) {
        const tryPath = baseName + tryExt;
        if (fs.existsSync(tryPath)) {
          logoPath = tryPath;
          break;
        }
      }
    }
  }

  const buffer = await new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({ margin: MARGIN, size: "A4" });

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    let y = MARGIN;

    doc.rect(0, 0, PAGE_WIDTH, 842).fill(BG);

    try {
      if (logoPath) {
        doc.image(logoPath, MARGIN, y, { width: 80 });
        y += 35;
      } else {
        throw new Error("fallback");
      }
    } catch {
      doc.fontSize(22).font("Helvetica-Bold").fillColor(DARK).text(siteConfig.name, MARGIN, y);
      y += 30;
    }

    doc.moveTo(MARGIN, y).lineTo(PAGE_WIDTH - MARGIN, y).lineWidth(0.5).strokeColor(BORDER).stroke();
    y += 24;

    const circleCx = PAGE_WIDTH / 2;
    const circleCy = y + 20;
    drawDashedCircle(doc, circleCx, circleCy, 18);
    drawCheckmark(doc, circleCx, circleCy, 22);
    y += 50;

    doc.fontSize(18).font("Helvetica-Bold").fillColor(DARK)
      .text("Order Receipt", MARGIN, y, { width: CONTENT_WIDTH, align: "center" });
    y += 28;

    doc.fontSize(9).font("Helvetica").fillColor(MUTED)
      .text(`Order #${orderShortId}  ·  ${formatDate(createdAt)}`, MARGIN, y, { width: CONTENT_WIDTH, align: "center" });
    y += 10;

    if (order.email) {
      doc.fontSize(9).font("Helvetica").fillColor(MUTED)
        .text(`Confirmation sent to ${order.email}`, MARGIN, y, { width: CONTENT_WIDTH, align: "center" });
      y += 10;
    }
    y += 16;

    const infoBoxY = y;
    const halfWidth = CONTENT_WIDTH / 2 - 8;

    doc.rect(MARGIN, infoBoxY, halfWidth, 70).lineWidth(0.5).strokeColor(BORDER).stroke();
    doc.rect(MARGIN + halfWidth + 16, infoBoxY, halfWidth, 70).lineWidth(0.5).strokeColor(BORDER).stroke();

    doc.fontSize(8).font("Helvetica").fillColor(MUTED);
    doc.text("ORDER NO", MARGIN + 12, infoBoxY + 10);
    doc.fontSize(11).font("Helvetica-Bold").fillColor(DARK);
    doc.text(`#${orderShortId}`, MARGIN + 12, infoBoxY + 24);

    doc.fontSize(8).font("Helvetica").fillColor(MUTED);
    doc.text("TOTAL", MARGIN + 12, infoBoxY + 42);
    doc.fontSize(11).font("Helvetica-Bold").fillColor(DARK);
    doc.text(formatPrice(order.totalCents), MARGIN + 12, infoBoxY + 56);

    const rightX = MARGIN + halfWidth + 28;
    doc.fontSize(8).font("Helvetica").fillColor(MUTED);
    doc.text("DATE", rightX, infoBoxY + 10);
    doc.fontSize(11).font("Helvetica-Bold").fillColor(DARK);
    doc.text(formatDate(createdAt), rightX, infoBoxY + 24);

    doc.fontSize(8).font("Helvetica").fillColor(MUTED);
    doc.text("PAYMENT METHOD", rightX, infoBoxY + 42);
    doc.fontSize(11).font("Helvetica-Bold").fillColor(DARK);
    doc.text("Credit/Debit Card", rightX, infoBoxY + 56);

    y = infoBoxY + 86;

    doc.fontSize(14).font("Helvetica-Bold").fillColor(DARK)
      .text("Order Summary", MARGIN, y);
    y += 24;

    doc.moveTo(MARGIN, y).lineTo(PAGE_WIDTH - MARGIN, y).lineWidth(0.5).strokeColor(BORDER).stroke();
    y += 12;

    doc.font("Helvetica").fontSize(10).fillColor(DARK);
    for (const item of order.items) {
      const rowY = y;
      const label = `${item.name} × ${item.quantity}`;
      const displayLabel = label.length > 55 ? label.slice(0, 52) + "..." : label;
      doc.fillColor(DARK).text(displayLabel, MARGIN, rowY, { width: CONTENT_WIDTH - 80 });
      doc.text(formatPrice(item.priceCents * item.quantity), 0, rowY, {
        width: PAGE_WIDTH - MARGIN,
        align: "right",
      });
      y = rowY + 20;
    }

    y += 6;
    doc.moveTo(MARGIN, y).lineTo(PAGE_WIDTH - MARGIN, y).lineWidth(0.5).strokeColor(BORDER).stroke();
    y += 14;

    doc.font("Helvetica").fontSize(10);

    doc.fillColor(MUTED).text("Subtotal", MARGIN, y, { width: CONTENT_WIDTH - 80 });
    doc.fillColor(DARK).text(formatPrice(order.subtotalCents), 0, y, { width: PAGE_WIDTH - MARGIN, align: "right" });
    y += 20;

    if (order.discountCents > 0) {
      doc.fillColor(MUTED).text("Discount", MARGIN, y, { width: CONTENT_WIDTH - 80 });
      doc.fillColor(BRAND).text(`-${formatPrice(order.discountCents)}`, 0, y, { width: PAGE_WIDTH - MARGIN, align: "right" });
      y += 20;
    }

    doc.fillColor(MUTED).text("Shipping", MARGIN, y, { width: CONTENT_WIDTH - 80 });
    doc.fillColor(DARK).text(
      order.shippingCents === 0 ? "Free Shipping" : formatPrice(order.shippingCents),
      0, y, { width: PAGE_WIDTH - MARGIN, align: "right" }
    );
    y += 20;

    doc.fillColor(MUTED).text("Payment Method", MARGIN, y, { width: CONTENT_WIDTH - 80 });
    doc.fillColor(DARK).text("Credit/Debit Card", 0, y, { width: PAGE_WIDTH - MARGIN, align: "right" });
    y += 22;

    doc.moveTo(MARGIN, y).lineTo(PAGE_WIDTH - MARGIN, y).lineWidth(1).strokeColor(DARK).stroke();
    y += 14;
    doc.font("Helvetica-Bold").fontSize(12).fillColor(DARK);
    doc.text("Total", MARGIN, y);
    doc.text(formatPrice(order.totalCents), 0, y, { width: PAGE_WIDTH - MARGIN, align: "right" });
    y += 30;

    const addressBoxY = y;
    const cardWidth = CONTENT_WIDTH / 2 - 8;
    const cardHeight = 100;

    doc.rect(MARGIN, addressBoxY, cardWidth, cardHeight).lineWidth(0.5).strokeColor(BORDER).stroke();
    doc.rect(MARGIN + cardWidth + 16, addressBoxY, cardWidth, cardHeight).lineWidth(0.5).strokeColor(BORDER).stroke();

    doc.fontSize(10).font("Helvetica-Bold").fillColor(DARK);
    doc.text("Shipping Address", MARGIN + 12, addressBoxY + 12);

    doc.fontSize(9).font("Helvetica").fillColor(MUTED);
    let addrY = addressBoxY + 28;
    if (order.name) {
      doc.fillColor(DARK).font("Helvetica-Bold").text(order.name, MARGIN + 12, addrY, { width: cardWidth - 24 });
      addrY += 14;
      doc.font("Helvetica").fillColor(MUTED);
    }
    if (order.address) {
      doc.text(order.address, MARGIN + 12, addrY, { width: cardWidth - 24 });
      addrY += 14;
    }
    const cityZip = [order.city, order.zip].filter(Boolean).join(", ");
    if (cityZip) {
      doc.text(cityZip, MARGIN + 12, addrY, { width: cardWidth - 24 });
      addrY += 14;
    }
    if (order.country) {
      doc.text(order.country, MARGIN + 12, addrY, { width: cardWidth - 24 });
    }

    const custX = MARGIN + cardWidth + 28;
    doc.fontSize(10).font("Helvetica-Bold").fillColor(DARK);
    doc.text(order.name || "Customer", custX, addressBoxY + 12, { width: cardWidth - 24 });

    doc.fontSize(9).font("Helvetica").fillColor(MUTED);
    doc.text(order.email, custX, addressBoxY + 28, { width: cardWidth - 24 });

    doc.fillColor(DARK).font("Helvetica-Bold");
    doc.text("Billing Address:", custX, addressBoxY + 48, { width: cardWidth - 24 });
    doc.font("Helvetica").fillColor(MUTED);
    doc.text("Same as shipping address", custX, addressBoxY + 62, { width: cardWidth - 24 });

    y = addressBoxY + cardHeight + 30;

    doc.fontSize(8).font("Helvetica").fillColor(MUTED);
    doc.text("Thank you for your order!", MARGIN, y, { width: CONTENT_WIDTH, align: "center" });
    y += 14;
    const footerContact = [siteConfig.name, siteConfig.contactEmail, siteConfig.contactPhone].filter(Boolean).join("  ·  ");
    doc.text(footerContact, MARGIN, y, { width: CONTENT_WIDTH, align: "center" });

    doc.end();
  });

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="receipt-${orderShortId}.pdf"`,
    },
  });
}
