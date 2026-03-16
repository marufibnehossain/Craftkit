"use client";

import { useSession } from "next-auth/react";
import { siteConfig } from "@/lib/site-config";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useEffect, type ReactNode } from "react";

const SIDEBAR_SECTIONS = [
  {
    items: [
      { href: "/admin", label: "Dashboard" },
    ],
  },
  {
    label: "Shop",
    items: [
      { href: "/admin/orders", label: "Orders" },
      { href: "/admin/products", label: "Products" },
      { href: "/admin/categories", label: "Categories" },
      { href: "/admin/coupons", label: "Coupons" },
      { href: "/admin/reviews", label: "Reviews" },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/blog-posts", label: "Blog posts" },
      { href: "/admin/blog-categories", label: "Blog categories" },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/admin/users", label: "Users" },
      { href: "/admin/seller-applications", label: "Seller Apps" },
      { href: "/admin/contact", label: "Contact" },
    ],
  },
  {
    label: "Settings",
    items: [
      { href: "/admin/payment", label: "Payment" },
      { href: "/admin/settings/branding", label: "Branding" },
      { href: "/admin/settings/email", label: "Email" },
      { href: "/admin/settings/recaptcha", label: "reCAPTCHA" },
    ],
  },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (status === "loading") return;
    if (isLoginPage) return;
    if (!session) {
      router.replace("/admin/login");
      return;
    }
    const role = (session.user as { role?: string | null })?.role;
    if (role !== "ADMIN") {
      router.replace("/account");
    }
  }, [session, status, pathname, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="font-sans text-muted">Loading…</p>
      </div>
    );
  }

  const role = (session.user as { role?: string | null })?.role;
  if (role !== "ADMIN") {
    return null;
  }

  return (
    <div className="h-screen bg-bg flex overflow-hidden">
      <aside className="w-56 shrink-0 h-screen border-r border-border bg-surface flex flex-col overflow-y-auto">
        <div className="p-4 border-b border-border">
          <Link href="/admin" className="font-sans text-lg font-semibold text-sage-dark uppercase tracking-wide">
            {siteConfig.name} Admin
          </Link>
        </div>
        <nav className="p-2 flex-1 space-y-1" aria-label="Admin navigation">
          {SIDEBAR_SECTIONS.map((section, si) => (
            <div key={si}>
              {section.label && (
                <p className="px-3 pt-4 pb-1 font-sans text-[11px] font-medium text-muted uppercase tracking-widest">
                  {section.label}
                </p>
              )}
              {section.items.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-2 rounded-lg font-sans text-sm transition-colors ${
                    pathname === link.href ? "bg-sage-1 text-sage-dark" : "text-text hover:bg-sage-1/50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="p-2 border-t border-border">
          <Link
            href="/"
            className="block px-3 py-2 font-sans text-sm text-muted hover:text-text"
          >
            View store
          </Link>
          <button
            type="button"
            onClick={async () => { await signOut({ redirect: false }); window.location.href = "/admin/login"; }}
            className="w-full text-left px-3 py-2 font-sans text-sm text-muted hover:text-text"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
