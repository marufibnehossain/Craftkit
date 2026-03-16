"use client";

import { useEffect, useState } from "react";
import Button from "@/components/Button";

type PaymentConfig = {
  liveMerchantName: string;
  liveMerchantPasswordMasked: string;
  liveHasPassword: boolean;
  testMerchantName: string;
  testMerchantPasswordMasked: string;
  testHasPassword: boolean;
  testMode: boolean;
  codEnabled: boolean;
  gatewayCurrency: string;
};

export default function AdminPaymentPage() {
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [liveMerchantName, setLiveMerchantName] = useState("");
  const [liveMerchantPassword, setLiveMerchantPassword] = useState("");
  const [testMerchantName, setTestMerchantName] = useState("");
  const [testMerchantPassword, setTestMerchantPassword] = useState("");
  const [testMode, setTestMode] = useState(true);
  const [codEnabled, setCodEnabled] = useState(true);
  const [gatewayCurrency, setGatewayCurrency] = useState("EUR");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/settings/payment");
        if (res.ok) {
          const data = await res.json();
          setConfig(data);
          setLiveMerchantName(data.liveMerchantName ?? "");
          setLiveMerchantPassword("");
          setTestMerchantName(data.testMerchantName ?? "");
          setTestMerchantPassword("");
          setTestMode(data.testMode ?? true);
          setCodEnabled(data.codEnabled ?? true);
          setGatewayCurrency(data.gatewayCurrency ?? "EUR");
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
      const res = await fetch("/api/admin/settings/payment", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          liveMerchantName: liveMerchantName.trim(),
          liveMerchantPassword: liveMerchantPassword || undefined,
          testMerchantName: testMerchantName.trim(),
          testMerchantPassword: testMerchantPassword || undefined,
          testMode,
          codEnabled,
          gatewayCurrency: gatewayCurrency.trim().toUpperCase(),
        }),
      });
      if (res.ok) {
        setSaved(true);
        setConfig((prev) =>
          prev
            ? {
                ...prev,
                liveHasPassword: liveMerchantPassword ? true : prev.liveHasPassword,
                liveMerchantPasswordMasked: liveMerchantPassword ? "••••••••••••" : prev.liveMerchantPasswordMasked,
                testHasPassword: testMerchantPassword ? true : prev.testHasPassword,
                testMerchantPasswordMasked: testMerchantPassword ? "••••••••••••" : prev.testMerchantPasswordMasked,
              }
            : prev
        );
        const getRes = await fetch("/api/admin/settings/payment");
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
      <h1 className="font-sans text-2xl font-semibold text-text mb-2">Payment</h1>
      <p className="font-sans text-sm text-muted mb-8">
        ccHeroes / ProcessTransact gateway. Configure credentials for credit/debit card payments.
      </p>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
        <div className="border border-border rounded-lg bg-surface p-6 space-y-4">
          <h2 className="font-sans text-lg font-medium text-text">Credentials</h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-sans text-sm font-medium text-text mb-2">Live</h3>
              <div className="space-y-3 pl-0">
                <div>
                  <label htmlFor="live-merchant-name" className="block font-sans text-sm font-medium text-text mb-1.5">
                    Live Merchant Name
                  </label>
                  <input
                    id="live-merchant-name"
                    type="text"
                    value={liveMerchantName}
                    onChange={(e) => setLiveMerchantName(e.target.value)}
                    placeholder="Production merchant name"
                    className="w-full rounded-lg border border-border bg-bg px-3 py-2 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-sage-2"
                  />
                </div>
                <div>
                  <label htmlFor="live-merchant-password" className="block font-sans text-sm font-medium text-text mb-1.5">
                    Live Merchant Password
                  </label>
                  <input
                    id="live-merchant-password"
                    type="password"
                    value={liveMerchantPassword}
                    onChange={(e) => setLiveMerchantPassword(e.target.value)}
                    placeholder={config?.liveHasPassword ? "Leave blank to keep current" : "Production password"}
                    className="w-full rounded-lg border border-border bg-bg px-3 py-2 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-sage-2"
                  />
                  {(config?.liveHasPassword || config?.liveMerchantPasswordMasked) && !liveMerchantPassword && (
                    <p className="mt-1 font-sans text-xs text-muted">
                      ✓ Password saved — {config?.liveMerchantPasswordMasked ?? "••••••••••••"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-sans text-sm font-medium text-text mb-2">Test</h3>
              <div className="space-y-3 pl-0">
                <div>
                  <label htmlFor="test-merchant-name" className="block font-sans text-sm font-medium text-text mb-1.5">
                    Test Merchant Name
                  </label>
                  <input
                    id="test-merchant-name"
                    type="text"
                    value={testMerchantName}
                    onChange={(e) => setTestMerchantName(e.target.value)}
                    placeholder="cchDummy1 (sandbox)"
                    className="w-full rounded-lg border border-border bg-bg px-3 py-2 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-sage-2"
                  />
                </div>
                <div>
                  <label htmlFor="test-merchant-password" className="block font-sans text-sm font-medium text-text mb-1.5">
                    Test Merchant Password
                  </label>
                  <input
                    id="test-merchant-password"
                    type="password"
                    value={testMerchantPassword}
                    onChange={(e) => setTestMerchantPassword(e.target.value)}
                    placeholder={config?.testHasPassword ? "Leave blank to keep current" : "p@s5w0Rd123 (sandbox)"}
                    className="w-full rounded-lg border border-border bg-bg px-3 py-2 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-sage-2"
                  />
                  {(config?.testHasPassword || config?.testMerchantPasswordMasked) && !testMerchantPassword && (
                    <p className="mt-1 font-sans text-xs text-muted">
                      ✓ Password saved — {config?.testMerchantPasswordMasked ?? "••••••••••••"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-border rounded-lg bg-surface p-6 space-y-4">
          <h2 className="font-sans text-lg font-medium text-text">Payment options</h2>

          <div>
            <label htmlFor="gateway-currency" className="block font-sans text-sm font-medium text-text mb-1.5">
              Default currency
            </label>
            <select
              id="gateway-currency"
              value={gatewayCurrency}
              onChange={(e) => setGatewayCurrency(e.target.value)}
              className="w-32 rounded-lg border border-border bg-bg px-3 py-2 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-sage-2"
            >
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
            </select>
            <p className="mt-1 font-sans text-xs text-muted">
              Default store currency for new visitors. Customers can switch currencies using the header dropdown.
            </p>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={codEnabled}
              onChange={(e) => setCodEnabled(e.target.checked)}
              className="rounded border-border text-sage-dark focus:ring-sage-2"
            />
            <span className="font-sans text-sm text-text">Cash on delivery</span>
          </label>
          <p className="font-sans text-xs text-muted">
            When enabled, customers can choose to pay when their order is delivered.
          </p>

          <h3 className="font-sans text-sm font-medium text-text pt-2">Gateway mode</h3>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={testMode}
              onChange={(e) => setTestMode(e.target.checked)}
              className="rounded border-border text-sage-dark focus:ring-sage-2"
            />
            <span className="font-sans text-sm text-text">Test mode (sandbox)</span>
          </label>
          <p className="font-sans text-xs text-muted">
            {testMode
              ? "Using sandbox: https://sandbox.processtransact.com — no real charges."
              : "Using live: https://gw.processtransact.com — real charges."}
          </p>
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
        <h3 className="font-sans text-sm font-medium text-text mb-2">Test card (sandbox only)</h3>
        <ul className="font-sans text-sm text-muted space-y-1">
          <li>Card: 4111111111111111</li>
          <li>Expiry: Any future date (e.g. 12/25)</li>
          <li>CVV: Any 3 digits</li>
          <li>Name: Any name</li>
        </ul>
      </div>
    </div>
  );
}
