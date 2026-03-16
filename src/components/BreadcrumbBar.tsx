"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBreadcrumbLabel } from "@/components/BreadcrumbContext";

const LABELS: Record<string, string> = {
  "/products": "Yarns",
  "/cart": "Cart",
  "/checkout": "Checkout",
  "/checkout/success": "Order complete",
  "/wishlist": "Wishlist",
  "/faq": "FAQs",
  "/blog": "Blog",
  "/about": "About Us",
  "/contact": "Contact Us",
};

export default function BreadcrumbBar() {
  const pathname = usePathname() || "/";
  const breadcrumbLabel = useBreadcrumbLabel();

  const segments: Array<{ label: string; href?: string }> = [];

  if (pathname.startsWith("/blog/") && pathname !== "/blog") {
    segments.push({ label: "Blog", href: "/blog" });
    if (breadcrumbLabel) {
      segments.push({ label: breadcrumbLabel });
    }
  } else if (pathname === "/blog") {
    segments.push({ label: "Our Article" });
  } else if (pathname.startsWith("/product/")) {
    segments.push({ label: "Yarns", href: "/products" });
    segments.push({ label: breadcrumbLabel || "Product details" });
  } else if (pathname === "/products") {
    segments.push({ label: "Yarns" });
  } else if (pathname.startsWith("/account")) {
    const ACCOUNT_LABELS: Record<string, string> = {
      "/account": "My Account",
      "/account/orders": "Orders",
      "/account/addresses": "Addresses",
      "/account/settings": "Account Details",
    };
    if (pathname !== "/account") {
      segments.push({ label: "My Account", href: "/account" });
    }
    if (pathname.startsWith("/account/orders/") && pathname !== "/account/orders") {
      segments.push({ label: "Orders", href: "/account/orders" });
      segments.push({ label: breadcrumbLabel || "Order details" });
    } else {
      const label = ACCOUNT_LABELS[pathname] || "My Account";
      segments.push({ label });
    }
  } else {
    const label = LABELS[pathname] ?? pathname.replace("/", "").replace(/-/g, " ");
    segments.push({ label });
  }

  return (
    <nav className="border-b border-[#e0d6c9] border-t bg-[#f5ede2]" aria-label="Breadcrumb">
      <div className="mx-auto max-w-[1440px] px-6 md:px-20 w-full">
        <div className="flex items-center gap-[10px] h-12 text-base font-sans tracking-[0.32px] flex-wrap">
          <Link
            href="/"
            className="inline-flex items-center gap-[6px] text-[#5f5d5d] hover:text-[#1b1718] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Home</span>
          </Link>
          {segments.map((seg, i) => (
            <span key={i} className="inline-flex items-center gap-[10px]">
              <span className="text-[#5f5d5d]">/</span>
              {seg.href ? (
                <Link href={seg.href} className="text-[#5f5d5d] hover:text-[#1b1718] transition-colors">
                  {seg.label}
                </Link>
              ) : (
                <span className="text-[#1b1718] truncate max-w-[200px] md:max-w-[400px]" title={seg.label}>
                  {seg.label}
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
    </nav>
  );
}
