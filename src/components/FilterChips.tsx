"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface FilterChipsProps {
  options: { id: string; name: string; slug?: string }[];
  paramKey?: string;
  className?: string;
}

export default function FilterChips({
  options,
  paramKey = "category",
  className = "",
}: FilterChipsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get(paramKey) ?? "all";

  function setFilter(value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value === "all") next.delete(paramKey);
    else next.set(paramKey, value);
    router.push(`?${next.toString()}`);
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => setFilter("all")}
        className={`rounded-full border px-4 py-2 font-sans text-sm tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-secondary-60 ${
          current === "all"
            ? "border-dark-100 bg-dark-100 text-white"
            : "border-brand-dark bg-bg text-body-muted hover:border-dark-40 hover:text-dark-100"
        }`}
      >
        All
      </button>
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => setFilter(opt.slug ?? opt.id)}
          className={`rounded-full border px-4 py-2 font-sans text-sm tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-secondary-60 ${
            current === (opt.slug ?? opt.id)
              ? "border-dark-100 bg-dark-100 text-white"
              : "border-brand-dark bg-bg text-body-muted hover:border-dark-40 hover:text-dark-100"
          }`}
        >
          {opt.name}
        </button>
      ))}
    </div>
  );
}
