"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/Button";

type BrandingConfig = {
  siteName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
};

type BrandingApiResponse = BrandingConfig & {
  hasCustomLogo: boolean;
  hasCustomFavicon: boolean;
};

function ImageUploader({
  label,
  hint,
  currentUrl,
  isCustom,
  type,
  onUploaded,
  onRemoved,
}: {
  label: string;
  hint: string;
  currentUrl: string;
  isCustom: boolean;
  type: "logo" | "favicon";
  onUploaded: (url: string) => void;
  onRemoved: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", type);
      const res = await fetch("/api/admin/upload-branding", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Upload failed"); return; }
      onUploaded(data.url);
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    setRemoving(true);
    setError("");
    try {
      const key = type === "logo" ? "logoUrl" : "faviconUrl";
      const res = await fetch("/api/admin/settings/branding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: "" }),
      });
      if (res.ok) onRemoved();
      else setError("Could not remove");
    } catch {
      setError("Could not remove");
    } finally {
      setRemoving(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block font-sans text-sm font-medium text-dark-100 mb-1">{label}</label>
        <p className="font-sans text-xs text-dark-60">{hint}</p>
      </div>

      {currentUrl && (
        <div className="flex items-center gap-4 p-3 border border-brand-dark bg-brand-light">
          <img
            src={currentUrl}
            alt={label}
            className="max-h-12 max-w-[160px] object-contain"
          />
          <div className="flex-1 min-w-0">
            <span className="font-sans text-xs text-dark-60 break-all block">{currentUrl}</span>
            {!isCustom && (
              <span className="font-sans text-xs text-dark-40 italic">Default</span>
            )}
          </div>
          {isCustom && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={removing}
              className="shrink-0 flex items-center gap-1 font-sans text-xs text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
              title="Remove and revert to default"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
              </svg>
              {removing ? "Removing…" : "Remove"}
            </button>
          )}
        </div>
      )}

      <div
        className="border-2 border-dashed border-brand-dark rounded-none p-6 text-center cursor-pointer hover:bg-brand-light transition-colors"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        {uploading ? (
          <p className="font-sans text-sm text-dark-60">Uploading…</p>
        ) : (
          <>
            <svg className="mx-auto mb-2 text-dark-40" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="font-sans text-sm text-dark-80">Click or drag to upload</p>
            <p className="font-sans text-xs text-dark-40 mt-1">PNG, JPG, WebP, SVG, ICO · max 5 MB</p>
          </>
        )}
      </div>

      {error && <p className="font-sans text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default function AdminBrandingPage() {
  const [config, setConfig] = useState<BrandingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [siteName, setSiteName] = useState("");
  const [tagline, setTagline] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [hasCustomLogo, setHasCustomLogo] = useState(false);
  const [hasCustomFavicon, setHasCustomFavicon] = useState(false);

  async function reloadConfig() {
    const res = await fetch("/api/admin/settings/branding");
    if (res.ok) {
      const d: BrandingApiResponse = await res.json();
      setConfig({ siteName: d.siteName, tagline: d.tagline, logoUrl: d.logoUrl, faviconUrl: d.faviconUrl });
      setSiteName(d.siteName);
      setTagline(d.tagline);
      setLogoUrl(d.logoUrl);
      setFaviconUrl(d.faviconUrl);
      setHasCustomLogo(d.hasCustomLogo);
      setHasCustomFavicon(d.hasCustomFavicon);
    }
  }

  useEffect(() => {
    reloadConfig().finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings/branding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteName, tagline, logoUrl, faviconUrl }),
      });
      if (res.ok) {
        setSaved(true);
        setConfig({ siteName, tagline, logoUrl, faviconUrl });
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (_) {}
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-secondary-100 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <h1 className="font-display text-3xl font-semibold text-dark-100">Branding</h1>
        <p className="font-sans text-sm text-dark-60 mt-1">Update your store logo, favicon, site name, and tagline.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <section className="space-y-6">
          <h2 className="font-sans text-base font-semibold text-dark-100 border-b border-brand-dark pb-2">Identity</h2>

          <div>
            <label className="block font-sans text-sm font-medium text-dark-100 mb-1">
              Site name
            </label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full border border-brand-dark bg-white px-4 py-2.5 font-sans text-sm text-dark-100 focus:outline-none focus:border-secondary-100"
              placeholder="Craftkit"
            />
          </div>

          <div>
            <label className="block font-sans text-sm font-medium text-dark-100 mb-1">
              Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full border border-brand-dark bg-white px-4 py-2.5 font-sans text-sm text-dark-100 focus:outline-none focus:border-secondary-100"
              placeholder="The Art of the Handmade"
            />
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="font-sans text-base font-semibold text-dark-100 border-b border-brand-dark pb-2">Logo</h2>
          <ImageUploader
            label="Store logo"
            hint="Shown in the header, footer, and emails. Recommended: PNG with transparent background, at least 200px wide."
            currentUrl={logoUrl}
            isCustom={hasCustomLogo}
            type="logo"
            onUploaded={(url) => { setLogoUrl(url); setHasCustomLogo(true); }}
            onRemoved={reloadConfig}
          />
        </section>

        <section className="space-y-6">
          <h2 className="font-sans text-base font-semibold text-dark-100 border-b border-brand-dark pb-2">Favicon</h2>
          <ImageUploader
            label="Favicon"
            hint="Shown in browser tabs. Recommended: square PNG or ICO, 32×32 px."
            currentUrl={faviconUrl}
            isCustom={hasCustomFavicon}
            type="favicon"
            onUploaded={(url) => { setFaviconUrl(url); setHasCustomFavicon(true); }}
            onRemoved={reloadConfig}
          />
        </section>

        <div className="flex items-center gap-4 pt-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
          {saved && (
            <span className="font-sans text-sm text-green-700">Saved successfully</span>
          )}
        </div>
      </form>

      {config && (
        <section className="border border-brand-dark p-5 space-y-2 bg-brand-light">
          <h2 className="font-sans text-sm font-semibold text-dark-100">Current live values</h2>
          <dl className="font-sans text-xs text-dark-60 space-y-1">
            <div className="flex gap-2"><dt className="font-medium w-24 shrink-0">Site name:</dt><dd>{config.siteName}</dd></div>
            <div className="flex gap-2"><dt className="font-medium w-24 shrink-0">Tagline:</dt><dd>{config.tagline}</dd></div>
            <div className="flex gap-2"><dt className="font-medium w-24 shrink-0">Logo:</dt><dd className="break-all">{config.logoUrl}</dd></div>
            <div className="flex gap-2"><dt className="font-medium w-24 shrink-0">Favicon:</dt><dd className="break-all">{config.faviconUrl}</dd></div>
          </dl>
        </section>
      )}
    </div>
  );
}
