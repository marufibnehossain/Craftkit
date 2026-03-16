"use client";

import { useState, useEffect } from "react";
import SidebarFilters from "./SidebarFilters";
import type { CategoryWithChildren } from "@/lib/products";

interface FiltersOffCanvasProps {
  categoryTree: CategoryWithChildren[];
  priceRange: { min: number; max: number };
}

export default function FiltersOffCanvas({ categoryTree, priceRange }: FiltersOffCanvasProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="lg:hidden flex items-center gap-2 font-sans text-sm font-medium text-dark-100 tracking-wider hover:opacity-80 transition-opacity"
        aria-label="Open filters"
      >
        <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M0 3H16V1H0V3Z" fill="currentColor" />
          <path d="M2 7H14V5H2V7Z" fill="currentColor" />
          <path d="M4 11H12V9H4V11Z" fill="currentColor" />
          <path d="M10 15H6V13H10V15Z" fill="currentColor" />
        </svg>
        Filters
      </button>

      <div
        className={`fixed inset-0 z-[70] lg:hidden transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setOpen(false)}
          aria-hidden
        />
        <aside
          className={`absolute top-0 left-0 bottom-0 w-[min(320px,85vw)] bg-bg shadow-xl flex flex-col transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-4 py-4 border-b border-brand-dark">
            <h2 className="font-sans text-lg font-medium text-dark-100 tracking-wider">Filters</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-2 text-body-muted hover:text-dark-100 transition-colors"
              aria-label="Close filters"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <SidebarFilters categoryTree={categoryTree} priceRange={priceRange} onApply={() => setOpen(false)} />
          </div>
        </aside>
      </div>
    </>
  );
}
