"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useAvatarStore } from "@/lib/avatar-store";

type DashboardStats = {
  orderCount: number;
  addressCount: number;
  wishlistCount: number;
};

export default function AccountPage() {
  const { data: session } = useSession();
  const { profileName } = useAvatarStore();
  const userName = profileName || session?.user?.name || "User";
  const [stats, setStats] = useState<DashboardStats>({ orderCount: 0, addressCount: 0, wishlistCount: 0 });

  useEffect(() => {
    async function loadStats() {
      try {
        const [ordersRes, addressesRes] = await Promise.all([
          fetch("/api/account/orders"),
          fetch("/api/account/addresses"),
        ]);
        const orders = ordersRes.ok ? await ordersRes.json() : [];
        const addresses = addressesRes.ok ? await addressesRes.json() : [];
        setStats({
          orderCount: Array.isArray(orders) ? orders.length : 0,
          addressCount: Array.isArray(addresses) ? addresses.length : 0,
          wishlistCount: 0,
        });
      } catch (_) {}
    }
    loadStats();
  }, []);

  const cards = [
    {
      href: "/account/orders",
      label: "Orders",
      value: stats.orderCount,
      description: "View order history and track shipments",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
      ),
    },
    {
      href: "/account/addresses",
      label: "Addresses",
      value: stats.addressCount,
      description: "Manage shipping and billing addresses",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
    },
    {
      href: "/account/settings",
      label: "Account Details",
      value: null,
      description: "Update your profile and password",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      href: "/wishlist",
      label: "Wishlist",
      value: null,
      description: "Items you've saved for later",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </svg>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-10">
        <h2 className="font-display text-3xl md:text-4xl text-[#1b1718] mb-3">
          Welcome back, <span className="font-medium">{userName}</span>
        </h2>
        <p className="font-sans text-base text-[#5f5d5d] leading-[1.6] tracking-[0.32px]">
          Manage your orders, addresses, and account preferences from your dashboard.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group border border-[#e0d6c9] bg-[#FBF4EB] p-6 flex gap-5 items-start hover:border-secondary-100 transition-all duration-200"
          >
            <div className="shrink-0 size-[56px] bg-[#F5EDE2] flex items-center justify-center text-[#5f5d5d] group-hover:text-secondary-100 transition-colors">
              {card.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <h3 className="font-sans text-lg font-semibold text-[#1b1718] group-hover:text-secondary-100 transition-colors">
                  {card.label}
                </h3>
                {card.value !== null && (
                  <span className="font-sans text-sm text-[#5f5d5d]">({card.value})</span>
                )}
              </div>
              <p className="font-sans text-sm text-[#5f5d5d] leading-[1.6] tracking-[0.28px] mt-1">
                {card.description}
              </p>
              <span className="inline-flex items-center gap-1 font-sans text-sm text-secondary-100 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                View
                <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
                  <path d="M1 7.5h13M8.5 2l5.5 5.5-5.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
}
