"use client";

import { useState } from "react";
import { useReCaptcha, ReCaptchaWidget } from "@/components/ReCaptcha";

type Role = "seller" | "designer" | "";
type Level = "beginner" | "intermediate" | "expert" | "";

interface FormData {
  role: Role;
  level: Level;
  categories: string[];
  platforms: string[];
  displayName: string;
  bio: string;
  email: string;
}

const roles = [
  {
    id: "seller" as Role,
    label: "Seller",
    desc: "List and Sell Your Handmade Creations to a Global Audience",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 7H16C17.8856 7 18.8284 7 19.4142 7.58579C20 8.17157 20 9.11438 20 11V15C20 18.2998 20 19.9497 18.9749 20.9749C17.9497 22 16.2998 22 13 22H11C7.70017 22 6.05025 22 5.02513 20.9749C4 19.9497 4 18.2998 4 15V11C4 9.11438 4 8.17157 4.58579 7.58579C5.17157 7 6.11438 7 8 7Z" />
        <path d="M16 9.5C16 5.63401 14.2091 2 12 2C9.79086 2 8 5.63401 8 9.5" />
      </svg>
    ),
  },
  {
    id: "designer" as Role,
    label: "Designer",
    desc: "Share Patterns, Templates and Creative Designs with Others",
    icon: (
      <img src="/images/icon-designer.svg" alt="" width={23} height={21} className="w-[23px] h-[21px] designer-icon" />
    ),
  },
];

const levels = [
  {
    id: "beginner" as Level,
    label: "Beginner",
    desc: "New and learning, starting my creative journey.",
    icon: (
      <img src="/images/icon-beginner.svg" alt="" width={17} height={21} className="w-[17px] h-[21px]" />
    ),
  },
  {
    id: "intermediate" as Level,
    label: "Intermediate",
    desc: "I have experience and feel comfortable with basics.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    id: "expert" as Level,
    label: "Expert",
    desc: "I'm skilled; crafting comes naturally to me.",
    icon: (
      <img src="/images/icon-expert.svg" alt="" width={24} height={24} className="w-[24px] h-[24px]" />
    ),
  },
];

const categories = [
  {
    id: "knitting",
    label: "Knitting & Crochet",
    desc: "Yarn Based Crafts, Patterns and Fiber Arts.",
    icon: (
      <img src="/images/icon-knitting.svg" alt="" width={23} height={24} className="w-[23px] h-[24px]" />
    ),
  },
  {
    id: "sewing",
    label: "Sewing & Quilting",
    desc: "Fabric Work, Garments, Bags and Wearable Crafts.",
    icon: (
      <img src="/images/icon-sewing.svg" alt="" width={23} height={21} className="w-[23px] h-[21px]" />
    ),
  },
  {
    id: "fashion",
    label: "Fashion & Accessories",
    desc: "Clothing, Jewelry, Bags and Wearable Crafts.",
    icon: (
      <img src="/images/icon-fashion.svg" alt="" width={24} height={24} className="w-[24px] h-[24px]" />
    ),
  },
  {
    id: "other",
    label: "Other Crafts",
    desc: "Woodwork, Ceramics, Candles and More.",
    icon: (
      <img src="/images/icon-other.svg" alt="" width={24} height={24} className="w-[24px] h-[24px]" />
    ),
  },
];

const platforms = [
  {
    id: "instagram",
    label: "Instagram",
    desc: "Share Visuals and Connect with your Community.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    id: "marketplaces",
    label: "Marketplaces",
    desc: "List and Sell Your Handmade Creations to a Global Audience.",
    icon: (
      <img src="/images/icon-marketplaces.svg" alt="" width={24} height={23} className="w-[24px] h-[23px]" />
    ),
  },
  {
    id: "website",
    label: "Personal Website",
    desc: "Your Own Online Storefront or Portfolio.",
    icon: (
      <img src="/images/icon-website.svg" alt="" width={24} height={22} className="w-[24px] h-[22px]" />
    ),
  },
  {
    id: "local",
    label: "Local In-Person",
    desc: "Craft Fairs, Pop-ups and Local Shops.",
    icon: (
      <img src="/images/icon-local.svg" alt="" width={24} height={24} className="w-[24px] h-[24px]" />
    ),
  },
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0">
      <div className="flex items-center">
        {[1, 2, 3].map((step, i) => (
          <div key={step} className="flex items-center">
            {i > 0 && (
              <div className={`w-10 h-px ${step <= current ? "bg-dark-100" : "bg-brand-dark"}`} />
            )}
            <div
              className={`w-10 h-10 flex items-center justify-center font-sans text-sm ${
                step < current
                  ? "bg-dark-100 text-white"
                  : step === current
                  ? "border-2 border-dark-100 text-dark-100"
                  : "border border-brand-dark text-dark-60"
              }`}
            >
              {step < current ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                step
              )}
            </div>
          </div>
        ))}
      </div>
      <span className="ml-5 font-sans text-sm text-dark-80 tracking-wider">
        Step {current} of 3
      </span>
    </div>
  );
}

function SelectionCard({
  selected,
  onClick,
  icon,
  label,
  desc,
  layout = "horizontal",
  multi = false,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  desc: string;
  layout?: "horizontal" | "vertical";
  multi?: boolean;
}) {
  return (
    <button
      type="button"
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      onClick={onClick}
      className={`w-full text-left border p-5 transition-colors bg-[#FBF4EB] relative ${
        selected
          ? "border-[#862830]"
          : "border-brand-dark hover:border-dark-60"
      } ${layout === "vertical" ? "flex flex-col" : "flex items-start gap-4"}`}
    >
      <div className="absolute top-4 right-4">
        <div className={`w-4 h-4 border flex items-center justify-center ${
          selected ? "border-[#862830] bg-[#862830]" : "border-dark-60 bg-transparent"
        }`}>
          {selected && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
      </div>
      <div className={`w-10 h-10 flex items-center justify-center shrink-0 ${
        selected ? "bg-[#862830] text-white" : "bg-[#f3e9db] text-dark-100"
      }`}>
        <span style={selected ? { filter: "brightness(0) invert(1)" } : undefined}>
          {icon}
        </span>
      </div>
      <div className={layout === "vertical" ? "mt-4" : ""}>
        <p className="font-sans text-xs font-medium text-dark-100 tracking-wider uppercase">{label}</p>
        <p className="font-sans text-xs text-dark-60 tracking-wider mt-1 leading-relaxed">{desc}</p>
      </div>
    </button>
  );
}

export default function SellerFormPage() {
  const { isLoaded, isEnabled, siteKey, version, executeRecaptcha } = useReCaptcha();
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>({
    role: "",
    level: "",
    categories: [],
    platforms: [],
    displayName: "",
    bio: "",
    email: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const toggleArray = (key: "categories" | "platforms", value: string) => {
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((v) => v !== value) : [...f[key], value],
    }));
  };

  const canProceed = () => {
    if (step === 1) return form.role !== "" && form.level !== "";
    if (step === 2) return form.categories.length > 0;
    if (step === 3) return form.displayName.trim().length > 0 && form.email.trim().length > 0;
    return false;
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setStatus("sending");
    try {
      const finalToken = version === "v2_checkbox" ? captchaToken : await executeRecaptcha("seller_application");
      const res = await fetch("/api/seller-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: form.role,
          level: form.level,
          categories: form.categories,
          platforms: form.platforms,
          displayName: form.displayName,
          bio: form.bio,
          email: form.email,
          recaptchaToken: finalToken,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("sent");
    } catch {
      setStatus("idle");
      alert("Something went wrong. Please try again.");
    }
  };

  const roleName = roles.find((r) => r.id === form.role)?.label || "";
  const levelName = levels.find((l) => l.id === form.level)?.label || "";
  const categoryNames = form.categories
    .map((c) => categories.find((cat) => cat.id === c)?.label)
    .filter(Boolean)
    .join(", ");

  if (status === "sent") {
    return (
      <div className="bg-bg">
        <div className="max-w-[1440px] mx-auto px-6 md:px-20 py-16 md:py-24">
          <div className="max-w-[842px] mx-auto text-center">
            <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" stroke="#2E7D32" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6 4" />
                <polyline points="22,34 29,41 43,25" stroke="#2E7D32" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
            <h1 className="font-display text-3xl md:text-4xl text-dark-100 mb-4">Application Submitted!</h1>
            <p className="font-sans text-base text-dark-80 tracking-wider max-w-md mx-auto mb-8">
              Thank you for your interest in selling with us. Our team will review your application and get back to you within 3–5 business days.
            </p>
            <button
              type="button"
              onClick={() => {
                setStatus("idle");
                setStep(1);
                setForm({ role: "", level: "", categories: [], platforms: [], displayName: "", bio: "", email: "" });
              }}
              className="inline-flex items-center justify-center gap-2 bg-dark-100 text-white px-10 h-14 font-sans text-lg tracking-wider hover:bg-dark-80 transition-colors"
            >
              Submit another <span aria-hidden>→</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg min-h-screen">
      <div className="max-w-[1440px] mx-auto px-6 md:px-20 py-16 md:py-24">
        <div className="max-w-[842px] mx-auto">

          <StepIndicator current={step} />

          <div className="mt-12">
            {step === 1 && (
              <>
                <div className="mb-10">
                  <h1 className="font-display text-3xl md:text-[40px] text-dark-100 leading-tight">Tell Us About You</h1>
                  <p className="font-sans text-base text-dark-80 tracking-wider mt-4">
                    Help us personalize your experience, choose your role and skill level.
                  </p>
                </div>

                <div className="space-y-12">
                  <fieldset>
                    <legend className="font-sans text-lg font-medium text-dark-100 mb-5">Your Role</legend>
                    <div className="grid sm:grid-cols-2 gap-4" role="radiogroup" aria-label="Your Role">
                      {roles.map((r) => (
                        <SelectionCard
                          key={r.id}
                          selected={form.role === r.id}
                          onClick={() => setForm((f) => ({ ...f, role: r.id }))}
                          icon={r.icon}
                          label={r.label}
                          desc={r.desc}
                        />
                      ))}
                    </div>
                  </fieldset>

                  <fieldset>
                    <legend className="font-sans text-lg font-medium text-dark-100 mb-5">Experience Level</legend>
                    <div className="grid sm:grid-cols-3 gap-4" role="radiogroup" aria-label="Experience Level">
                      {levels.map((l) => (
                        <SelectionCard
                          key={l.id}
                          selected={form.level === l.id}
                          onClick={() => setForm((f) => ({ ...f, level: l.id }))}
                          icon={l.icon}
                          label={l.label}
                          desc={l.desc}
                          layout="vertical"
                        />
                      ))}
                    </div>
                  </fieldset>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="mb-10">
                  <h1 className="font-display text-3xl md:text-[40px] text-dark-100 leading-tight">Your Craft World</h1>
                  <p className="font-sans text-base text-dark-80 tracking-wider mt-4">
                    Select the categories that match your craft. Pick as many as you like!
                  </p>
                </div>

                <div className="space-y-12">
                  <fieldset>
                    <legend className="font-sans text-lg font-medium text-dark-100 mb-5">Craft Categories</legend>
                    <div className="grid sm:grid-cols-2 gap-4" role="group" aria-label="Craft Categories">
                      {categories.map((c) => (
                        <SelectionCard
                          key={c.id}
                          selected={form.categories.includes(c.id)}
                          onClick={() => toggleArray("categories", c.id)}
                          icon={c.icon}
                          label={c.label}
                          desc={c.desc}
                          multi
                        />
                      ))}
                    </div>
                  </fieldset>

                  <fieldset>
                    <legend className="font-sans text-lg font-medium text-dark-100 mb-5">Where do You Sell or Share</legend>
                    <div className="grid sm:grid-cols-2 gap-4" role="group" aria-label="Where do You Sell or Share">
                      {platforms.map((p) => (
                        <SelectionCard
                          key={p.id}
                          selected={form.platforms.includes(p.id)}
                          onClick={() => toggleArray("platforms", p.id)}
                          icon={p.icon}
                          label={p.label}
                          desc={p.desc}
                          multi
                        />
                      ))}
                    </div>
                  </fieldset>
                </div>
              </>
            )}

            {step === 3 && (
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                <div className="mb-10">
                  <h1 className="font-display text-3xl md:text-[40px] text-dark-100 leading-tight">Almost There!</h1>
                  <p className="font-sans text-base text-dark-80 tracking-wider mt-4">
                    Set up your profile so others can find and connect with you.
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label htmlFor="displayName" className="block font-sans text-sm text-dark-100 tracking-wider mb-2">
                      Display Name *
                    </label>
                    <input
                      id="displayName"
                      type="text"
                      required
                      value={form.displayName}
                      onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                      placeholder="John Doe"
                      className="w-full h-[50px] px-3 border border-brand-dark bg-surface font-sans text-sm text-dark-100 placeholder:text-dark-60 tracking-wider focus:outline-none focus:border-dark-100 transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block font-sans text-sm text-dark-100 tracking-wider mb-2">
                      Email *
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="you@example.com"
                      className="w-full h-[50px] px-3 border border-brand-dark bg-surface font-sans text-sm text-dark-100 placeholder:text-dark-60 tracking-wider focus:outline-none focus:border-dark-100 transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="bio" className="block font-sans text-sm text-dark-100 tracking-wider mb-2">
                      Short Bio (optional)
                    </label>
                    <textarea
                      id="bio"
                      value={form.bio}
                      onChange={(e) => {
                        if (e.target.value.length <= 200) {
                          setForm((f) => ({ ...f, bio: e.target.value }));
                        }
                      }}
                      placeholder="Writing Here..."
                      rows={6}
                      className="w-full px-3 py-3 border border-brand-dark bg-surface font-sans text-sm text-dark-100 placeholder:text-dark-60 tracking-wider focus:outline-none focus:border-dark-100 transition-colors resize-none"
                    />
                    <p className="font-sans text-xs text-dark-60 tracking-wider mt-1">{form.bio.length}/200</p>
                  </div>

                  <div className="border border-brand-dark bg-surface p-4">
                    <p className="font-sans text-sm font-medium text-dark-100 tracking-wider mb-3">Your Summary</p>
                    <div className="space-y-2 font-sans text-sm text-dark-80 tracking-wider">
                      <p>Role: {roleName || "—"}</p>
                      <p>Level: {levelName || "—"}</p>
                      <p>Crafts: {categoryNames || "—"}</p>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>

          <div className="mt-12 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="font-sans text-base text-dark-100 tracking-wider hover:text-dark-80 transition-colors"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {step === 3 && isEnabled && siteKey && (
              <ReCaptchaWidget
                siteKey={siteKey}
                isLoaded={isLoaded}
                version={version}
                onVerify={(t) => setCaptchaToken(t)}
                onExpired={() => setCaptchaToken(null)}
              />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!canProceed()}
                className="h-14 px-10 inline-flex items-center justify-center gap-2 bg-dark-100 text-white font-sans text-base tracking-wider hover:bg-dark-80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next <span aria-hidden>→</span>
              </button>
            ) : (
              <button
                type="submit"
                form={undefined}
                onClick={handleSubmit}
                disabled={!canProceed() || status === "sending" || (isEnabled && version === "v2_checkbox" && !captchaToken)}
                className="h-14 px-10 inline-flex items-center justify-center gap-2 bg-dark-100 text-white font-sans text-base tracking-wider hover:bg-dark-80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {status === "sending" ? "Submitting..." : "Submit"} {status !== "sending" && <span aria-hidden>→</span>}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
