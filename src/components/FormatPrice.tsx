"use client";

import { useEffect, useState } from "react";
import { useCurrencyStore } from "@/lib/currency-store";

interface FormatPriceProps {
  price: number;
  className?: string;
  compact?: boolean;
}

export default function FormatPrice({ price, className, compact }: FormatPriceProps) {
  const [mounted, setMounted] = useState(false);
  const currency = useCurrencyStore((s) => s.currency);
  const formatPrice = useCurrencyStore((s) => s.formatPrice);
  const formatPriceCompact = useCurrencyStore((s) => s.formatPriceCompact);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatted = compact ? formatPriceCompact(price) : formatPrice(price);

  if (!mounted) {
    const symbol = "€";
    const fallback = compact ? `${symbol}${price.toFixed(2)}` : `${symbol}${price.toFixed(2)} EUR`;
    return <span className={className}>{fallback}</span>;
  }

  return <span className={className}>{formatted}</span>;
}
