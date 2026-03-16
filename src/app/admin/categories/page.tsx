"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/Button";

type Category = {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  parentId?: string | null;
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"new" | Category | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", image: "", parentId: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageDragging, setImageDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function handleImageFile(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (data.url) setForm((prev) => ({ ...prev, image: data.url }));
    } catch (_) {}
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) setCategories(await res.json());
    } catch (_) {}
    setLoading(false);
  }

  function openNew() {
    setForm({ name: "", slug: "", image: "", parentId: "" });
    setError("");
    setModal("new");
  }

  function openEdit(c: Category) {
    setForm({
      name: c.name,
      slug: c.slug,
      image: c.image ?? "",
      parentId: c.parentId ?? "",
    });
    setError("");
    setModal(c);
  }

  function updateSlugFromName(name: string) {
    const slug = name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    setForm({ ...form, name, slug });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || form.name.toLowerCase().trim().replace(/\s+/g, "-"),
        image: form.image.trim() || null,
        parentId: form.parentId || null,
      };
      if (modal === "new") {
        const res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error ?? "Failed to create");
          setSaving(false);
          return;
        }
      } else if (modal) {
        const res = await fetch(`/api/admin/categories/${modal.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error ?? "Failed to update");
          setSaving(false);
          return;
        }
      }
      setModal(null);
      loadCategories();
    } catch (_) {
      setError("Something went wrong");
    }
    setSaving(false);
  }

  async function handleDelete(c: Category) {
    if (!confirm(`Delete category "${c.name}"? Products using this category will need to be reassigned first.`)) return;
    try {
      const res = await fetch(`/api/admin/categories/${c.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error ?? "Failed to delete");
        return;
      }
      loadCategories();
    } catch (_) {
      alert("Failed to delete");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-sans text-2xl font-semibold text-text">Categories</h1>
        <Button onClick={openNew} variant="primary">New category</Button>
      </div>
      {loading ? (
        <p className="font-sans text-muted">Loading…</p>
      ) : (
        <div className="border border-border rounded-lg bg-surface overflow-hidden">
          <table className="w-full font-sans text-sm">
            <thead>
              <tr className="border-b border-border bg-sage-1/50">
                <th className="text-left p-3 font-medium text-text">Name</th>
                <th className="text-left p-3 font-medium text-text">Slug</th>
                <th className="text-left p-3 font-medium text-text">Parent</th>
                <th className="text-left p-3 font-medium text-text">Image</th>
                <th className="p-3" aria-hidden />
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-muted text-center">No categories yet</td>
                </tr>
              ) : (
                categories.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0">
                    <td className="p-3 font-medium text-text">{c.name}</td>
                    <td className="p-3 text-muted">{c.slug}</td>
                    <td className="p-3 text-muted">
                      {c.parentId
                        ? categories.find((p) => p.id === c.parentId)?.name ?? "—"
                        : "—"}
                    </td>
                    <td className="p-3 text-muted max-w-xs truncate">
                      {c.image || "—"}
                    </td>
                    <td className="p-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(c)}
                        className="font-sans text-sm text-sage-dark hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c)}
                        className="font-sans text-sm text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30" onClick={() => !saving && setModal(null)}>
          <div className="bg-bg border border-border rounded-lg shadow-lg w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-sans text-lg font-semibold text-text mb-4">
              {modal === "new" ? "New category" : "Edit category"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="font-sans text-sm text-red-600">{error}</p>}
              <div>
                <label className="block font-sans text-sm font-medium text-text mb-1">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateSlugFromName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-4 py-2 font-sans text-sm"
                  required
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-text mb-1">Slug *</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                    })
                  }
                  className="w-full rounded-lg border border-border bg-bg px-4 py-2 font-sans text-sm"
                  required
                />
                <p className="mt-1 font-sans text-xs text-muted">
                  URL-friendly identifier (e.g., rubbers, blades, bats)
                </p>
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-text mb-1">
                  Parent category
                </label>
                <select
                  value={form.parentId}
                  onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                  className="w-full rounded-lg border border-border bg-bg px-4 py-2 font-sans text-sm"
                >
                  <option value="">No parent (top level)</option>
                  {categories
                    .filter((c) => !modal || c.id !== (modal === "new" ? "" : modal.id))
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-text mb-1">
                  Image
                </label>
                {form.image ? (
                  <p className="mb-2 font-sans text-xs text-muted truncate" title={form.image}>
                    Current: {form.image}
                  </p>
                ) : null}
                <div
                  className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg px-4 py-6 text-center cursor-pointer transition-colors ${
                    imageDragging ? "border-sage-dark bg-sage-1/40" : "border-border bg-surface"
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setImageDragging(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setImageDragging(false); }}
                  onDrop={async (e) => {
                    e.preventDefault();
                    setImageDragging(false);
                    const f = e.dataTransfer.files?.[0];
                    if (f) await handleImageFile(f);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <p className="font-sans text-xs text-muted">
                    Drag &amp; drop image here, or <span className="text-sage-dark underline">browse</span>
                  </p>
                  <p className="mt-1 font-sans text-[11px] text-muted">JPG, PNG, GIF, WEBP · Max 5 MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (f) await handleImageFile(f);
                      if (e.target) e.target.value = "";
                    }}
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? "Saving…" : modal === "new" ? "Create" : "Update"}
                </Button>
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="px-4 py-2 font-sans text-sm text-muted hover:text-text border border-border rounded-lg"
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
