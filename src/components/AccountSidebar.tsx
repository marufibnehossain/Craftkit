"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useAvatarStore } from "@/lib/avatar-store";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/account",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: "Orders",
    href: "/account/orders",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
  },
  {
    label: "Addresses",
    href: "/account/addresses",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    label: "Account Details",
    href: "/account/settings",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    label: "Wishlist",
    href: "/wishlist",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
  },
];

export default function AccountSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { avatarUrl, profileName } = useAvatarStore();

  const userName = profileName || session?.user?.name || "User";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  function isActive(href: string) {
    if (href === "/account") return pathname === "/account";
    return pathname.startsWith(href);
  }

  return (
    <nav className="w-[289px] shrink-0 flex flex-col">
      <div className="bg-[#FBF4EB] border border-[#e0d6c9] p-[15px]">
        <div className="flex items-center gap-3">
          <div className="size-[48px] bg-secondary-100 text-white flex items-center justify-center font-sans text-lg font-semibold overflow-hidden relative">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="Profile" fill className="object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-sans text-base text-[#5f5d5d] leading-[1.6] tracking-[0.32px]">
              {userName}
            </span>
            <span className="font-sans text-sm text-[#5f5d5d] leading-[1.6] tracking-[0.28px]">
              Account
            </span>
          </div>
        </div>
      </div>

      {NAV_ITEMS.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-[15px] py-[15px] border-b border-l border-r border-[#e0d6c9] font-sans text-base leading-[1.6] tracking-[0.32px] transition-colors ${
              active
                ? "bg-secondary-100 text-white"
                : "bg-[#FBF4EB] text-[#5f5d5d] hover:bg-[#f5eae2]"
            }`}
          >
            <span className={active ? "text-white" : "text-[#5f5d5d]"}>{item.icon}</span>
            {item.label}
          </Link>
        );
      })}

      <button
        type="button"
        onClick={async () => { await signOut({ redirect: false }); window.location.href = "/"; }}
        className="flex items-center gap-3 px-[15px] py-[15px] border-b border-l border-r border-[#e0d6c9] bg-[#FBF4EB] text-[#5f5d5d] hover:bg-[#f5eae2] font-sans text-base leading-[1.6] tracking-[0.32px] transition-colors text-left w-full"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Log Out
      </button>
    </nav>
  );
}
