"use client";

import { useState } from "react";
import Image from "next/image";
import { useReCaptcha, ReCaptchaWidget } from "@/components/ReCaptcha";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const { isLoaded, isEnabled, siteKey, version, executeRecaptcha } = useReCaptcha();
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");
    try {
      const finalToken = version === "v2_checkbox" ? captchaToken : await executeRecaptcha("contact");
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, subject: "Contact Form", marketingConsent, recaptchaToken: finalToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong");
        setStatus("error");
        return;
      }
      setStatus("sent");
      setForm({ name: "", email: "", phone: "", message: "" });
      setMarketingConsent(false);
      setCaptchaToken(null);
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div className="bg-[#f5ede2] min-h-screen">
      <section className="bg-[#f5ede2]">
        <div className="mx-auto max-w-[1440px] px-6 md:px-20 py-16 md:py-[100px]">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-[80px] items-center">
            <div className="w-full lg:w-[515px] shrink-0">
              <div className="flex flex-col gap-11">
                <div className="flex flex-col gap-4">
                  <h1 className="font-sans font-light text-[64px] text-[#1b1718] leading-[1.38]">
                    Get In <span className="font-display font-medium">Touch</span>
                  </h1>
                  <p className="font-sans text-xl text-[#5f5d5d] leading-[1.6]">
                    We&apos;re here to help with orders, products, and everything in between, ensuring your satisfaction always.
                  </p>
                </div>

                <div className="flex flex-col gap-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1b1718" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="font-sans text-xl font-semibold text-[#1b1718] leading-[1.6]">Address</p>
                      <p className="font-sans text-base text-[#5f5d5d] leading-[1.6] tracking-[0.32px]">124 Craft Avenue, Maker City</p>
                    </div>
                  </div>

                  <div className="w-full h-px bg-[#e0d6c9]" />

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1b1718" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="font-sans text-xl font-semibold text-[#1b1718] leading-[1.6]">Email</p>
                      <p className="font-sans text-base text-[#5f5d5d] leading-[1.6] tracking-[0.32px]">hello@craftkit.store</p>
                    </div>
                  </div>

                  <div className="w-full h-px bg-[#e0d6c9]" />

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1b1718" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="font-sans text-xl font-semibold text-[#1b1718] leading-[1.6]">Live Chat</p>
                      <p className="font-sans text-base text-[#5f5d5d] leading-[1.6] tracking-[0.32px]">Chat With Our Stylists In Real Time</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full lg:flex-1 bg-white overflow-hidden relative" style={{ height: 538 }}>
              <Image
                src="/images/contact-hero.webp"
                alt="Craft supplies"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 686px"
                priority
              />
            </div>
          </div>

          <div className="mt-[100px] flex flex-col gap-11 items-center">
            <h2 className="font-sans font-medium text-2xl text-[#1b1718] leading-[1.34] text-center w-full">
              Keep in Touch with Us
            </h2>

            {status === "sent" ? (
              <div className="text-center py-12 w-full">
                <h3 className="font-sans text-2xl font-medium text-[#1b1718] mb-3">Message Sent!</h3>
                <p className="font-sans text-base text-[#5f5d5d] leading-[1.6] mb-6">
                  Thank you for reaching out. We&apos;ll get back to you as soon as possible.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="font-sans text-base font-medium text-[#862830] hover:text-[#6e2028] tracking-wider transition-colors underline underline-offset-4"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="w-full">
                <div className="flex flex-col lg:flex-row gap-8 w-full">
                  <div className="flex flex-col gap-5 w-full lg:w-1/2">
                    <div className="flex flex-col gap-4">
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        className="w-full px-3 py-[13px] bg-[#faf6f1] font-sans text-sm text-[#1b1718] placeholder:text-[#a4a2a3] tracking-[0.28px] focus:outline-none focus:ring-1 focus:ring-[#862830] transition-colors"
                        placeholder="Full Name *"
                      />
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        className="w-full px-3 py-[13px] bg-[#faf6f1] font-sans text-sm text-[#1b1718] placeholder:text-[#a4a2a3] tracking-[0.28px] focus:outline-none focus:ring-1 focus:ring-[#862830] transition-colors"
                        placeholder="Email *"
                      />
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                        className="w-full px-3 py-[13px] bg-[#faf6f1] font-sans text-sm text-[#1b1718] placeholder:text-[#a4a2a3] tracking-[0.28px] focus:outline-none focus:ring-1 focus:ring-[#862830] transition-colors"
                        placeholder="Phone *"
                      />
                    </div>
                    <div className="flex items-start gap-2">
                      <button
                        type="button"
                        onClick={() => setMarketingConsent(!marketingConsent)}
                        className={`w-4 h-4 shrink-0 border mt-0.5 flex items-center justify-center ${
                          marketingConsent
                            ? "bg-[#862830] border-[#862830]"
                            : "bg-transparent border-[#a4a2a3]"
                        }`}
                      >
                        {marketingConsent && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                      <p className="font-sans text-sm text-[#121212] leading-[1.6] tracking-[0.28px]">
                        I would also like to receive marketing information about Maison&apos;s products or services, including updates on new releases and special promotions.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-5 w-full lg:w-1/2">
                    <textarea
                      required
                      rows={7}
                      value={form.message}
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                      className="w-full h-[176px] px-3 py-[14px] bg-[#faf6f1] font-sans text-sm text-[#1b1718] placeholder:text-[#a4a2a3] tracking-[0.28px] focus:outline-none focus:ring-1 focus:ring-[#862830] transition-colors resize-none"
                      placeholder="Write here..."
                    />

                    {status === "error" && (
                      <p className="font-sans text-sm text-red-600 tracking-wider">{errorMsg}</p>
                    )}

                    {isEnabled && siteKey && (
                      <ReCaptchaWidget
                        siteKey={siteKey}
                        isLoaded={isLoaded}
                        version={version}
                        onVerify={(t) => setCaptchaToken(t)}
                        onExpired={() => setCaptchaToken(null)}
                      />
                    )}

                    <button
                      type="submit"
                      disabled={status === "sending" || (isEnabled && version === "v2_checkbox" && !captchaToken)}
                      className="w-full h-14 bg-[#1b1718] text-white font-sans text-lg leading-[1.6] hover:bg-[#2f2a26] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {status === "sending" ? "Submitting..." : "Submit"}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
