"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Button from "@/components/Button";

type DownloadFile = { name: string; url: string; size: number };
type OrderItem = {
  name: string;
  productId?: string;
  quantity: number;
  price: number;
  variationLabel?: string | null;
  isDownloadable?: boolean;
  downloadFiles?: DownloadFile[];
};
type Order = {
  id: string;
  date: string;
  status: string;
  total: number;
  subtotal: number;
  discount: number;
  shipping: number;
  address: string;
  trackingNumber?: string;
  trackingCarrier?: string;
  items: OrderItem[];
};

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/account/orders/${id}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        } else {
          setError(true);
        }
      } catch (_) {
        setError(true);
      }
      setLoading(false);
    }
    if (id) load();
  }, [id]);

  const statusLabel: Record<string, string> = {
    PENDING: "Pending payment",
    PROCESSING: "Processing",
    ON_HOLD: "On hold",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
    REFUNDED: "Refunded",
    FAILED: "Failed",
    DRAFT: "Draft",
    PAID: "Paid",
    SHIPPED: "Shipped",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="font-sans text-[#5f5d5d]">Loading…</p>
      </div>
    );
  }
  if (error || !order) {
    return (
      <div>
        <p className="font-sans text-[#5f5d5d]">Order not found.</p>
        <Button href="/account/orders" variant="secondary" className="mt-6">
          Back to orders
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Link href="/account/orders" className="font-sans text-sm text-[#5f5d5d] hover:text-[#1b1718] mb-6 inline-block">
        ← Order history
      </Link>
      <h2 className="font-sans text-xl font-semibold text-[#1b1718] leading-[1.6] mb-1">
        Order {order.id.slice(0, 12)}…
      </h2>
      <p className="font-sans text-base text-[#5f5d5d] leading-[1.6] tracking-[0.32px] mb-8">
        Placed on {order.date}. {statusLabel[order.status] ?? order.status}.
      </p>
      <div className="font-sans text-sm text-[#5f5d5d]">
        <p className="font-medium text-[#1b1718] mb-1">Shipping address</p>
        <p>{order.address}</p>
      </div>
      {order.trackingNumber && (
        <div className="mt-6 font-sans text-sm text-[#5f5d5d]">
          <p className="font-medium text-[#1b1718] mb-1">Tracking</p>
          <p>
            {order.trackingCarrier && `${order.trackingCarrier}: `}
            <span className="text-[#1b1718]">{order.trackingNumber}</span>
          </p>
        </div>
      )}
      <div className="mt-10 border border-[#e0d6c9] bg-[#f5eae2] divide-y divide-[#e0d6c9]">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex justify-between items-start p-4">
            <div>
              <p className="font-sans font-medium text-[#1b1718]">{item.name}</p>
              {item.variationLabel && (
                <p className="font-sans text-xs text-[#5f5d5d] mt-0.5">{item.variationLabel}</p>
              )}
              <p className="font-sans text-sm text-[#5f5d5d]">Qty {item.quantity}</p>
              {item.isDownloadable && item.downloadFiles && item.downloadFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {item.downloadFiles.map((f, fi) => (
                    <a
                      key={fi}
                      href={`/api/download/${order.id}/${item.productId}?file=${fi}`}
                      className="inline-flex items-center gap-1 text-xs text-secondary-100 hover:text-secondary-60 font-medium border border-secondary-100/30 px-2 py-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      {f.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
            <p className="font-sans text-[#1b1718]">${(item.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 font-sans text-sm space-y-2">
        <div className="flex justify-between text-[#5f5d5d]">
          <span>Subtotal</span>
          <span>${order.subtotal.toFixed(2)}</span>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between text-[#5f5d5d]">
            <span>Discount</span>
            <span>-${order.discount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-[#5f5d5d]">
          <span>Shipping</span>
          <span>{order.shipping === 0 ? "Free" : `$${order.shipping.toFixed(2)}`}</span>
        </div>
        <div className="flex justify-between font-medium text-[#1b1718] pt-2 border-t border-[#e0d6c9]">
          <span>Total</span>
          <span>${order.total.toFixed(2)}</span>
        </div>
      </div>
      <Button href="/account/orders" variant="secondary" className="mt-8">
        Back to orders
      </Button>
    </div>
  );
}
