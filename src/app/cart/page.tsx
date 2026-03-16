"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import { useCurrencyHydrated } from "@/lib/use-currency-hydrated";
import { useLanguageStore } from "@/lib/language-store";
import QuantityStepper from "@/components/QuantityStepper";

export default function CartPage() {
  const { items, updateQuantity, removeItem, getSubtotal } = useCartStore();
  const { formatPriceCompact: formatPrice } = useCurrencyHydrated();
  const { t } = useLanguageStore();
  const subtotal = getSubtotal();
  const freeShippingThreshold = 49;
  const awayFromFree = Math.max(0, freeShippingThreshold - subtotal);
  const shippingProgress = Math.min(1, subtotal / freeShippingThreshold);
  const [promoCode, setPromoCode] = useState("");

  if (items.length === 0) {
    return (
      <div className="bg-bg flex flex-col items-center justify-center px-4 py-32">
        <h1 className="font-display text-3xl md:text-4xl text-dark-100 mb-3">{t("cart.empty")}</h1>
        <p className="font-sans text-sm text-body-muted mb-8 text-center max-w-sm tracking-wider">
          {t("cart.empty_subtitle")}
        </p>
        <Link
          href="/products"
          className="inline-flex items-center justify-center bg-dark-100 text-white px-10 h-14 font-sans text-lg tracking-wider hover:bg-dark-80 transition-colors"
        >
          {t("cart.shop_products")}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-[1440px] mx-auto px-6 md:px-20 py-16 md:py-24">
        <div className="flex flex-col gap-8">
          {/* Free shipping progress bar — hidden until functionality is available
          {awayFromFree > 0 ? (
            <div className="bg-surface flex flex-col gap-3 px-6 py-4 w-full">
              <p className="font-sans text-base font-semibold text-[#1a1a1a] leading-relaxed">
                You&apos;re {formatPrice(awayFromFree)} away from Free Shipping 🎁
              </p>
              <div className="bg-brand-dark h-1.5 w-full overflow-hidden">
                <div
                  className="bg-dark-100 h-full transition-all duration-500"
                  style={{ width: `${shippingProgress * 100}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="bg-surface flex flex-col gap-3 px-6 py-4 w-full">
              <p className="font-sans text-base font-semibold text-[#1a1a1a] leading-relaxed">
                You&apos;ve unlocked Free Shipping! 🎉
              </p>
              <div className="bg-brand-dark h-1.5 w-full overflow-hidden">
                <div className="bg-dark-100 h-full w-full" />
              </div>
            </div>
          )}
          */}

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 flex flex-col gap-8">
              {items.map((item, index) => (
                <div
                  key={`${item.productId}-${item.variationId || index}`}
                  className="bg-surface flex gap-6 p-6"
                >
                  <Link
                    href={`/product/${item.slug}`}
                    className="relative w-[100px] h-[100px] md:w-[140px] md:h-[140px] shrink-0 shadow-[0px_4px_12px_0px_rgba(0,0,0,0.06)]"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="140px"
                    />
                  </Link>

                  <div className="flex flex-col justify-between flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <Link
                          href={`/product/${item.slug}`}
                          className="font-sans text-lg md:text-xl text-[#1a1a1a] hover:text-secondary-100 transition-colors leading-relaxed line-clamp-2"
                        >
                          {item.name}
                        </Link>
                        {item.attributes && Object.entries(item.attributes).map(([key, val]) => (
                          <p key={key} className="font-sans text-sm text-[#8a8a8a] tracking-wider mt-0.5 leading-relaxed">
                            {key}: {val}
                          </p>
                        ))}
                      </div>

                      <span className="shrink-0 font-sans text-base font-semibold text-[#1a1a1a] tracking-wider">
                        {formatPrice(item.price)}
                      </span>
                    </div>

                    <div className="flex items-end justify-between mt-4">
                      <QuantityStepper
                        value={item.quantity}
                        onChange={(q) => updateQuantity(item.productId, q, item.variationId)}
                        className="h-9"
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId, item.variationId)}
                        className="font-sans text-xs text-[#8a8a8a] tracking-wider hover:text-secondary-100 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="w-full lg:w-[475px] shrink-0">
              <div className="bg-surface p-8 lg:sticky lg:top-28">
                <h2 className="font-sans text-xl text-dark-100 leading-relaxed mb-6">
                  Order Summary
                </h2>

                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="font-sans text-sm text-dark-100 tracking-wider">Subtotal</span>
                    <span className="font-sans text-sm text-dark-100 tracking-wider">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-sans text-sm text-dark-100 tracking-wider">Shipping</span>
                    <span className="font-sans text-sm text-dark-100 tracking-wider">Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-sans text-sm text-dark-100 tracking-wider">Discount</span>
                    <span className="font-sans text-sm text-dark-100 tracking-wider">-{formatPrice(0)}</span>
                  </div>

                  <div className="border-t border-brand-dark pt-4 flex justify-between items-center">
                    <span className="font-sans text-lg font-medium text-dark-100">Total</span>
                    <span className="font-sans text-lg font-medium text-dark-100">{formatPrice(subtotal)}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 h-11 px-4 bg-[#faf8f6] border border-brand-dark rounded text-sm font-sans text-dark-100 tracking-wider placeholder:text-dark-100 focus:outline-none focus:border-dark-60"
                  />
                  <button
                    type="button"
                    className="h-11 px-5 bg-[#faf8f6] border border-brand-dark rounded font-sans text-sm text-dark-100 tracking-wider hover:bg-brand-dark transition-colors"
                  >
                    Apply
                  </button>
                </div>

                <div className="flex flex-col gap-3 mt-6">
                  <Link
                    href="/checkout"
                    className="w-full h-14 flex items-center justify-center bg-dark-100 text-white font-sans text-lg tracking-wider hover:bg-dark-80 transition-colors"
                  >
                    Proceed to Checkout
                  </Link>
                </div>

                <div className="mt-6 pt-6 border-t border-brand-dark">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col items-center gap-2">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5f5d5d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      <span className="font-sans text-xs font-semibold text-dark-80 text-center leading-relaxed">
                        Secure<br />Checkout
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5f5d5d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <polyline points="1 4 1 10 7 10" />
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                      </svg>
                      <span className="font-sans text-xs font-semibold text-dark-80 text-center leading-relaxed">
                        Easy<br />Returns
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5f5d5d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <rect x="1" y="3" width="15" height="13" />
                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                        <circle cx="5.5" cy="18.5" r="2.5" />
                        <circle cx="18.5" cy="18.5" r="2.5" />
                      </svg>
                      <span className="font-sans text-xs font-semibold text-dark-80 text-center leading-relaxed">
                        Fast<br />Shipping
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
