"use client";

import { useState, useEffect } from "react";
import * as Slider from "@radix-ui/react-slider";
import { useRouter, useSearchParams } from "next/navigation";
import { useCurrencyHydrated } from "@/lib/use-currency-hydrated";
import type { CategoryWithChildren } from "@/lib/products";

interface SidebarFiltersProps {
  categoryTree: CategoryWithChildren[];
  priceRange: { min: number; max: number };
  onApply?: () => void;
}

function containsSlug(node: CategoryWithChildren, slug: string): boolean {
  if (node.slug === slug) return true;
  return node.children.some((c) => containsSlug(c, slug));
}

function CategoryItem({
  category,
  currentCategory,
  setCategory,
}: {
  category: CategoryWithChildren;
  currentCategory: string;
  setCategory: (value: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = category.children.length > 0;
  const value = category.slug;
  const active = currentCategory === value;
  const isParentOfActive = hasChildren && containsSlug(category, currentCategory);

  useEffect(() => {
    if (active || isParentOfActive) setExpanded(true);
  }, [active, isParentOfActive]);

  return (
    <li>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setCategory(value)}
          className="shrink-0 w-4 h-4 flex items-center justify-center"
          aria-label={`Select ${category.name}`}
        >
          {active ? (
            <span className="w-4 h-4 bg-[#862830] border border-[#862830] flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          ) : (
            <span className="w-4 h-4 border border-[#e0d6c9]" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setCategory(value)}
          className={`flex-1 text-left font-sans text-sm tracking-[0.28px] leading-[1.6] transition-colors ${
            active ? "text-[#1b1718]" : "text-[#5f5d5d] hover:text-[#1b1718]"
          }`}
        >
          {category.name}
        </button>
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="p-0.5 text-[#5f5d5d] hover:text-[#1b1718] shrink-0"
            aria-expanded={expanded}
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`transition-transform ${expanded ? "rotate-90" : ""}`}
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        ) : null}
      </div>
      {hasChildren && expanded && (
        <ul className="ml-7 mt-2 space-y-2">
          {category.children.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              currentCategory={currentCategory}
              setCategory={setCategory}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function SidebarFilters({ categoryTree, priceRange, onApply }: SidebarFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formatPriceCompact } = useCurrencyHydrated();
  const currentCategory = searchParams.get("category") ?? "";
  const minFromQuery = searchParams.get("minPrice");
  const maxFromQuery = searchParams.get("maxPrice");

  const absoluteMin = Math.floor(priceRange.min);
  const absoluteMax = Math.ceil(priceRange.max);

  const currentMin =
    minFromQuery !== null && !Number.isNaN(Number(minFromQuery))
      ? Math.max(absoluteMin, Math.min(Number(minFromQuery), absoluteMax))
      : absoluteMin;
  const currentMax =
    maxFromQuery !== null && !Number.isNaN(Number(maxFromQuery))
      ? Math.min(absoluteMax, Math.max(Number(maxFromQuery), absoluteMin))
      : absoluteMax;

  const [priceValue, setPriceValue] = useState<[number, number]>([currentMin, currentMax]);

  useEffect(() => {
    setPriceValue([currentMin, currentMax]);
  }, [currentMin, currentMax]);

  function setCategory(value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value === currentCategory) next.delete("category");
    else next.set("category", value);
    next.delete("page");
    router.push(`/products?${next.toString()}`, { scroll: false });
    onApply?.();
  }

  function setPriceRange(min: number, max: number) {
    const next = new URLSearchParams(searchParams.toString());
    const clampedMin = Math.max(absoluteMin, Math.min(min, max));
    const clampedMax = Math.min(absoluteMax, Math.max(max, clampedMin));

    if (clampedMin <= absoluteMin) {
      next.delete("minPrice");
    } else {
      next.set("minPrice", String(clampedMin));
    }

    if (clampedMax >= absoluteMax) {
      next.delete("maxPrice");
    } else {
      next.set("maxPrice", String(clampedMax));
    }

    next.delete("page");
    router.push(`/products?${next.toString()}`, { scroll: false });
    onApply?.();
  }

  function clearFilters() {
    const next = new URLSearchParams();
    const sort = searchParams.get("sort");
    if (sort) next.set("sort", sort);
    router.push(`/products${next.toString() ? `?${next.toString()}` : ""}`, { scroll: false });
    onApply?.();
  }

  const hasActiveFilters = currentCategory || minFromQuery || maxFromQuery;

  return (
    <aside>
      <div className="flex items-baseline justify-between mb-0 min-h-[40px]">
        <h2 className="font-sans text-lg font-medium text-[#1b1718] leading-[40px]">Filter By</h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="font-sans text-sm text-[#5f5d5d] hover:text-[#1b1718] transition-colors leading-[40px]"
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="border-t border-[#e0d6c9] pt-4 pb-4 mt-4">
        <h3 className="font-sans text-sm font-semibold text-[#1b1718] leading-[1.6] mb-4">Category</h3>
        <ul className="space-y-3">
          {categoryTree.map((cat) => (
            <CategoryItem
              key={cat.id}
              category={cat}
              currentCategory={currentCategory}
              setCategory={setCategory}
            />
          ))}
        </ul>
      </div>

      <div className="border-t border-[#e0d6c9] pt-4 pb-4">
        <h3 className="font-sans text-sm font-semibold text-[#1b1718] leading-[1.6] mb-4">Price Range</h3>
        <Slider.Root
          className="relative flex items-center w-full h-6"
          min={absoluteMin}
          max={absoluteMax}
          step={1}
          value={priceValue}
          onValueChange={(val) => {
            if (!Array.isArray(val) || val.length !== 2) return;
            setPriceValue([val[0], val[1]]);
          }}
          onValueCommit={(val) => {
            if (!Array.isArray(val) || val.length !== 2) return;
            setPriceRange(val[0], val[1]);
          }}
          aria-label="Price range"
        >
          <Slider.Track className="relative h-[3px] w-full bg-[#e0d6c9]">
            <Slider.Range className="absolute h-[3px] bg-[#862830]" />
          </Slider.Track>
          <Slider.Thumb className="block w-4 h-4 rounded-full border-2 border-[#862830] bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#862830]/20" />
          <Slider.Thumb className="block w-4 h-4 rounded-full border-2 border-[#862830] bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#862830]/20" />
        </Slider.Root>
        <div className="flex items-center justify-between mt-3">
          <span className="font-sans text-sm text-[#5f5d5d] tracking-[0.28px]">
            {formatPriceCompact(priceValue[0])}
          </span>
          <span className="font-sans text-sm text-[#5f5d5d] tracking-[0.28px]">
            {formatPriceCompact(priceValue[1])}
          </span>
        </div>
      </div>
    </aside>
  );
}
