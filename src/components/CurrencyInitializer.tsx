"use client";

import { useEffect, useRef } from "react";
import { useCurrencyStore, type Currency } from "@/lib/currency-store";

const VALID_CURRENCIES: Currency[] = ["EUR", "USD"];

export default function CurrencyInitializer() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const stored = localStorage.getItem("ecommerce-currency");
    if (stored) return;

    fetch("/api/settings/checkout")
      .then((res) => res.json())
      .then((data) => {
        if (data.defaultCurrency && VALID_CURRENCIES.includes(data.defaultCurrency)) {
          useCurrencyStore.getState().setCurrency(data.defaultCurrency);
        }
      })
      .catch(() => {});
  }, []);

  return null;
}
