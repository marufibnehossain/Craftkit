"use client";

import { useEffect, useState } from "react";
import Button from "@/components/Button";

type Address = {
  id: string;
  label: string | null;
  address: string;
  city: string;
  zip: string;
  country: string;
  isDefault: boolean;
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"new" | Address | null>(null);
  const [form, setForm] = useState({
    label: "",
    address: "",
    city: "",
    zip: "",
    country: "United States",
    isDefault: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/account/addresses");
        if (res.ok) {
          const data = await res.json();
          setAddresses(Array.isArray(data) ? data : []);
        }
      } catch (_) {}
      setLoading(false);
    }
    load();
  }, []);

  function openNew() {
    setForm({
      label: "",
      address: "",
      city: "",
      zip: "",
      country: "United States",
      isDefault: false,
    });
    setModal("new");
  }

  function openEdit(a: Address) {
    setForm({
      label: a.label ?? "",
      address: a.address,
      city: a.city,
      zip: a.zip,
      country: a.country,
      isDefault: a.isDefault,
    });
    setModal(a);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        label: form.label.trim() || null,
        address: form.address.trim(),
        city: form.city.trim(),
        zip: form.zip.trim(),
        country: form.country.trim(),
        isDefault: form.isDefault,
      };
      if (modal === "new") {
        const res = await fetch("/api/account/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const created = await res.json();
          setAddresses((prev) => [...prev, created]);
          setModal(null);
        }
      } else if (modal) {
        const res = await fetch(`/api/account/addresses/${modal.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const updated = await res.json();
          setAddresses((prev) => prev.map((a) => (a.id === modal.id ? updated : a)));
          setModal(null);
        }
      }
    } catch (_) {}
    setSaving(false);
  }

  async function handleDelete(a: Address) {
    if (!confirm("Delete this address?")) return;
    try {
      const res = await fetch(`/api/account/addresses/${a.id}`, { method: "DELETE" });
      if (res.ok) setAddresses((prev) => prev.filter((x) => x.id !== a.id));
    } catch (_) {}
  }

  return (
    <div>
      <h2 className="font-sans text-xl font-semibold text-[#1b1718] leading-[1.6] mb-2">Saved addresses</h2>
      <p className="font-sans text-base text-[#5f5d5d] leading-[1.6] tracking-[0.32px] mb-6">
        Manage your shipping addresses for faster checkout.
      </p>
      <Button onClick={openNew} variant="primary" className="mb-8">
        Add address
      </Button>
      {loading ? (
        <p className="font-sans text-[#5f5d5d]">Loading…</p>
      ) : (
        <ul className="space-y-4">
          {addresses.map((a) => (
            <li
              key={a.id}
              className="border border-[#e0d6c9] bg-[#f5eae2] p-6 flex flex-wrap items-start justify-between gap-4"
            >
              <div>
                {a.label && (
                  <p className="font-sans font-medium text-[#1b1718]">{a.label}</p>
                )}
                <p className="font-sans text-sm text-[#5f5d5d] mt-1">
                  {a.address}, {a.city} {a.zip}, {a.country}
                </p>
                {a.isDefault && (
                  <span className="inline-block mt-2 font-sans text-xs text-[#1b1718]">Default</span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(a)}
                  className="font-sans text-sm text-[#1b1718] hover:underline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(a)}
                  className="font-sans text-sm text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {!loading && addresses.length === 0 && (
        <p className="font-sans text-[#5f5d5d]">No saved addresses yet.</p>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30" onClick={() => !saving && setModal(null)}>
          <div className="bg-[#faf6f1] border border-[#e0d6c9] shadow-lg w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-sans text-lg font-semibold text-[#1b1718] mb-4">
              {modal === "new" ? "Add address" : "Edit address"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-sans text-sm font-medium text-[#1b1718] mb-1">Label (optional)</label>
                <input
                  type="text"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  placeholder="Home, Office"
                  className="w-full border border-[#e0d6c9] bg-[#faf6f1] px-4 py-2 font-sans text-sm"
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-[#1b1718] mb-1">Address *</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  required
                  className="w-full border border-[#e0d6c9] bg-[#faf6f1] px-4 py-2 font-sans text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-sm font-medium text-[#1b1718] mb-1">City *</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    required
                    className="w-full border border-[#e0d6c9] bg-[#faf6f1] px-4 py-2 font-sans text-sm"
                  />
                </div>
                <div>
                  <label className="block font-sans text-sm font-medium text-[#1b1718] mb-1">ZIP *</label>
                  <input
                    type="text"
                    value={form.zip}
                    onChange={(e) => setForm({ ...form, zip: e.target.value })}
                    required
                    className="w-full border border-[#e0d6c9] bg-[#faf6f1] px-4 py-2 font-sans text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-[#1b1718] mb-1">Country *</label>
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  required
                  className="w-full border border-[#e0d6c9] bg-[#faf6f1] px-4 py-2 font-sans text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={form.isDefault}
                  onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                  className="border-[#e0d6c9]"
                />
                <label htmlFor="isDefault" className="font-sans text-sm text-[#1b1718]">Set as default</label>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? "Saving…" : modal === "new" ? "Add" : "Update"}
                </Button>
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="px-4 py-2 font-sans text-sm text-[#5f5d5d] hover:text-[#1b1718] border border-[#e0d6c9]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
