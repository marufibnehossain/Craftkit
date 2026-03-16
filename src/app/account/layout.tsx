"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import AccountSidebar from "@/components/AccountSidebar";

const PUBLIC_PATHS = ["/account/login", "/account/register", "/account/verify-email", "/account/forgot-password", "/account/reset-password"];

function isPublicPath(path: string) {
  return PUBLIC_PATHS.some((p) => path === p || path.startsWith(p + "?"));
}

export default function AccountLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (isPublicPath(pathname)) return;
    if (!session) {
      router.replace("/account/login");
    }
  }, [session, status, pathname, router]);

  if (isPublicPath(pathname)) {
    return <>{children}</>;
  }

  if (status === "loading" || !session) {
    return (
      <div className="bg-bg flex items-center justify-center py-32">
        <p className="font-sans text-muted">Loading…</p>
      </div>
    );
  }

  return (
    <div className="bg-bg">
      <div className="mx-auto max-w-[1440px] px-6 md:px-20 py-10 md:py-14">
        <div className="flex gap-8 items-start">
          <div className="hidden lg:block">
            <AccountSidebar />
          </div>
          <div className="flex-1 min-w-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
