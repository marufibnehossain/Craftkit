"use client";

import { useEffect, useState } from "react";
import Button from "@/components/Button";

type OrderSummary = { id: string; date: string; total: number; status: string };

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/account/orders");
        if (res.ok) {
          const data = await res.json();
          setOrders(Array.isArray(data) ? data : []);
        }
      } catch (_) {}
      setLoading(false);
    }
    load();
  }, []);

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

  return (
    <div>
      <h2 className="font-sans text-xl font-semibold text-[#1b1718] leading-[1.6] mb-2">Order history</h2>
      <p className="font-sans text-base text-[#5f5d5d] leading-[1.6] tracking-[0.32px] mb-8">
        View and track your orders.
      </p>
      {loading ? (
        <p className="font-sans text-[#5f5d5d]">Loading…</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex flex-wrap items-center justify-between gap-4 border border-[#e0d6c9] bg-[#f5eae2] p-6"
            >
              <div>
                <p className="font-sans font-medium text-[#1b1718]">{order.id.slice(0, 12)}…</p>
                <p className="font-sans text-sm text-[#5f5d5d]">{order.date}</p>
              </div>
              <div className="text-right">
                <p className="font-sans font-medium text-[#1b1718]">${order.total.toFixed(2)}</p>
                <p className="font-sans text-sm text-[#5f5d5d]">{statusLabel[order.status] ?? order.status}</p>
              </div>
              <Button href={`/account/orders/${order.id}`} variant="text-arrow">
                View details
              </Button>
            </div>
          ))}
        </div>
      )}
      {!loading && orders.length === 0 && (
        <p className="font-sans text-[#5f5d5d]">You haven&apos;t placed any orders yet.</p>
      )}
    </div>
  );
}
