"use client";

import { useEffect, useState } from "react";

type SellerApplication = {
  id: string;
  role: string;
  level: string;
  categories: string;
  platforms: string;
  displayName: string;
  bio: string | null;
  email: string | null;
  createdAt: string;
};

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "role" | "level" }) {
  const styles = {
    default: "bg-sage-1/60 text-text",
    role: "bg-[#862830]/10 text-[#862830]",
    level: "bg-[#1B1718]/10 text-[#1B1718]",
  };
  return (
    <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${styles[variant]}`}>
      {children}
    </span>
  );
}

function timeAgo(dateStr: string) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const LABEL_MAP: Record<string, string> = {
  seller: "Seller",
  designer: "Designer",
  beginner: "Beginner",
  intermediate: "Intermediate",
  expert: "Expert",
  knitting: "Knitting",
  sewing: "Sewing",
  fashion: "Fashion",
  other: "Other",
  instagram: "Instagram",
  marketplaces: "Marketplaces",
  website: "Personal Website",
  local: "Local In-Person",
  "personal-website": "Personal Website",
  "local-in-person": "Local In-Person",
};

function toLabel(id: string) {
  return LABEL_MAP[id] || id.charAt(0).toUpperCase() + id.slice(1);
}

function ForwardModal({ app, onClose }: { app: SellerApplication; onClose: () => void }) {
  const [emailInput, setEmailInput] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSend = async () => {
    const emails = emailInput.split(",").map((e) => e.trim()).filter(Boolean);
    if (emails.length === 0) return;
    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/seller-applications/forward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: app.id, emails }),
      });
      if (res.ok) {
        const data = await res.json();
        const sent = data.results?.filter((r: { ok: boolean }) => r.ok).length || 0;
        setResult(`Sent to ${sent} of ${emails.length} recipient${emails.length > 1 ? "s" : ""}`);
      } else {
        const data = await res.json();
        setResult(data.error || "Failed to send");
      }
    } catch (_) {
      setResult("Failed to send");
    }
    setSending(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-surface border border-border rounded-lg w-full max-w-md p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div>
          <h3 className="font-sans text-base font-semibold text-text">Forward Application</h3>
          <p className="text-xs text-muted mt-1">Send {app.displayName}&apos;s application to one or more emails</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">
            Email addresses (comma-separated)
          </label>
          <input
            type="text"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="team@example.com, partner@example.com"
            className="w-full px-3 py-2 border border-border rounded text-sm font-sans text-text bg-white focus:outline-none focus:border-[#862830]"
          />
        </div>
        {result && (
          <p className={`text-xs font-medium ${result.startsWith("Sent") ? "text-green-700" : "text-red-600"}`}>
            {result}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="text-xs font-medium text-muted px-3 py-1.5 border border-border rounded hover:bg-sage-1/30"
          >
            Close
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !emailInput.trim()}
            className="text-xs font-medium text-white bg-[#1B1718] px-4 py-1.5 rounded hover:bg-[#1B1718]/80 disabled:opacity-50"
          >
            {sending ? "Sending…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ApplicationCard({ app, onDelete }: { app: SellerApplication; onDelete: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showForward, setShowForward] = useState(false);
  const categories = app.categories.split(", ").filter(Boolean);
  const platforms = app.platforms.split(", ").filter(Boolean);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete application from ${app.displayName}?`)) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/admin/seller-applications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: app.id }),
      });
      if (res.ok) onDelete(app.id);
    } catch (_) {}
    setDeleting(false);
  };

  return (
    <>
      <div className="border border-border rounded-lg bg-surface overflow-hidden">
        <div
          className="p-4 cursor-pointer hover:bg-sage-1/20 transition-colors"
          onClick={() => setOpen(!open)}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-[#862830]/10 flex items-center justify-center shrink-0">
                <span className="text-[#862830] font-semibold text-sm">
                  {app.displayName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-medium text-text text-sm truncate">{app.displayName}</p>
                {app.email ? (
                  <a
                    href={`mailto:${app.email}`}
                    className="text-xs text-muted hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {app.email}
                  </a>
                ) : (
                  <p className="text-xs text-muted">No email provided</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-muted whitespace-nowrap">{timeAgo(app.createdAt)}</span>
              <svg
                className={`w-4 h-4 text-muted transition-transform ${open ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            <Badge variant="role">Role: {toLabel(app.role)}</Badge>
            <Badge variant="level">Level: {toLabel(app.level)}</Badge>
          </div>
        </div>

        {open && (
          <div className="border-t border-border px-4 py-4 bg-sage-1/10 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1.5">Email</p>
                <p className="text-text text-sm">
                  {app.email ? (
                    <a href={`mailto:${app.email}`} className="hover:underline">{app.email}</a>
                  ) : (
                    "Not provided"
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1.5">Categories</p>
                <p className="text-text text-sm">
                  {categories.length > 0 ? categories.map(toLabel).join(", ") : "None specified"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1.5">Platforms</p>
                <p className="text-text text-sm">
                  {platforms.length > 0 ? platforms.map(toLabel).join(", ") : "None specified"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1.5">Submitted</p>
                <p className="text-text text-sm">{new Date(app.createdAt).toLocaleString()}</p>
              </div>
            </div>
            {app.bio && (
              <div>
                <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1.5">Bio</p>
                <p className="text-text text-sm leading-relaxed bg-surface rounded p-3 border border-border">
                  {app.bio}
                </p>
              </div>
            )}
            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); setShowForward(true); }}
                className="text-xs font-medium text-[#1B1718] hover:text-[#862830] transition-colors px-3 py-1.5 border border-border rounded hover:bg-sage-1/30"
              >
                Forward via email
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs font-medium text-red-600 hover:text-red-800 disabled:opacity-50 transition-colors px-3 py-1.5 border border-red-200 rounded hover:bg-red-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        )}
      </div>
      {showForward && <ForwardModal app={app} onClose={() => setShowForward(false)} />}
    </>
  );
}

function NotificationSettings() {
  const [emails, setEmails] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/settings/seller-notifications");
        if (res.ok) {
          const data = await res.json();
          setEmails(data.emails || "");
        }
      } catch (_) {}
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings/seller-notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails }),
      });
      if (res.ok) setSaved(true);
    } catch (_) {}
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) return null;

  return (
    <div className="border border-border rounded-lg bg-surface p-4 mb-6">
      <p className="font-sans text-sm font-semibold text-text mb-1">Auto-notify on new submissions</p>
      <p className="text-xs text-muted mb-3">
        Every new seller application will automatically be sent to these email addresses.
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={emails}
          onChange={(e) => setEmails(e.target.value)}
          placeholder="team@example.com, partner@example.com"
          className="flex-1 px-3 py-2 border border-border rounded text-sm font-sans text-text bg-white focus:outline-none focus:border-[#862830]"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-xs font-medium text-white bg-[#1B1718] px-4 py-2 rounded hover:bg-[#1B1718]/80 disabled:opacity-50 whitespace-nowrap"
        >
          {saving ? "Saving…" : saved ? "Saved!" : "Save"}
        </button>
      </div>
    </div>
  );
}

export default function AdminSellerApplicationsPage() {
  const [apps, setApps] = useState<SellerApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/seller-applications");
        if (res.ok) setApps(await res.json());
      } catch (_) {}
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-sans text-2xl font-semibold text-text">Seller Applications</h1>
          {!loading && (
            <p className="text-sm text-muted mt-1">
              {apps.length} application{apps.length !== 1 ? "s" : ""} received
            </p>
          )}
        </div>
      </div>

      <NotificationSettings />

      {loading ? (
        <div className="border border-border rounded-lg bg-surface p-12 text-center text-muted">
          Loading…
        </div>
      ) : apps.length === 0 ? (
        <div className="border border-border rounded-lg bg-surface p-12 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-sage-1/50 flex items-center justify-center">
            <svg className="w-6 h-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <p className="text-muted font-medium">No seller applications yet</p>
          <p className="text-xs text-muted mt-1">Applications will appear here once submitted</p>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map((app) => (
            <ApplicationCard key={app.id} app={app} onDelete={(id) => setApps((prev) => prev.filter((a) => a.id !== id))} />
          ))}
        </div>
      )}
    </div>
  );
}
