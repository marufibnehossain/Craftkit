"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/Button";
import Link from "next/link";

type BlogCategory = { id: string; name: string; slug: string };

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string | null;
  image: string | null;
  authorName: string;
  categoryId: string;
  category: BlogCategory;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function AdminBlogPostsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"new" | BlogPost | null>(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    body: "",
    image: "",
    authorName: "",
    categoryId: "",
    publishedAt: "",
  });
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
    load();
  }, []);

  async function load() {
    try {
      const [postsRes, catRes] = await Promise.all([
        fetch("/api/admin/blog-posts"),
        fetch("/api/admin/blog-categories"),
      ]);
      if (postsRes.ok) setPosts(await postsRes.json());
      if (catRes.ok) setCategories(await catRes.json());
    } catch (_) {}
    setLoading(false);
  }

  function openNew() {
    setForm({
      title: "",
      slug: "",
      excerpt: "",
      body: "",
      image: "",
      authorName: "",
      categoryId: categories[0]?.id ?? "",
      publishedAt: new Date().toISOString().slice(0, 16),
    });
    setError("");
    setModal("new");
  }

  function openEdit(p: BlogPost) {
    setForm({
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      body: p.body ?? "",
      image: p.image ?? "",
      authorName: p.authorName,
      categoryId: p.categoryId,
      publishedAt: p.publishedAt ? new Date(p.publishedAt).toISOString().slice(0, 16) : "",
    });
    setError("");
    setModal(p);
  }

  function updateSlugFromTitle(title: string) {
    const slug = title.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    setForm({ ...form, title, slug });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim() || form.title.toLowerCase().trim().replace(/\s+/g, "-"),
        excerpt: form.excerpt.trim(),
        body: form.body.trim() || null,
        image: form.image.trim() || null,
        authorName: form.authorName.trim(),
        categoryId: form.categoryId,
        publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : null,
      };
      if (modal === "new") {
        const res = await fetch("/api/admin/blog-posts", {
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
        const res = await fetch(`/api/admin/blog-posts/${modal.id}`, {
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
      load();
    } catch (_) {
      setError("Something went wrong");
    }
    setSaving(false);
  }

  async function handleDelete(p: BlogPost) {
    if (!confirm(`Delete post "${p.title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/blog-posts/${p.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error ?? "Failed to delete");
        return;
      }
      load();
    } catch (_) {
      alert("Failed to delete");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-sans text-2xl font-semibold text-text">Blog posts</h1>
        <div className="flex gap-2">
          <Link
            href="/blog"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 font-sans text-sm border border-border rounded-lg text-muted hover:text-text"
          >
            View blog
          </Link>
          <Button onClick={openNew} variant="primary">New post</Button>
        </div>
      </div>
      {loading ? (
        <p className="font-sans text-muted">Loading…</p>
      ) : (
        <div className="border border-border rounded-lg bg-surface overflow-hidden">
          <table className="w-full font-sans text-sm">
            <thead>
              <tr className="border-b border-border bg-sage-1/50">
                <th className="text-left p-3 font-medium text-text">Title</th>
                <th className="text-left p-3 font-medium text-text">Category</th>
                <th className="text-left p-3 font-medium text-text">Author</th>
                <th className="text-left p-3 font-medium text-text">Published</th>
                <th className="p-3" aria-hidden />
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-muted text-center">No blog posts yet</td>
                </tr>
              ) : (
                posts.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="p-3 font-medium text-text">{p.title}</td>
                    <td className="p-3 text-muted">{p.category.name}</td>
                    <td className="p-3 text-muted">{p.authorName}</td>
                    <td className="p-3 text-muted">
                      {p.publishedAt
                        ? new Date(p.publishedAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="p-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(p)}
                        className="font-sans text-sm text-sage-dark hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p)}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 overflow-y-auto" onClick={() => !saving && setModal(null)}>
          <div className="bg-bg border border-border rounded-lg shadow-lg w-full max-w-2xl my-8 p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-sans text-lg font-semibold text-text mb-4">
              {modal === "new" ? "New blog post" : "Edit blog post"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="font-sans text-sm text-red-600">{error}</p>}
              <div>
                <label className="block font-sans text-sm font-medium text-text mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => updateSlugFromTitle(e.target.value)}
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
                <p className="mt-1 font-sans text-xs text-muted">URL path: /blog/[slug]</p>
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-text mb-1">Excerpt *</label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  className="w-full rounded-lg border border-border bg-bg px-4 py-2 font-sans text-sm min-h-[80px]"
                  required
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-text mb-1">Body (HTML optional)</label>
                <textarea
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  className="w-full rounded-lg border border-border bg-bg px-4 py-2 font-sans text-sm min-h-[120px]"
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-text mb-1">Image</label>
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
              <div>
                <label className="block font-sans text-sm font-medium text-text mb-1">Author name *</label>
                <input
                  type="text"
                  value={form.authorName}
                  onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                  className="w-full rounded-lg border border-border bg-bg px-4 py-2 font-sans text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-sm font-medium text-text mb-1">Category *</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full rounded-lg border border-border bg-bg px-4 py-2 font-sans text-sm"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-sans text-sm font-medium text-text mb-1">Published at</label>
                  <input
                    type="datetime-local"
                    value={form.publishedAt}
                    onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
                    className="w-full rounded-lg border border-border bg-bg px-4 py-2 font-sans text-sm"
                  />
                  <p className="mt-1 font-sans text-xs text-muted">Leave empty for draft (hidden on blog)</p>
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
