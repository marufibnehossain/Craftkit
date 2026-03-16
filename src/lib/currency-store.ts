import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Currency = "EUR" | "USD";

const EUR_TO_USD = 1.08; // Approximate rate; update as needed

interface CurrencyState {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  /** Convert price (stored in EUR) to selected currency and format */
  formatPrice: (priceEur: number) => string;
  /** Compact format for ranges: "€59.90" or "$64.69" (no currency code) */
  formatPriceCompact: (priceEur: number) => string;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currency: "EUR",
      setCurrency: (c) => set({ currency: c }),
      formatPrice: (priceEur: number) => {
        const { currency } = get();
        const value = currency === "USD" ? priceEur * EUR_TO_USD : priceEur;
        const symbol = currency === "USD" ? "$" : "€";
        return `${symbol}${value.toFixed(2)} ${currency}`;
      },
      formatPriceCompact: (priceEur: number) => {
        const { currency } = get();
        const value = currency === "USD" ? priceEur * EUR_TO_USD : priceEur;
        const symbol = currency === "USD" ? "$" : "€";
        return `${symbol}${value.toFixed(2)}`;
      },
    }),
    { name: "ecommerce-currency" }
  )
);
