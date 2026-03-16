"use client";

import { useEffect, useState } from "react";

type User = {
  id: string;
  email: string;
  name: string | null;
  role: string | null;
  emailVerified: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    addresses: number;
    wishlistItems: number;
  };
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "", emailVerified: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch (e) {
      console.error("Failed to load users:", e);
    } finally {
      setLoading(false);
    }
  }

  function openEdit(user: User) {
    setEditUser(user);
    setEditForm({
      name: user.name ?? "",
      email: user.email,
      role: user.role ?? "CUSTOMER",
      emailVerified: !!user.emailVerified,
    });
    setError("");
  }

  async function handleSave() {
    if (!editUser) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editUser.id,
          name: editForm.name || null,
          email: editForm.email,
          role: editForm.role,
          emailVerified: editForm.emailVerified,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update");
      }
      const updated = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setEditUser(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to update user");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users?id=${deleteConfirm.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }
      setUsers((prev) => prev.filter((u) => u.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to delete user");
    } finally {
      setDeleting(false);
    }
  }

  async function handleVerify(user: User) {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, emailVerified: true }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to verify");
      }
      const updated = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to verify user");
    }
  }

  const filtered = users.filter((u) => {
    const matchesSearch =
      !search ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.name ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const inputClass =
    "w-full border border-border bg-white px-3 py-2 font-sans text-sm text-text focus:outline-none focus:border-sage-dark rounded-lg";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="font-sans text-muted">Loading users…</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-sans text-2xl font-semibold text-sage-dark">
          Users ({users.length})
        </h1>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-border bg-white px-3 py-2 font-sans text-sm text-text focus:outline-none focus:border-sage-dark rounded-lg w-64"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border border-border bg-white px-3 py-2 font-sans text-sm text-text focus:outline-none focus:border-sage-dark rounded-lg"
        >
          <option value="">All Roles</option>
          <option value="CUSTOMER">Customer</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="text-left px-4 py-3 font-sans text-xs font-medium text-muted uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left px-4 py-3 font-sans text-xs font-medium text-muted uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left px-4 py-3 font-sans text-xs font-medium text-muted uppercase tracking-wider">
                  Role
                </th>
                <th className="text-left px-4 py-3 font-sans text-xs font-medium text-muted uppercase tracking-wider">
                  Verified
                </th>
                <th className="text-left px-4 py-3 font-sans text-xs font-medium text-muted uppercase tracking-wider">
                  Joined
                </th>
                <th className="text-left px-4 py-3 font-sans text-xs font-medium text-muted uppercase tracking-wider">
                  Addresses
                </th>
                <th className="text-left px-4 py-3 font-sans text-xs font-medium text-muted uppercase tracking-wider">
                  Wishlist
                </th>
                <th className="text-right px-4 py-3 font-sans text-xs font-medium text-muted uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center font-sans text-sm text-muted"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border last:border-0 hover:bg-surface/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-sans text-sm text-text">
                      {user.name || "—"}
                    </td>
                    <td className="px-4 py-3 font-sans text-sm text-text">
                      {user.email}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 font-sans text-xs font-medium rounded-full ${
                          user.role === "ADMIN"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-sage-1 text-sage-dark"
                        }`}
                      >
                        {user.role ?? "CUSTOMER"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.emailVerified ? (
                        <span className="inline-block px-2 py-0.5 font-sans text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Verified
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleVerify(user)}
                          className="inline-block px-2 py-0.5 font-sans text-xs font-medium rounded-full bg-red-50 text-red-700 hover:bg-red-100 transition-colors cursor-pointer"
                        >
                          Unverified
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 font-sans text-sm text-muted">
                      {new Date(user.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 font-sans text-sm text-muted text-center">
                      {user._count.addresses}
                    </td>
                    <td className="px-4 py-3 font-sans text-sm text-muted text-center">
                      {user._count.wishlistItems}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(user)}
                          className="px-3 py-1.5 font-sans text-xs font-medium text-sage-dark bg-sage-1 hover:bg-sage-2 rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(user)}
                          className="px-3 py-1.5 font-sans text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          Delete
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

      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-sans text-lg font-semibold text-sage-dark">
                Edit User
              </h2>
              <button
                type="button"
                onClick={() => setEditUser(null)}
                className="text-muted hover:text-text text-xl leading-none"
              >
                &times;
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              {error && (
                <p className="font-sans text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}
              <div>
                <label className="block font-sans text-sm font-medium text-text mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className={inputClass}
                  placeholder="User name"
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-text mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, email: e.target.value }))
                  }
                  className={inputClass}
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-text mb-1">
                  Role
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, role: e.target.value }))
                  }
                  className={inputClass}
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.emailVerified}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, emailVerified: e.target.checked }))
                    }
                    className="w-4 h-4 accent-sage-dark"
                  />
                  <span className="font-sans text-sm font-medium text-text">
                    Email Verified
                  </span>
                </label>
              </div>
              <div className="font-sans text-xs text-muted">
                User ID: {editUser.id}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
              <button
                type="button"
                onClick={() => setEditUser(null)}
                className="px-4 py-2 font-sans text-sm text-muted hover:text-text transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 font-sans text-sm font-medium text-white bg-sage-dark hover:bg-sage-dark/90 rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="font-sans text-lg font-semibold text-red-700">
                Delete User
              </h2>
            </div>
            <div className="px-6 py-4">
              <p className="font-sans text-sm text-text">
                Are you sure you want to delete{" "}
                <strong>{deleteConfirm.name || deleteConfirm.email}</strong>?
                This will also remove all their addresses, wishlist items, and
                tokens. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 font-sans text-sm text-muted hover:text-text transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 font-sans text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
