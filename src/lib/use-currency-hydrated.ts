"use client";

import { useEffect, useState } from "react";
import { useCurrencyStore } from "./currency-store";

export function useCurrencyHydrated() {
  const [mounted, setMounted] = useState(false);
  const currency = useCurrencyStore((s) => s.currency);
  const formatPrice = useCurrencyStore((s) => s.formatPrice);
  const formatPriceCompact = useCurrencyStore((s) => s.formatPriceCompact);

  useEffect(() => {
    setMounted(true);
  }, []);

  const safeFormatPrice = (price: number) => {
    if (!mounted) return `€${price.toFixed(2)} EUR`;
    return formatPrice(price);
  };

  const safeFormatPriceCompact = (price: number) => {
    if (!mounted) return `€${price.toFixed(2)}`;
    return formatPriceCompact(price);
  };

  return {
    mounted,
    currency: mounted ? currency : "EUR",
    formatPrice: safeFormatPrice,
    formatPriceCompact: safeFormatPriceCompact,
  };
}
