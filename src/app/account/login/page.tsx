"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Logo from "@/components/Logo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useReCaptcha, ReCaptchaWidget } from "@/components/ReCaptcha";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState<string | null>(null);
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const { isLoaded, isEnabled, siteKey, version, executeRecaptcha } = useReCaptcha();
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    setVerified(sp.get("verified"));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const finalToken = version === "v2_checkbox" ? captchaToken : await executeRecaptcha("login");
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        recaptchaToken: finalToken ?? "",
        redirect: false,
      });
      if (result?.error === "RECAPTCHA_FAILED") {
        setError("reCAPTCHA verification failed. Please try again.");
        setLoading(false);
        return;
      }
      if (result?.error === "EMAIL_NOT_VERIFIED") {
        setError("Please verify your email before signing in. Check your inbox for the verification link.");
        setLoading(false);
        return;
      }
      if (result?.error || !result?.ok) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }
      router.push("/account");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="h-screen bg-bg flex overflow-hidden">
      <div className="flex-1 basis-1/2 flex flex-col px-6 sm:px-12 lg:pl-[80px] lg:pr-[60px] xl:px-[120px] py-8 lg:py-10 overflow-y-auto">
        <Link href="/" className="shrink-0 mb-8 lg:mb-10">
          <Logo width={140} />
        </Link>

        <div className="flex-1 flex flex-col justify-center w-full">
          {verified === "1" && (
            <div className="mb-6 bg-brand-light border border-brand-dark px-4 py-3">
              <p className="font-sans text-sm text-dark-100">
                Your email is verified. You can sign in below.
              </p>
            </div>
          )}

          <h1 className="font-sans text-[32px] font-medium text-[#111] leading-[1.4]">
            Login
          </h1>
          <p className="mt-2.5 font-sans text-base text-[#6d6d6d] tracking-wider leading-relaxed">
            Log in with your email and password
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="bg-secondary-light border border-secondary-40 px-4 py-3">
                <p className="font-sans text-sm text-secondary-100">{error}</p>
              </div>
            )}

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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-[#bebebe] bg-transparent px-4 py-3 font-sans text-sm text-dark-100 placeholder:text-[#a1a1a1] tracking-wider focus:outline-none focus:border-dark-100 transition-colors"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={keepSignedIn}
                  onChange={(e) => setKeepSignedIn(e.target.checked)}
                  className="w-4 h-4 border-[#bebebe] text-dark-100 focus:ring-dark-100"
                />
                <span className="font-sans text-sm text-[#111] tracking-wider">Keep me logged in</span>
              </label>
              <Link
                href="/account/forgot-password"
                className="font-sans text-sm text-[#111] tracking-wider hover:text-secondary-100 transition-colors"
              >
                Forgot your password?
              </Link>
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
              {loading ? "Signing in…" : "Login"}
              {!loading && <span aria-hidden>→</span>}
            </button>
          </form>

          <p className="mt-5 font-sans text-sm text-[#111] text-center tracking-wider">
            Don&apos;t have an account?{" "}
            <Link href="/account/register" className="text-secondary-100 hover:text-secondary-60 transition-colors">
              Sign up
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
          src="/images/login-bg.webp"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      </div>
    </div>
  );
}
