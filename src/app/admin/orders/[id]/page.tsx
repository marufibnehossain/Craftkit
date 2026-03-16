"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/Button";

type OrderItem = {
  id: string;
  productId: string;
  name: string;
  priceCents: number;
  quantity: number;
  variationId?: string | null;
  variationLabel?: string | null;
  product?: { slug: string } | null;
};
type Order = {
  id: string;
  email: string;
  name: string | null;
  address: string;
  city: string;
  zip: string;
  country: string;
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  totalCents: number;
  couponCode: string | null;
  status: string;
  transactionId: string | null;
  paymentMethod: string | null;
  trackingNumber: string | null;
  trackingCarrier: string | null;
  createdAt: string;
  items: OrderItem[];
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [refunding, setRefunding] = useState(false);
  const [refundResult, setRefundResult] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingCarrier, setTrackingCarrier] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/orders/${id}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
          setStatus(data.status);
          setTrackingNumber(data.trackingNumber ?? "");
          setTrackingCarrier(data.trackingCarrier ?? "");
        } else if (res.status === 404) {
          setOrder(null);
        }
      } catch (_) {}
      setLoading(false);
    }
    if (id) load();
  }, [id]);

  async function handleUpdate() {
    if (!order) return;
    const changed =
      status !== order.status ||
      (trackingNumber || "") !== (order.trackingNumber ?? "") ||
      (trackingCarrier || "") !== (order.trackingCarrier ?? "");
    if (!changed) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          trackingNumber: trackingNumber || null,
          trackingCarrier: trackingCarrier || null,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrder(updated);
      }
    } catch (_) {}
    setSaving(false);
  }

  async function handleDelete() {
    if (!order || deleting) return;
    if (!confirm("Permanently delete this order? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/admin/orders");
      }
    } catch (_) {}
    setDeleting(false);
  }

  async function handleRefund() {
    if (!order || !order.transactionId || refunding) return;
    if (!confirm("Are you sure you want to refund this order via the payment gateway?")) return;
    setRefunding(true);
    setRefundResult(null);
    try {
      const res = await fetch(`/api/admin/orders/${id}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setRefundResult(`Refunded successfully. Gateway TX: ${data.refundTransactionId}`);
        setOrder({ ...order, status: "REFUNDED" });
        setStatus("REFUNDED");
      } else {
        setRefundResult(`Refund failed: ${data.error || "Unknown error"}`);
      }
    } catch {
      setRefundResult("Refund request failed. Please try again.");
    }
    setRefunding(false);
  }

  if (loading) {
    return <p className="font-sans text-muted">Loading…</p>;
  }
  if (!order) {
    return (
      <div>
        <p className="font-sans text-muted">Order not found.</p>
        <Link href="/admin/orders" className="mt-4 inline-block font-sans text-sm text-sage-dark hover:underline">
          ← Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Link href="/admin/orders" className="font-sans text-sm text-sage-dark hover:underline">
          ← Back to orders
        </Link>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="font-sans text-sm text-red-600 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded transition-colors disabled:opacity-50"
        >
          {deleting ? "Deleting…" : "Delete order"}
        </button>
      </div>
      <h1 className="font-sans text-2xl font-semibold text-text mb-2">
        Order details
      </h1>
      <p className="font-sans text-sm text-muted mb-6">
        Order ID: <code className="bg-bg px-1.5 py-0.5 rounded">{order.id}</code>
      </p>
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="border border-border rounded-lg bg-surface p-6">
          <h2 className="font-sans text-sm font-medium text-muted uppercase tracking-wide mb-3">
            Customer & shipping
          </h2>
          <div className="space-y-2 font-sans text-sm">
            <div>
              <span className="text-muted">Name:</span>{" "}
              <span className="text-text">{order.name ?? "—"}</span>
            </div>
            <div>
              <span className="text-muted">Email:</span>{" "}
              <a href={`mailto:${order.email}`} className="text-sage-dark hover:underline">
                {order.email}
              </a>
            </div>
            <div>
              <span className="text-muted">Address:</span>{" "}
              <span className="text-text">
                {order.address}, {order.city} {order.zip}, {order.country}
              </span>
            </div>
          </div>
        </div>
        <div className="border border-border rounded-lg bg-surface p-6">
          <h2 className="font-sans text-sm font-medium text-muted uppercase tracking-wide mb-3">
            Status & tracking
          </h2>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-lg border border-border bg-bg px-3 py-2 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-sage-2"
              >
                <option value="PENDING">Pending payment</option>
                <option value="PROCESSING">Processing</option>
                <option value="ON_HOLD">On hold</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="REFUNDED">Refunded</option>
                <option value="FAILED">Failed</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>
            <div>
              <label className="block font-sans text-xs text-muted mb-1">Carrier</label>
              <input
                type="text"
                value={trackingCarrier}
                onChange={(e) => setTrackingCarrier(e.target.value)}
                placeholder="e.g. USPS, FedEx"
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 font-sans text-sm"
              />
            </div>
            <div>
              <label className="block font-sans text-xs text-muted mb-1">Tracking number</label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Tracking number"
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 font-sans text-sm"
              />
            </div>
            <Button
              onClick={handleUpdate}
              variant="primary"
              disabled={
                saving ||
                (status === order.status &&
                  (trackingNumber || "") === (order.trackingNumber ?? "") &&
                  (trackingCarrier || "") === (order.trackingCarrier ?? ""))
              }
            >
              {saving ? "Saving…" : "Update"}
            </Button>
          </div>
        </div>
      </div>
      {(order.transactionId || order.paymentMethod) && (
        <div className="border border-border rounded-lg bg-surface p-6 mb-8">
          <h2 className="font-sans text-sm font-medium text-muted uppercase tracking-wide mb-3">
            Payment
          </h2>
          <div className="space-y-2 font-sans text-sm">
            {order.paymentMethod && (
              <div>
                <span className="text-muted">Method:</span>{" "}
                <span className="text-text">{order.paymentMethod === "cod" ? "Cash on Delivery" : "Credit Card"}</span>
              </div>
            )}
            {order.transactionId && (
              <div>
                <span className="text-muted">Transaction ID:</span>{" "}
                <code className="text-text bg-bg px-1.5 py-0.5 rounded">{order.transactionId}</code>
              </div>
            )}
          </div>
          {order.transactionId && order.status !== "REFUNDED" && order.status !== "CANCELLED" && order.status !== "FAILED" && (
            <div className="mt-4 pt-4 border-t border-border">
              <Button
                onClick={handleRefund}
                variant="secondary"
                disabled={refunding}
              >
                {refunding ? "Processing Refund…" : "Refund via Gateway"}
              </Button>
              {refundResult && (
                <p className={`mt-2 font-sans text-sm ${refundResult.startsWith("Refunded") ? "text-green-600" : "text-red-600"}`}>
                  {refundResult}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="border border-border rounded-lg bg-surface overflow-hidden">
        <h2 className="font-sans text-sm font-medium text-muted uppercase tracking-wide p-4 border-b border-border">
          Items
        </h2>
        <table className="w-full font-sans text-sm">
          <thead>
            <tr className="border-b border-border bg-sage-1/50">
              <th className="text-left p-3 font-medium text-text">Product</th>
              <th className="text-right p-3 font-medium text-text">Price</th>
              <th className="text-right p-3 font-medium text-text">Qty</th>
              <th className="text-right p-3 font-medium text-text">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-0">
                <td className="p-3 text-text">
                  <div>
                    {item.product?.slug ? (
                      <Link
                        href={`/product/${item.product.slug}`}
                        className="text-sage-dark hover:underline"
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <span>{item.name}</span>
                    )}
                    {item.variationLabel && (
                      <span className="block text-xs text-muted mt-0.5">
                        {item.variationLabel}
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-3 text-right text-muted">${(item.priceCents / 100).toFixed(2)}</td>
                <td className="p-3 text-right text-muted">{item.quantity}</td>
                <td className="p-3 text-right text-text">
                  ${((item.priceCents * item.quantity) / 100).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4 border-t border-border space-y-1 font-sans text-sm">
          <p className="flex justify-between text-muted">
            <span>Subtotal</span>
            <span>${(order.subtotalCents / 100).toFixed(2)}</span>
          </p>
          {order.discountCents > 0 && (
            <p className="flex justify-between text-sage-dark">
              <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
              <span>-${(order.discountCents / 100).toFixed(2)}</span>
            </p>
          )}
          <p className="flex justify-between text-muted">
            <span>Shipping</span>
            <span>${(order.shippingCents / 100).toFixed(2)}</span>
          </p>
          <p className="flex justify-between font-medium text-text pt-2">
            <span>Total</span>
            <span>${(order.totalCents / 100).toFixed(2)}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
