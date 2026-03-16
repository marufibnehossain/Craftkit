"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

function buildPageUrl(searchParams: URLSearchParams, page: number): string {
  const next = new URLSearchParams(searchParams.toString());
  if (page <= 1) {
    next.delete("page");
  } else {
    next.set("page", String(page));
  }
  return `/products?${next.toString()}`;
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const prevUrl = currentPage > 1 ? buildPageUrl(searchParams, currentPage - 1) : null;
  const nextUrl = currentPage < totalPages ? buildPageUrl(searchParams, currentPage + 1) : null;

  const pages: (number | "ellipsis")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    if (currentPage <= 4) {
      for (let i = 1; i <= 4; i++) pages.push(i);
      pages.push("ellipsis");
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1);
      pages.push("ellipsis");
      for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push("ellipsis");
      pages.push(currentPage - 1, currentPage, currentPage + 1);
      pages.push("ellipsis");
      pages.push(totalPages);
    }
  }

  return (
    <nav
      className="flex items-center justify-center gap-2 sm:gap-4 mt-10"
      aria-label="Pagination"
    >
      {prevUrl ? (
        <Link
          href={prevUrl}
          className="inline-flex items-center gap-1.5 font-sans text-sm text-dark-100 tracking-wider hover:text-dark-80 transition-colors"
          aria-label="Previous page"
        >
          <span aria-hidden>&lt;</span>
          Previous
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1.5 font-sans text-sm text-body-muted cursor-not-allowed tracking-wider" aria-hidden>
          <span>&lt;</span>
          Previous
        </span>
      )}

      <div className="flex items-center gap-1 sm:gap-2">
        {pages.map((p, i) =>
          p === "ellipsis" ? (
            <span key={`ellipsis-${i}`} className="font-sans text-sm text-dark-100 px-1 tracking-wider" aria-hidden>
              ...
            </span>
          ) : (
            <Link
              key={p}
              href={buildPageUrl(searchParams, p)}
              className={`min-w-[36px] h-9 flex items-center justify-center font-sans text-sm tracking-wider rounded-full transition-colors ${
                p === currentPage
                  ? "bg-dark-100 text-white"
                  : "text-dark-100 hover:bg-brand-mid"
              }`}
              aria-label={p === currentPage ? `Page ${p}, current` : `Page ${p}`}
              aria-current={p === currentPage ? "page" : undefined}
            >
              {p}
            </Link>
          )
        )}
      </div>

      {nextUrl ? (
        <Link
          href={nextUrl}
          className="inline-flex items-center gap-1.5 font-sans text-sm text-dark-100 tracking-wider hover:text-dark-80 transition-colors"
          aria-label="Next page"
        >
          Next
          <span aria-hidden>&gt;</span>
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1.5 font-sans text-sm text-body-muted cursor-not-allowed tracking-wider" aria-hidden>
          Next
          <span>&gt;</span>
        </span>
      )}
    </nav>
  );
}
