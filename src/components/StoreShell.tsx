"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import BreadcrumbBar from "@/components/BreadcrumbBar";
import { BreadcrumbLabelProvider } from "@/components/BreadcrumbContext";

export default function StoreShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const isAdmin = pathname.startsWith("/admin");
  const isAuthPage =
    pathname === "/account/login" ||
    pathname === "/account/register" ||
    pathname === "/account/forgot-password" ||
    pathname === "/account/reset-password" ||
    pathname === "/account/verify-email";

  if (isAdmin || isAuthPage) {
    return <>{children}</>;
  }

  const marketingRoutes = ["/", "/blog"];
  const isMarketing = marketingRoutes.includes(pathname);

  const isEcommerce =
    pathname.startsWith("/products") ||
    pathname.startsWith("/product/") ||
    pathname.startsWith("/cart") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/wishlist");

  const isAccountDashboard = pathname.startsWith("/account");

  const showBreadcrumb =
    isEcommerce || isAccountDashboard || pathname === "/blog" || pathname.startsWith("/blog/") || pathname === "/contact" || pathname === "/faq";

  const headerVariant = "solid";

  return (
    <BreadcrumbLabelProvider>
      <Header variant={headerVariant} />
      {showBreadcrumb && <BreadcrumbBar />}
      <main className={`flex-1 min-w-0 overflow-x-hidden ${isEcommerce ? "bg-bg" : ""}`}>{children}</main>
      <Footer />
      <CartDrawer />
    </BreadcrumbLabelProvider>
  );
}
