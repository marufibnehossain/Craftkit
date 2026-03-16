"use client";

import { useState } from "react";

export default function NewsletterBar() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("done");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="bg-brand-mid border-y border-brand-dark py-6 md:py-8">
      <div className="mx-auto max-w-[1440px] px-6 md:px-20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <p className="font-sans text-base md:text-lg font-medium text-dark-100 tracking-wider">
            Subscribe to get 10% off your first order
          </p>
          <form
            onSubmit={handleSubmit}
            className="flex flex-1 md:max-w-md gap-0 rounded-full overflow-hidden bg-white border border-brand-dark shadow-sm"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 min-w-0 px-4 py-3 font-sans text-sm text-dark-100 placeholder:text-body-muted tracking-wider focus:outline-none"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="px-5 py-3 bg-secondary-100 text-white font-sans font-medium text-sm tracking-wider hover:bg-secondary-60 transition-colors disabled:opacity-70"
              aria-label="Subscribe"
            >
              {status === "loading" ? "…" : status === "done" ? "✓" : status === "error" ? "!" : "→"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
