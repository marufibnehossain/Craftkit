"use client";

import { useState } from "react";

type FAQItem = { q: string; a: string };

type FAQCategory = {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  items: FAQItem[];
};

const OrdersIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#862830" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ShippingIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const ReturnsIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </svg>
);

const DownloadsIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const SidebarOrdersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const SidebarShippingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const SidebarReturnsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </svg>
);

const SidebarDownloadsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const categories: FAQCategory[] = [
  {
    id: "orders",
    label: "Orders",
    description: "Everything you need to know about your recent purchases.",
    icon: <OrdersIcon />,
    items: [
      {
        q: "How do I track my order?",
        a: "Once your order has shipped, you will receive an email with a tracking number and a link to track your package. You can also log in to your account and view the tracking information under \"My Orders\".",
      },
      {
        q: "Can I change or cancel my order after placing it?",
        a: "If your order hasn't shipped yet, contact us as soon as possible and we'll do our best to adjust or cancel it. Once an order has been dispatched, changes cannot be made.",
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept major credit and debit cards including Visa, Mastercard, and American Express. We also accept PayPal and Apple Pay.",
      },
      {
        q: "Will I receive an order confirmation?",
        a: "Yes. You'll receive an email confirmation with your order details immediately after checkout.",
      },
      {
        q: "Do you offer gift cards?",
        a: "Yes, we offer digital gift cards in various denominations. They make a perfect gift for the crafters in your life.",
      },
    ],
  },
  {
    id: "shipping",
    label: "Shipping",
    description: "Information about delivery times, costs, and tracking.",
    icon: <ShippingIcon />,
    items: [
      {
        q: "How long does shipping take?",
        a: "Most orders leave our warehouse within 1–2 business days. Delivery times depend on your location and chosen shipping method, typically 3–7 business days.",
      },
      {
        q: "Do you ship internationally?",
        a: "Yes. We ship to many countries worldwide. Shipping costs and delivery times vary by destination.",
      },
      {
        q: "Is free shipping available?",
        a: "Yes! We offer free standard shipping on all orders over $49 within the continental US.",
      },
    ],
  },
  {
    id: "returns",
    label: "Returns",
    description: "Our return and exchange policies explained simply.",
    icon: <ReturnsIcon />,
    items: [
      {
        q: "What is your return policy?",
        a: "You can return most unused items in their original packaging within 30 days of delivery for a full refund. Some items may have specific conditions.",
      },
      {
        q: "How do I start a return?",
        a: "Reach out to our support team with your order number and reason for return. We'll guide you through the process and provide a return shipping label.",
      },
      {
        q: "Do you offer exchanges?",
        a: "Yes, unused items in original packaging can be exchanged within 30 days. Contact our support team to arrange an exchange.",
      },
    ],
  },
  {
    id: "downloads",
    label: "Digital Downloads",
    description: "Help with patterns, PDFs, and other digital products.",
    icon: <DownloadsIcon />,
    items: [
      {
        q: "How do I access my digital downloads?",
        a: "After purchase, you'll receive an email with a download link. You can also access your digital purchases anytime by logging into your account.",
      },
      {
        q: "Can I get a refund on a digital product?",
        a: "Due to the nature of digital products, refunds are handled on a case-by-case basis. Please contact us if you have any issues with your download.",
      },
    ],
  },
];

const sidebarIcons: Record<string, React.ReactNode> = {
  orders: <SidebarOrdersIcon />,
  shipping: <SidebarShippingIcon />,
  returns: <SidebarReturnsIcon />,
  downloads: <SidebarDownloadsIcon />,
};

export default function FAQPageFaq() {
  const [activeTabId, setActiveTabId] = useState(categories[0].id);
  const [openIndices, setOpenIndices] = useState<Set<number>>(new Set([0]));

  const activeCategory = categories.find((c) => c.id === activeTabId) ?? categories[0];

  const toggleItem = (index: number) => {
    setOpenIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const expandAll = () => {
    if (openIndices.size === activeCategory.items.length) {
      setOpenIndices(new Set());
    } else {
      setOpenIndices(new Set(activeCategory.items.map((_, i) => i)));
    }
  };

  const allExpanded = openIndices.size === activeCategory.items.length;

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 w-full">
      <div className="w-full lg:w-[280px] shrink-0">
        <div className="flex flex-col gap-2">
          {categories.map((cat) => {
            const isActive = cat.id === activeTabId;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveTabId(cat.id);
                  setOpenIndices(new Set([0]));
                }}
                className={`flex items-center gap-4 px-5 py-4 text-left font-sans text-base font-medium transition-colors ${
                  isActive
                    ? "bg-[#faf6f1] text-[#862830]"
                    : "text-[#8d8b8b] hover:text-[#1b1718]"
                }`}
              >
                <span className={isActive ? "text-[#862830]" : "text-[#8d8b8b]"}>
                  {sidebarIcons[cat.id]}
                </span>
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 bg-[#faf6f1] p-6 md:p-10">
        <div className="flex items-center justify-between pb-8 border-b border-[#e0d6c9]">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-[#f5eae2] flex items-center justify-center shrink-0">
              {activeCategory.icon}
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="font-sans text-2xl font-semibold text-[#1b1718] leading-[1.34]">
                {activeCategory.label}
              </h2>
              <p className="font-sans text-base text-[#8a7874] tracking-[0.32px] leading-[1.6]">
                {activeCategory.description}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={expandAll}
            className="hidden md:flex items-center gap-1.5 font-sans text-sm text-[#862830] tracking-[0.28px] hover:opacity-80 transition-opacity shrink-0"
          >
            {allExpanded ? "Collapse All" : "Expand All"}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#862830" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col">
          {activeCategory.items.map((item, index) => {
            const isOpen = openIndices.has(index);
            return (
              <div key={item.q} className="border-b border-[#e0d6c9]">
                <button
                  type="button"
                  onClick={() => toggleItem(index)}
                  className="w-full flex items-center justify-between gap-4 py-6 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-sans text-lg font-medium text-[#1b1718] leading-[1.6]">
                    {item.q}
                  </span>
                  <span className="shrink-0">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#1b1718"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="pb-6 pr-10">
                      <p className="font-sans text-base text-[#8a7874] leading-[1.6] tracking-[0.32px]">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
