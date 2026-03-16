"use client";

import { useEffect, useState } from "react";
import Button from "@/components/Button";

type RecaptchaVersion = "v2_checkbox" | "v2_invisible" | "v3";

type RecaptchaConfig = {
  siteKey: string;
  secretKeyMasked: string;
  hasSecretKey: boolean;
  enabled: boolean;
  version: RecaptchaVersion;
};

const VERSION_OPTIONS: { value: RecaptchaVersion; label: string; desc: string }[] = [
  { value: "v2_checkbox", label: "v2 — \"I'm not a robot\" Checkbox", desc: "Visible checkbox that users click to verify." },
  { value: "v2_invisible", label: "v2 — Invisible", desc: "Runs in the background, only shows a challenge if suspicious." },
  { value: "v3", label: "v3 — Score-based (Invisible)", desc: "Fully invisible. Returns a score (0.0–1.0). Requires score ≥ 0.5 to pass." },
];

export default function AdminRecaptchaSettingsPage() {
  const [config, setConfig] = useState<RecaptchaConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [siteKey, setSiteKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [version, setVersion] = useState<RecaptchaVersion>("v2_checkbox");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/settings/recaptcha");
        if (res.ok) {
          const data = await res.json();
          setConfig(data);
          setSiteKey(data.siteKey ?? "");
          setSecretKey("");
          setEnabled(data.enabled ?? false);
          setVersion(data.version ?? "v2_checkbox");
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
    setError("");
    try {
      const res = await fetch("/api/admin/settings/recaptcha", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteKey: siteKey.trim(),
          secretKey: secretKey || undefined,
          enabled,
          version,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setSecretKey("");
        const getRes = await fetch("/api/admin/settings/recaptcha");
        if (getRes.ok) {
          const data = await getRes.json();
          setConfig(data);
          setEnabled(data.enabled);
          setVersion(data.version);
        }
      } else {
        setError("Failed to save settings.");
      }
    } catch (_) {
      setError("Something went wrong.");
    }
    setSaving(false);
  }

  if (loading) {
    return <p className="font-sans text-muted">Loading…</p>;
  }

  return (
    <div>
      <h1 className="font-sans text-2xl font-semibold text-text mb-2">reCAPTCHA</h1>
      <p className="font-sans text-sm text-muted mb-8">
        Protect forms from bots using Google reCAPTCHA. When enabled, reCAPTCHA will be applied
        to login, registration, forgot password, contact, and seller application forms.
      </p>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
        <div className="border border-border rounded-lg bg-surface p-6 space-y-5">
          <h2 className="font-sans text-lg font-medium text-text">Configuration</h2>

          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              onClick={() => setEnabled(!enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                enabled ? "bg-secondary-100" : "bg-dark-40"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  enabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className="font-sans text-sm text-text">
              {enabled ? "Enabled" : "Disabled"}
            </span>
          </div>

          <div>
            <label className="block font-sans text-sm font-medium text-text mb-2">
              reCAPTCHA Version
            </label>
            <div className="space-y-2">
              {VERSION_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 p-3 border cursor-pointer transition-colors ${
                    version === opt.value
                      ? "border-secondary-100 bg-secondary-light"
                      : "border-border hover:border-dark-60"
                  }`}
                >
                  <input
                    type="radio"
                    name="recaptcha-version"
                    value={opt.value}
                    checked={version === opt.value}
                    onChange={() => setVersion(opt.value)}
                    className="mt-0.5 accent-secondary-100"
                  />
                  <div>
                    <p className="font-sans text-sm font-medium text-text">{opt.label}</p>
                    <p className="font-sans text-xs text-muted mt-0.5">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="recaptcha-site-key" className="block font-sans text-sm font-medium text-text mb-1.5">
              Site key
            </label>
            <input
              id="recaptcha-site-key"
              type="text"
              value={siteKey}
              onChange={(e) => setSiteKey(e.target.value)}
              placeholder="6Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-sage-2"
            />
          </div>

          <div>
            <label htmlFor="recaptcha-secret-key" className="block font-sans text-sm font-medium text-text mb-1.5">
              Secret key
            </label>
            <input
              id="recaptcha-secret-key"
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder={config?.hasSecretKey ? "Leave blank to keep current" : "6Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-sage-2"
            />
            {config?.hasSecretKey && !secretKey && (
              <p className="mt-1 font-sans text-xs text-muted">
                ✓ Secret key saved — {config.secretKeyMasked}
              </p>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 px-4 py-3 font-sans text-sm text-red-700 rounded-lg">
            {error}
          </div>
        )}

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
        <h3 className="font-sans text-sm font-medium text-text mb-3">How to get keys</h3>
        <ol className="font-sans text-sm text-muted space-y-1 list-decimal pl-4">
          <li>Go to <a href="https://www.google.com/recaptcha/admin" target="_blank" rel="noopener noreferrer" className="text-secondary-100 underline">Google reCAPTCHA Admin Console</a></li>
          <li>Click the <strong>+</strong> button to register a new site</li>
          <li>Choose the version that matches your selection above</li>
          <li>Add your domain(s) — e.g. <code className="bg-bg px-1">yourdomain.com</code></li>
          <li>Copy the <strong>Site Key</strong> and <strong>Secret Key</strong> and paste them above</li>
        </ol>
        <div className="mt-4 p-3 bg-bg border border-border rounded">
          <p className="font-sans text-xs text-muted">
            <strong>Important:</strong> The key type must match the version selected above. Using a v3 key with v2 (or vice versa) will show an &quot;Invalid key type&quot; error.
          </p>
        </div>
      </div>
    </div>
  );
}
