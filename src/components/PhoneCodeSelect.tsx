"use client";

import { useState, useRef, useEffect } from "react";
import { PHONE_CODES } from "@/lib/phone-codes";

interface PhoneCodeSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export default function PhoneCodeSelect({ value, onChange }: PhoneCodeSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = PHONE_CODES.find((pc) => pc.code === value);

  const filtered = search.trim()
    ? PHONE_CODES.filter(
        (pc) =>
          pc.code.includes(search.trim()) ||
          pc.country.toLowerCase().includes(search.trim().toLowerCase())
      )
    : PHONE_CODES;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      setTimeout(() => searchRef.current?.focus(), 50);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-3 py-3.5 font-sans text-sm text-dark-100 hover:bg-brand-light transition-colors whitespace-nowrap"
      >
        <span>{selected?.code ?? value}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 w-[200px] bg-white border border-[#e0d6c9] shadow-lg">
          <div className="p-2 border-b border-[#e0d6c9]">
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search code or country"
              className="w-full px-2 py-1.5 font-sans text-sm border border-[#e0d6c9] bg-[#faf6f1] focus:outline-none focus:border-dark-100 placeholder:text-[#a1a1a1]"
            />
          </div>
          <div className="max-h-[200px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 font-sans text-sm text-[#8a8a8a]">No results</div>
            ) : (
              filtered.map((pc) => (
                <button
                  key={pc.code}
                  type="button"
                  onClick={() => {
                    onChange(pc.code);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`w-full text-left px-3 py-2 font-sans text-sm hover:bg-[#f5eae2] transition-colors flex items-center justify-between ${
                    pc.code === value ? "bg-[#f5eae2] font-medium" : "text-dark-100"
                  }`}
                >
                  <span>{pc.code}</span>
                  <span className="text-[#8a8a8a] text-xs">{pc.country}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
