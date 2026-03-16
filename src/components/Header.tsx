"use client";

import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import Logo from "@/components/Logo";
import { useState, useEffect, useRef } from "react";
import { useCartStore } from "@/lib/cart-store";
import { useCartDrawerStore } from "@/lib/cart-drawer-store";
import { useWishlistStore } from "@/lib/wishlist-store";
import { useCurrencyStore, type Currency } from "@/lib/currency-store";
import { useLanguageStore, type Language, languageLabels } from "@/lib/language-store";
import SearchModal from "@/components/SearchModal";

type HeaderVariant = "transparent" | "solid";

interface HeaderProps {
  variant?: HeaderVariant;
}

const mobileNavLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQ" },
  { href: "/sell", label: "Sell With Us" },
];

type CategoryItem = { id: string; name: string; slug: string; parentId: string | null };
type CategoryWithChildren = CategoryItem & { children: CategoryWithChildren[] };

function buildCategoryTree(categories: CategoryItem[]): CategoryWithChildren[] {
  const byParentId = new Map<string, CategoryItem[]>();
  for (const c of categories) {
    if (c.parentId) {
      if (!byParentId.has(c.parentId)) byParentId.set(c.parentId, []);
      byParentId.get(c.parentId)!.push(c);
    }
  }
  function addChildren(item: CategoryItem): CategoryWithChildren {
    const children = (byParentId.get(item.id) ?? []).map(addChildren);
    return { ...item, children };
  }
  const roots = categories.filter((c) => !c.parentId);
  return roots.map(addChildren);
}

const TOP_NAV_LIMIT = 7;

function CartCount() {
  const total = useCartStore((s) => s.getTotalItems());
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || total === 0) return null;
  return (
    <span className="absolute -top-1 -right-2 min-w-[16px] h-[16px] rounded-full bg-secondary-100 text-[#FDFBF8] text-[8px] font-sans flex items-center justify-center px-1">
      {total > 99 ? "99+" : total}
    </span>
  );
}

function WishlistCount() {
  const count = useWishlistStore((s) => s.items.length);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || count === 0) return null;
  return (
    <span className="absolute -top-1 -right-2 min-w-[16px] h-[16px] rounded-full bg-secondary-100 text-[#FDFBF8] text-[8px] font-sans flex items-center justify-center px-1">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function MobileCategoryLinks({ onClose }: { onClose: () => void }) {
  const [categories, setCategories] = useState<CategoryWithChildren[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data: CategoryItem[]) => setCategories(buildCategoryTree(data)))
      .catch(() => setCategories([]));
  }, []);

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (categories.length === 0) return null;

  const renderCategory = (item: CategoryWithChildren, depth: number) => {
    const paddingLeft = depth === 0 ? 0 : 16 + (depth - 1) * 12;
    const hasChildren = item.children.length > 0;
    const isExpanded = expandedIds.has(item.id);

    return (
      <div key={item.id} className={depth === 0 ? "mb-1" : ""}>
        <div
          className="flex items-center justify-between py-2 font-sans text-sm text-dark-100 tracking-wider"
          style={paddingLeft > 0 ? { paddingLeft: `${paddingLeft}px` } : undefined}
        >
          <Link
            href={`/products?category=${item.slug}`}
            className="flex-1 min-w-0 hover:text-secondary-100 -ml-2 -my-2 py-2 pl-2 pr-1 transition-colors"
            onClick={onClose}
          >
            {item.name}
          </Link>
          {hasChildren && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                toggleExpanded(item.id);
              }}
              className="shrink-0 p-2 -m-2 text-dark-80 hover:text-dark-100 rounded transition-colors"
              aria-expanded={isExpanded}
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div>{item.children.map((child) => renderCategory(child, depth + 1))}</div>
        )}
      </div>
    );
  };

  return (
    <div className="border-t border-brand-dark pt-4 mt-4">
      <p className="font-sans text-xs font-medium uppercase tracking-widest text-body-muted mb-2">Categories</p>
      <div className="space-y-0">{categories.map((parent) => renderCategory(parent, 0))}</div>
    </div>
  );
}

function FlattenedCategoryList({
  children: items,
  onClose,
  depth = 0,
}: {
  children: CategoryWithChildren[];
  onClose: () => void;
  depth?: number;
}) {
  const paddingLeft = 16 + depth * 12;
  return (
    <>
      {items.map((child) => {
        const childHasChildren = child.children.length > 0;
        return (
          <div key={child.id}>
            <Link
              href={`/products?category=${child.slug}`}
              className="block py-2 font-sans text-sm text-dark-100 hover:bg-brand-mid tracking-wider transition-colors"
              style={{ paddingLeft: `${paddingLeft}px` }}
              onClick={onClose}
            >
              {child.name}
            </Link>
            {childHasChildren && (
              <FlattenedCategoryList children={child.children} onClose={onClose} depth={depth + 1} />
            )}
          </div>
        );
      })}
    </>
  );
}

function NestedCategoryMenu({
  item,
  onClose,
  ChevronDown,
}: {
  item: CategoryWithChildren;
  onClose: () => void;
  ChevronDown: React.ReactNode;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const showSubmenu = hoveredId === "sub" || item.children.some((c) => c.id === hoveredId);

  return (
    <div className="relative" onMouseLeave={() => setHoveredId(null)}>
      <Link
        href={`/products?category=${item.slug}`}
        className="flex items-center justify-between px-4 py-2 font-sans text-sm text-dark-100 hover:bg-brand-mid tracking-wider transition-colors"
        onMouseEnter={() => setHoveredId("sub")}
        onClick={onClose}
      >
        {item.name}
        <span className="shrink-0">{ChevronDown}</span>
      </Link>
      {showSubmenu && (
        <div
          className="absolute left-full top-0 ml-0 min-w-[180px] max-h-[70vh] overflow-y-auto rounded-lg border border-brand-dark bg-surface shadow-lg z-50 py-1"
          onMouseEnter={() => setHoveredId("sub")}
        >
          <FlattenedCategoryList children={item.children} onClose={onClose} />
        </div>
      )}
    </div>
  );
}

function NavWithCategories() {
  const [categories, setCategories] = useState<CategoryWithChildren[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data: CategoryItem[]) => setCategories(buildCategoryTree(data)))
      .catch(() => setCategories([]));
  }, []);

  const ChevronDown = (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const roots = categories.filter((c) => !c.parentId);
  const topNav = roots.slice(0, TOP_NAV_LIMIT);
  const moreNav = roots.slice(TOP_NAV_LIMIT);

  const staticLinks = [
    { href: "/", label: "Home" },
  ];

  const renderTopItem = (item: CategoryWithChildren) => {
    const hasChildren = item.children.length > 0;
    const isOpen = openDropdown === item.id;
    return (
      <div
        key={item.id}
        className="relative"
        onMouseEnter={hasChildren ? () => setOpenDropdown(item.id) : undefined}
        onMouseLeave={hasChildren ? () => setOpenDropdown(null) : undefined}
      >
        {hasChildren ? (
          <>
            <Link
              href={`/products?category=${item.slug}`}
              className="font-sans text-base py-0.5 inline-flex items-center gap-1 text-dark-100 hover:text-secondary-100 tracking-wider transition-colors"
              aria-expanded={isOpen}
              aria-haspopup="true"
            >
              {item.name}
              <span className={`transition-transform ${isOpen ? "rotate-180" : ""}`}>{ChevronDown}</span>
            </Link>
            {isOpen && (
              <div className="absolute left-0 top-full min-w-[180px] max-h-[70vh] overflow-y-auto rounded-lg border border-brand-dark bg-surface shadow-lg z-50 py-1">
                <FlattenedCategoryList children={item.children} onClose={() => setOpenDropdown(null)} />
              </div>
            )}
          </>
        ) : (
          <Link href={`/products?category=${item.slug}`} className="font-sans text-base text-dark-100 hover:text-secondary-100 tracking-wider transition-colors">
            {item.name}
          </Link>
        )}
      </div>
    );
  };

  return (
    <nav
      className="hidden lg:flex items-center gap-8"
      aria-label="Main navigation"
    >
      {staticLinks.map((link) => (
        <Link key={link.href} href={link.href} className="font-sans text-base text-dark-100 hover:text-secondary-100 tracking-wider transition-colors">
          {link.label}
        </Link>
      ))}
      {topNav.map(renderTopItem)}
      {moreNav.length > 0 && (
        <div
          className="relative"
          onMouseEnter={() => setOpenDropdown("more")}
          onMouseLeave={() => setOpenDropdown(null)}
        >
          <button
            type="button"
            className="font-sans text-base py-0.5 inline-flex items-center gap-1 text-dark-100 hover:text-secondary-100 tracking-wider transition-colors"
            aria-expanded={openDropdown === "more"}
            aria-haspopup="true"
          >
            More
            <span className={`transition-transform ${openDropdown === "more" ? "rotate-180" : ""}`}>{ChevronDown}</span>
          </button>
          {openDropdown === "more" && (
            <div className="absolute left-0 top-full min-w-[200px] rounded-lg border border-brand-dark bg-surface shadow-lg z-50 py-1">
              {moreNav.map((item) => {
                const hasChildren = item.children.length > 0;
                return (
                  <div key={item.id} className="relative">
                    {hasChildren ? (
                      <NestedCategoryMenu
                        item={item}
                        onClose={() => setOpenDropdown(null)}
                        ChevronDown={ChevronDown}
                      />
                    ) : (
                      <Link
                        href={`/products?category=${item.slug}`}
                        className="block px-4 py-2 font-sans text-sm text-dark-100 hover:bg-brand-mid tracking-wider transition-colors"
                      >
                        {item.name}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

export default function Header({ variant = "solid" }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { currency, setCurrency } = useCurrencyStore();
  const { language, setLanguage, t } = useLanguageStore();
  const [mounted, setMounted] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const currencyRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) setCurrencyOpen(false);
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currencies = [
    { value: "EUR" as Currency, label: "€ EUR" },
    { value: "USD" as Currency, label: "$ USD" },
  ];
  const languages = (Object.keys(languageLabels) as Language[]).map((key) => ({
    value: key,
    label: languageLabels[key],
  }));

  const currentCurrencyLabel = mounted
    ? (currencies.find((c) => c.value === currency)?.label ?? "€ EUR")
    : "€ EUR";
  const currentLangLabel = languageLabels[language];

  return (
    <header className={variant === "transparent" ? "absolute top-0 left-0 right-0 z-50" : "sticky top-0 z-40"}>
      <div className="bg-secondary-60 text-secondary-light">
        <div className="mx-auto max-w-[1440px] px-6 md:px-20 py-2 flex items-center justify-between">
          <p className="font-sans text-sm font-light tracking-wider">
            {t("banner.free_shipping")}
          </p>
          <div className="hidden md:flex items-center gap-3">
            <div className="relative" ref={currencyRef}>
              <button
                onClick={() => { setCurrencyOpen(!currencyOpen); setLangOpen(false); }}
                className="flex items-center gap-1.5 font-sans text-sm font-light tracking-wider text-secondary-light hover:text-white transition-colors"
              >
                {currentCurrencyLabel}
                <svg width="8" height="5" viewBox="0 0 8 5" fill="none" className={`transition-transform ${currencyOpen ? "rotate-180" : ""}`}>
                  <path d="M1 1l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {currencyOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white shadow-lg border border-gray-100 py-1 min-w-[100px] z-50">
                  {currencies.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => { setCurrency(c.value); setCurrencyOpen(false); }}
                      className={`w-full text-left px-4 py-2 font-sans text-sm tracking-wider transition-colors ${currency === c.value ? "text-secondary-100 bg-secondary-light/20" : "text-dark-100 hover:bg-brand-light"}`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="w-px h-3 bg-secondary-light/30" />
            <div className="relative" ref={langRef}>
              <button
                onClick={() => { setLangOpen(!langOpen); setCurrencyOpen(false); }}
                className="flex items-center gap-1.5 font-sans text-sm font-light tracking-wider text-secondary-light hover:text-white transition-colors"
              >
                {currentLangLabel}
                <svg width="8" height="5" viewBox="0 0 8 5" fill="none" className={`transition-transform ${langOpen ? "rotate-180" : ""}`}>
                  <path d="M1 1l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {langOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white shadow-lg border border-gray-100 py-1 min-w-[120px] z-50">
                  {languages.map((l) => (
                    <button
                      key={l.value}
                      onClick={() => { setLanguage(l.value); setLangOpen(false); }}
                      className={`w-full text-left px-4 py-2 font-sans text-sm tracking-wider transition-colors ${language === l.value ? "text-secondary-100 bg-secondary-light/20" : "text-dark-100 hover:bg-brand-light"}`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface">
        <div className="mx-auto max-w-[1440px] px-6 md:px-20 py-3 flex items-center justify-between">
          <Link href="/" className="shrink-0 hover:opacity-90 transition-opacity">
            <Logo width={110} />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-3 bg-brand-mid rounded-full pl-3 pr-24 py-2 w-[310px] text-body-muted hover:bg-brand-dark transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <span className="font-sans text-xs tracking-wider">{t("search.placeholder")}</span>
            </button>

            <div className="flex items-center gap-6">
              <Link href="/account" className="relative text-dark-100 hover:text-secondary-100 transition-colors" aria-label="Account">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" aria-hidden>
                  <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" />
                  <path d="M19 19C19 16.2386 16.7614 14 14 14H10C7.23858 14 5 16.2386 5 19V21H19V19Z" />
                </svg>
              </Link>

              <Link href="/wishlist" className="relative text-dark-100 hover:text-secondary-100 transition-colors" aria-label="Wishlist">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M10.4107 19.4677C7.58942 17.358 2 12.5348 2 8.19444C2 5.32563 4.10526 3 7 3C8.5 3 10 3.5 12 5.5C14 3.5 15.5 3 17 3C19.8947 3 22 5.32563 22 8.19444C22 12.5348 16.4106 17.358 13.5893 19.4677C12.6399 20.1776 11.3601 20.1776 10.4107 19.4677Z" />
                </svg>
                <WishlistCount />
              </Link>

              <button type="button" onClick={() => useCartDrawerStore.getState().openDrawer()} className="relative text-dark-100 hover:text-secondary-100 transition-colors" aria-label="Cart">
                <svg width="24" height="24" viewBox="0 0 17 21" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M2 5.5H15C15.8284 5.5 16.5 6.17157 16.5 7V17.5C16.5 19.1569 15.1569 20.5 13.5 20.5H3.5C1.84315 20.5 0.5 19.1569 0.5 17.5V7C0.5 6.17157 1.17157 5.5 2 5.5Z" />
                  <path d="M12.5 8C12.5 4.13401 10.7091 0.5 8.5 0.5C6.29086 0.5 4.5 4.13401 4.5 8" />
                </svg>
                <CartCount />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 md:hidden">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="p-2 text-dark-100"
              aria-label="Search"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
            <button type="button" onClick={() => useCartDrawerStore.getState().openDrawer()} className="relative p-2 text-dark-100" aria-label="Cart">
              <svg width="20" height="20" viewBox="0 0 17 21" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M2 5.5H15C15.8284 5.5 16.5 6.17157 16.5 7V17.5C16.5 19.1569 15.1569 20.5 13.5 20.5H3.5C1.84315 20.5 0.5 19.1569 0.5 17.5V7C0.5 6.17157 1.17157 5.5 2 5.5Z" />
                <path d="M12.5 8C12.5 4.13401 10.7091 0.5 8.5 0.5C6.29086 0.5 4.5 4.13401 4.5 8" />
              </svg>
              <CartCount />
            </button>
            <button
              type="button"
              className="lg:hidden p-2 text-dark-100"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-label="Open menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-brand-mid hidden lg:block">
        <div className="mx-auto max-w-[1440px] px-6 md:px-20 py-3">
          <NavWithCategories />
        </div>
      </div>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      <div
        className={`fixed inset-0 z-[60] lg:hidden ${menuOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!menuOpen}
      >
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
            menuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMenuOpen(false)}
          aria-hidden
        />
        <aside
          className={`fixed top-0 right-0 bottom-0 w-[min(320px,85vw)] bg-bg shadow-xl z-[61] flex flex-col transition-transform duration-300 ease-out ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          aria-label="Mobile navigation"
        >
          <div className="flex items-center justify-between p-4 border-b border-brand-dark">
            <span className="font-sans text-sm font-medium text-dark-100 tracking-wider">Menu</span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="p-2 text-dark-100 hover:text-dark-80 transition-colors"
              aria-label="Close menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto p-4 space-y-1" aria-label="Mobile navigation">
            {mobileNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-3 font-sans text-sm text-dark-100 hover:text-secondary-100 tracking-wider transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <MobileCategoryLinks onClose={() => setMenuOpen(false)} />
            <div className="border-t border-brand-dark my-4" />
            <Link
              href="/account"
              className="flex items-center gap-3 py-3 font-sans text-sm text-dark-100 hover:text-secondary-100 tracking-wider transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" aria-hidden>
                <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" />
                <path d="M19 19C19 16.2386 16.7614 14 14 14H10C7.23858 14 5 16.2386 5 19V21H19V19Z" />
              </svg>
              Account
            </Link>
            <Link
              href="/wishlist"
              className="flex items-center gap-3 py-3 font-sans text-sm text-dark-100 hover:text-secondary-100 tracking-wider transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M10.4107 19.4677C7.58942 17.358 2 12.5348 2 8.19444C2 5.32563 4.10526 3 7 3C8.5 3 10 3.5 12 5.5C14 3.5 15.5 3 17 3C19.8947 3 22 5.32563 22 8.19444C22 12.5348 16.4106 17.358 13.5893 19.4677C12.6399 20.1776 11.3601 20.1776 10.4107 19.4677Z" />
              </svg>
              Wishlist
            </Link>
          </nav>
        </aside>
      </div>
    </header>
  );
}
