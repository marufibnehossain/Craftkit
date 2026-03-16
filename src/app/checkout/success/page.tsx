import Link from "next/link";
import { prisma } from "@/lib/prisma";
import FormatPrice from "@/components/FormatPrice";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

interface PageProps {
  searchParams?: Promise<{ orderId?: string }>;
}

export default async function CheckoutSuccessPage(props: PageProps) {
  const searchParams = (await props.searchParams) ?? {};
  const orderId = searchParams.orderId;

  if (!orderId) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-lg text-center space-y-4">
          <p className="font-sans text-lg text-dark-100">Order not found.</p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 bg-dark-100 text-white px-10 h-14 font-sans text-lg tracking-wider hover:bg-dark-80 transition-colors"
          >
            Shop products <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    );
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-lg text-center space-y-4">
          <p className="font-sans text-lg text-dark-100">We couldn&apos;t find that order.</p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 bg-dark-100 text-white px-10 h-14 font-sans text-lg tracking-wider hover:bg-dark-80 transition-colors"
          >
            Shop products <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    );
  }

  const productIds = Array.from(new Set(order.items.map((i) => i.productId)));
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, images: true, productCode: true, isDownloadable: true, downloadFiles: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  const createdAt = new Date(order.createdAt);
  const subtotal = order.subtotalCents;
  const discount = order.discountCents;
  const shipping = order.shippingCents;
  const total = order.totalCents;
  const userName = order.name?.trim() || "";
  const orderNumber = `#${order.id.slice(-8).toUpperCase()}`;
  const paymentMethod = "Credit/Debit Card";

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-[1440px] mx-auto px-6 md:px-20 py-12 md:py-20">
        <div className="max-w-[802px] mx-auto bg-surface border border-brand-dark">
          <div className="px-8 md:px-12 py-10 md:py-12">

            <div className="flex flex-col items-center text-center mb-10">
              <div className="w-24 h-24 flex items-center justify-center mb-8">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden>
                  <circle cx="32" cy="32" r="30" stroke="#2E7D32" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6 4" />
                  <polyline points="22,34 29,41 43,25" stroke="#2E7D32" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </div>
              <h1 className="font-sans text-2xl md:text-[28px] font-medium text-dark-100 leading-tight">
                Thank You for Your Order!
              </h1>
              <div className="mt-5 bg-brand-light px-4 py-2 inline-block">
                <p className="font-sans text-sm text-dark-80 tracking-wider">
                  We&apos;ve sent a confirmation email to{" "}
                  <span className="text-dark-100 font-medium">{order.email}</span>
                </p>
              </div>
            </div>

            <div className="border border-brand-dark p-6 mb-0 flex flex-col sm:flex-row justify-between gap-6">
              <div className="flex flex-col gap-5">
                <div>
                  <p className="font-sans text-xs text-dark-60 tracking-wider uppercase mb-1">Order No</p>
                  <p className="font-sans text-base font-medium text-dark-100">{orderNumber}</p>
                </div>
                <div>
                  <p className="font-sans text-xs text-dark-60 tracking-wider uppercase mb-1">Total</p>
                  <p className="font-sans text-base font-medium text-dark-100">
                    <FormatPrice price={total / 100} compact />
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-5">
                <div>
                  <p className="font-sans text-xs text-dark-60 tracking-wider uppercase mb-1">Date</p>
                  <p className="font-sans text-base font-medium text-dark-100">{formatDate(createdAt)}</p>
                </div>
                <div>
                  <p className="font-sans text-xs text-dark-60 tracking-wider uppercase mb-1">Payment Method</p>
                  <p className="font-sans text-base font-medium text-dark-100">{paymentMethod}</p>
                </div>
              </div>
            </div>

            <div className="bg-surface border border-brand-dark border-t-0 p-8">
              <h2 className="font-sans text-xl font-medium text-dark-100 mb-6">Order Summary</h2>

              <div className="space-y-5">
                {order.items.map((item) => {
                  const product = productMap.get(item.productId);
                  return (
                    <div key={item.id}>
                      <div className="flex justify-between items-start gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="font-sans text-sm text-dark-100 tracking-wider">
                            {item.name} × {item.quantity}
                          </p>
                          {product?.isDownloadable && product.downloadFiles && (() => {
                            let files: { name: string; url: string; size: number }[] = [];
                            try { files = JSON.parse(product.downloadFiles!) } catch {}
                            return files.length > 0 ? (
                              <div className="flex flex-wrap gap-2 mt-1.5">
                                {files.map((f, fi) => (
                                  <a
                                    key={fi}
                                    href={`/api/download/${orderId}/${item.productId}?file=${fi}&email=${encodeURIComponent(order.email)}`}
                                    className="inline-flex items-center gap-1 text-xs text-secondary-100 hover:text-secondary-60 font-medium tracking-wider"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    {f.name}
                                  </a>
                                ))}
                              </div>
                            ) : null;
                          })()}
                        </div>
                        <p className="font-sans text-sm text-dark-100 tracking-wider shrink-0">
                          <FormatPrice price={(item.priceCents * item.quantity) / 100} compact />
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between">
                  <span className="font-sans text-sm text-dark-80 tracking-wider">Subtotal</span>
                  <span className="font-sans text-sm text-dark-100 tracking-wider">
                    <FormatPrice price={subtotal / 100} compact />
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span className="font-sans text-sm text-dark-80 tracking-wider">Discount</span>
                    <span className="font-sans text-sm text-secondary-100 tracking-wider">
                      -<FormatPrice price={discount / 100} compact />
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-sans text-sm text-dark-80 tracking-wider">Shipping</span>
                  <span className="font-sans text-sm text-dark-100 tracking-wider">
                    {shipping === 0 ? "Free Shipping" : <FormatPrice price={shipping / 100} compact />}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans text-sm text-dark-80 tracking-wider">Payment Method</span>
                  <span className="font-sans text-sm text-dark-100 tracking-wider">{paymentMethod}</span>
                </div>
                <div className="border-t border-brand-dark pt-4 flex justify-between">
                  <span className="font-sans text-lg font-medium text-dark-100">Total</span>
                  <span className="font-sans text-lg font-medium text-dark-100">
                    <FormatPrice price={total / 100} compact />
                  </span>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/products"
                  className="flex-1 h-14 inline-flex items-center justify-center gap-2 border border-dark-100 text-dark-100 font-sans text-base tracking-wider hover:bg-brand-light transition-colors"
                >
                  Continue Shopping <span aria-hidden>→</span>
                </Link>
                <a
                  href={`/api/order/${orderId}/receipt`}
                  download={`receipt-${orderId.slice(-8)}.pdf`}
                  className="flex-1 h-14 inline-flex items-center justify-center gap-2 bg-dark-100 text-white font-sans text-base tracking-wider hover:bg-dark-80 transition-colors"
                  aria-label="Download receipt"
                >
                  Download Receipt
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              <div className="border border-brand-dark p-8">
                <div className="flex items-center gap-2 mb-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-dark-80" aria-hidden>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <h3 className="font-sans text-base font-medium text-dark-100">Shipping Address</h3>
                </div>
                <div className="space-y-1.5 font-sans text-sm text-dark-80 tracking-wider leading-relaxed">
                  {userName && <p className="text-dark-100 font-medium">{userName}</p>}
                  {order.address && <p>{order.address}</p>}
                  <p>{[order.city, order.zip].filter(Boolean).join(", ")}</p>
                  {order.country && <p>{order.country}</p>}
                </div>
              </div>

              <div className="border border-brand-dark p-8">
                <div className="flex items-center gap-3 mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-dark-80" aria-hidden>
                    <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" />
                    <path d="M19 19C19 16.2386 16.7614 14 14 14H10C7.23858 14 5 16.2386 5 19V21H19V19Z" />
                  </svg>
                  <div>
                    <p className="font-sans text-sm font-medium text-dark-100 tracking-wider uppercase">{userName || "Customer"}</p>
                    <p className="font-sans text-xs text-dark-60 tracking-wider">Total: {order.items.length} item{order.items.length !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                <div className="space-y-2 font-sans text-sm text-dark-80 tracking-wider leading-relaxed">
                  <p>{order.email}</p>
                  <div>
                    <p className="text-dark-100 font-medium mb-1">Billing Address:</p>
                    <p>Same as shipping address</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
