"use client";

import { useState, useMemo } from "react";
import Logo from "@/components/Logo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useReCaptcha, ReCaptchaWidget } from "@/components/ReCaptcha";

function getPasswordStrength(password: string): { level: number; text: string } {
  if (!password) return { level: 0, text: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  return {
    level: score,
    text: "At least 1 number, 8 characters, 1 symbol",
  };
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const { isLoaded, isEnabled, siteKey, version, executeRecaptcha } = useReCaptcha();
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const finalToken = version === "v2_checkbox" ? captchaToken : await executeRecaptcha("signup");
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password, name: name.trim() || undefined, recaptchaToken: finalToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      router.push("/account/verify-email?sent=1");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const strengthColors = ["bg-[#bebebe]", "bg-secondary-100", "bg-[#F8BD00]", "bg-[#319F43]"];

  return (
    <div className="h-screen bg-bg flex overflow-hidden">
      <div className="flex-1 basis-1/2 flex flex-col px-6 sm:px-12 lg:pl-[80px] lg:pr-[60px] xl:px-[120px] py-8 lg:py-10 overflow-y-auto">
        <Link href="/" className="shrink-0 mb-8 lg:mb-10">
          <Logo width={140} />
        </Link>

        <div className="flex-1 flex flex-col justify-center w-full">
          <h1 className="font-sans text-[32px] font-medium text-[#111] leading-[1.4]">
            Sign up
          </h1>
          <p className="mt-2.5 font-sans text-base text-[#6d6d6d] tracking-wider leading-relaxed">
            Let&apos;s create your account and get shopping
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="bg-secondary-light border border-secondary-40 px-4 py-3">
                <p className="font-sans text-sm text-secondary-100">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block font-sans text-xs text-[#111] tracking-wider leading-relaxed mb-1.5">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="User Name"
                className="w-full border border-[#bebebe] bg-transparent px-4 py-3 font-sans text-sm text-dark-100 placeholder:text-[#a1a1a1] tracking-wider focus:outline-none focus:border-dark-100 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="email" className="block font-sans text-xs text-[#111] tracking-wider leading-relaxed mb-1.5">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="User@gmail.com"
                className="w-full border border-[#bebebe] bg-transparent px-4 py-3 font-sans text-sm text-dark-100 placeholder:text-[#a1a1a1] tracking-wider focus:outline-none focus:border-dark-100 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block font-sans text-xs text-[#111] tracking-wider leading-relaxed mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="w-full border border-[#bebebe] bg-transparent px-4 py-3 font-sans text-sm text-dark-100 placeholder:text-[#a1a1a1] tracking-wider focus:outline-none focus:border-dark-100 transition-colors"
              />
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-2">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className={`flex-1 h-1 transition-colors ${
                          i < strength.level ? strengthColors[strength.level] : "bg-[#e0e0e0]"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-2 font-sans text-sm text-[#6d6d6d] tracking-wider">
                    {strength.text}
                  </p>
                </div>
              )}
            </div>

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
              disabled={loading || (isEnabled && version === "v2_checkbox" && !captchaToken)}
              className="w-full h-14 inline-flex items-center justify-center gap-2 bg-dark-100 text-white font-sans text-lg tracking-wider hover:bg-dark-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account…" : "Sign up"}
              {!loading && <span aria-hidden>→</span>}
            </button>
          </form>

          <p className="mt-5 font-sans text-sm text-[#111] text-center tracking-wider">
            Already have an account?{" "}
            <Link href="/account/login" className="text-secondary-100 hover:text-secondary-60 transition-colors">
              Log in
            </Link>
          </p>

          <p className="mt-6 font-sans text-xs text-[#6d6d6d] tracking-wider leading-relaxed">
            By joining you agree to the Craftkit Terms & Conditions and to occasionally receive emails from us. Please read Privacy Policy to learn how we use your personal data.
          </p>
        </div>
      </div>

      <div className="hidden lg:block flex-1 basis-1/2 relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/register-bg.webp"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
