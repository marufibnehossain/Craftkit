"use client";

import { useEffect, useState } from "react";
import Button from "@/components/Button";

type EmailConfig = {
  host: string;
  port: string;
  user: string;
  passwordMasked: string;
  hasPassword: boolean;
  fromEmail: string;
};

export default function AdminEmailSettingsPage() {
  const [config, setConfig] = useState<EmailConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [host, setHost] = useState("");
  const [port, setPort] = useState("587");
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [fromEmail, setFromEmail] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/settings/email");
        if (res.ok) {
          const data = await res.json();
          setConfig(data);
          setHost(data.host ?? "");
          setPort(data.port ?? "587");
          setUser(data.user ?? "");
          setPassword("");
          setFromEmail(data.fromEmail ?? "");
        }
      } catch (_) {}
      setLoading(false);
    }
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings/email", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          host: host.trim(),
          port: port.trim() || "587",
          user: user.trim(),
          password: password || undefined,
          fromEmail: fromEmail.trim(),
        }),
      });
      if (res.ok) {
        setSaved(true);
        setConfig((prev) =>
          prev
            ? {
                ...prev,
                hasPassword: password ? true : prev.hasPassword,
                passwordMasked: password ? "••••••••••••" : prev.passwordMasked,
              }
            : prev
        );
        const getRes = await fetch("/api/admin/settings/email");
        if (getRes.ok) {
          const data = await getRes.json();
          setConfig(data);
        }
      }
    } catch (_) {}
    setSaving(false);
  }

  if (loading) {
    return <p className="font-sans text-muted">Loading…</p>;
  }

  return (
    <div>
      <h1 className="font-sans text-2xl font-semibold text-text mb-2">Email (SMTP)</h1>
      <p className="font-sans text-sm text-muted mb-8">
        Configure SMTP for order confirmations, password reset, and verification emails.
        Values here override environment variables.
      </p>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
        <div className="border border-border rounded-lg bg-surface p-6 space-y-4">
          <h2 className="font-sans text-lg font-medium text-text">SMTP server</h2>

          <div>
            <label htmlFor="smtp-host" className="block font-sans text-sm font-medium text-text mb-1.5">
              Host
            </label>
            <input
              id="smtp-host"
              type="text"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="e.g. smtp.gmail.com, smtp.titan.email"
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-sage-2"
            />
          </div>

          <div>
            <label htmlFor="smtp-port" className="block font-sans text-sm font-medium text-text mb-1.5">
              Port
            </label>
            <input
              id="smtp-port"
              type="text"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              placeholder="587 (TLS) or 465 (SSL)"
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-sage-2"
            />
          </div>

          <div>
            <label htmlFor="smtp-user" className="block font-sans text-sm font-medium text-text mb-1.5">
              Username
            </label>
            <input
              id="smtp-user"
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="SMTP username or email"
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-sage-2"
            />
          </div>

          <div>
            <label htmlFor="smtp-password" className="block font-sans text-sm font-medium text-text mb-1.5">
              Password
            </label>
            <input
              id="smtp-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={config?.hasPassword ? "Leave blank to keep current" : "SMTP password or app password"}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-sage-2"
            />
            {config?.hasPassword && !password && (
              <p className="mt-1 font-sans text-xs text-muted">
                ✓ Password saved — {config?.passwordMasked ?? "••••••••••••"}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="smtp-from" className="block font-sans text-sm font-medium text-text mb-1.5">
              From email
            </label>
            <input
              id="smtp-from"
              type="text"
              value={fromEmail}
              onChange={(e) => setFromEmail(e.target.value)}
              placeholder="Store Name <hello@example.com>"
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-sage-2"
            />
            <p className="mt-1 font-sans text-xs text-muted">
              Display name and email for outgoing messages (e.g. Ecommerce &lt;hello@example.com&gt;)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
          {saved && (
            <span className="font-sans text-sm text-green-600">Saved.</span>
          )}
        </div>
      </form>

      <div className="mt-10 border border-border rounded-lg bg-surface p-6 max-w-xl">
        <h3 className="font-sans text-sm font-medium text-text mb-2">Common providers</h3>
        <ul className="font-sans text-sm text-muted space-y-1">
          <li><strong>Gmail:</strong> smtp.gmail.com, port 587, use App Password</li>
          <li><strong>Titan:</strong> smtp.titan.email, port 587</li>
          <li><strong>Outlook:</strong> smtp.office365.com, port 587</li>
          <li><strong>SendGrid:</strong> smtp.sendgrid.net, port 587</li>
        </ul>
      </div>
    </div>
  );
}
