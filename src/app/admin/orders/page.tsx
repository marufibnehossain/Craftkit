"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Order = {
  id: string;
  email: string;
  name: string | null;
  totalCents: number;
  status: string;
  createdAt: string;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const url = statusFilter
        ? `/api/admin/orders?status=${encodeURIComponent(statusFilter)}`
        : "/api/admin/orders";
      const res = await fetch(url);
      if (res.ok) setOrders(await res.json());
    } catch (_) {}
    setLoading(false);
  }

  useEffect(() => {
    setSelected(new Set());
    load();
  }, [statusFilter]);

  const allSelected = orders.length > 0 && selected.size === orders.length;
  const someSelected = selected.size > 0;

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(orders.map((o) => o.id)));
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.preventDefault();
    if (!confirm("Permanently delete this order? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== id));
        setSelected((prev) => { const n = new Set(prev); n.delete(id); return n; });
      }
    } catch (_) {}
    setDeletingId(null);
  }

  async function handleBulkDelete() {
    if (selected.size === 0) return;
    if (!confirm(`Permanently delete ${selected.size} order${selected.size > 1 ? "s" : ""}? This cannot be undone.`)) return;
    setBulkDeleting(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected) }),
      });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => !selected.has(o.id)));
        setSelected(new Set());
      }
    } catch (_) {}
    setBulkDeleting(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-sans text-2xl font-semibold text-text">Orders</h1>
        {someSelected && (
          <button
            onClick={handleBulkDelete}
            disabled={bulkDeleting}
            className="font-sans text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors disabled:opacity-50"
          >
            {bulkDeleting
              ? "Deleting…"
              : `Delete ${selected.size} selected`}
          </button>
        )}
      </div>
      <div className="mb-4 flex items-center gap-2">
        <label htmlFor="status" className="font-sans text-sm text-muted">Filter:</label>
        <select
          id="status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-border bg-bg px-3 py-2 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-sage-2"
        >
          <option value="">All</option>
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
      <div className="border border-border rounded-lg bg-surface overflow-hidden">
        <table className="w-full font-sans text-sm">
          <thead>
            <tr className="border-b border-border bg-sage-1/50">
              <th className="p-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected && !allSelected;
                  }}
                  onChange={toggleAll}
                  className="cursor-pointer accent-wine"
                  aria-label="Select all"
                />
              </th>
              <th className="text-left p-3 font-medium text-text">Order ID</th>
              <th className="text-left p-3 font-medium text-text">Date</th>
              <th className="text-left p-3 font-medium text-text">Customer</th>
              <th className="text-right p-3 font-medium text-text">Total</th>
              <th className="text-left p-3 font-medium text-text">Status</th>
              <th className="p-3" aria-hidden />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-6 text-muted text-center">Loading…</td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-muted text-center">No orders found</td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className={`border-b border-border last:border-0 transition-colors ${selected.has(order.id) ? "bg-red-50/50" : ""}`}
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selected.has(order.id)}
                      onChange={() => toggleOne(order.id)}
                      className="cursor-pointer accent-wine"
                      aria-label={`Select order ${order.id}`}
                    />
                  </td>
                  <td className="p-3">
                    <code className="text-xs bg-bg px-1.5 py-0.5 rounded text-muted">
                      {order.id.slice(0, 12)}…
                    </code>
                  </td>
                  <td className="p-3 text-muted">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3 text-text">
                    {order.name ? `${order.name} — ` : ""}{order.email}
                  </td>
                  <td className="p-3 text-right text-text">
                    ${(order.totalCents / 100).toFixed(2)}
                  </td>
                  <td className="p-3">
                    <span className="text-muted">{order.status.toLowerCase().replace(/_/g, " ")}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3 justify-end">
                      <Link href={`/admin/orders/${order.id}`} className="text-sage-dark hover:underline">
                        Edit
                      </Link>
                      <button
                        onClick={(e) => handleDelete(order.id, e)}
                        disabled={deletingId === order.id}
                        className="text-red-500 hover:text-red-700 disabled:opacity-40 transition-colors"
                      >
                        {deletingId === order.id ? "…" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
