"use client";

import { useRouter, useSearchParams } from "next/navigation";

const SORT_OPTIONS = [
  { value: "", label: "Default sorting" },
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Rating" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name A–Z" },
];

export default function ProductsClient({ sort }: { sort?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSortChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = new URLSearchParams(searchParams.toString());
    const v = e.target.value;
    if (v) next.set("sort", v);
    else next.delete("sort");
    next.delete("page");
    router.push(`/products?${next.toString()}`);
  }

  return (
    <div className="flex items-center gap-3">
      <span className="font-sans text-sm text-[#5f5d5d] tracking-[0.28px] hidden md:inline">Sort by:</span>
      <select
        id="sort"
        aria-label="Sort products"
        value={sort ?? ""}
        onChange={handleSortChange}
        className="border border-[#e0d6c9] bg-transparent px-4 py-2.5 font-sans text-sm text-[#1b1718] tracking-[0.28px] focus:outline-none focus:ring-1 focus:ring-[#862830] appearance-none pr-8"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%231B1718' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
