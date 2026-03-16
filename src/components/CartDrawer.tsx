"use client";

import { useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import { useCartDrawerStore } from "@/lib/cart-drawer-store";
import FormatPrice from "./FormatPrice";

export default function CartDrawer() {
  const { isOpen, closeDrawer } = useCartDrawerStore();
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const getTotalItems = useCartStore((s) => s.getTotalItems);
  const drawerRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<Element | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => {
        closeButtonRef.current?.focus();
      });
    } else {
      document.body.style.overflow = "";
      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
        triggerRef.current = null;
      }
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        closeDrawer();
        return;
      }
      if (e.key === "Tab" && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [isOpen, closeDrawer]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80]" aria-hidden={false}>
      <div
        className="absolute inset-0 bg-black/40 animate-[fadeIn_200ms_ease-out]"
        onClick={closeDrawer}
        aria-hidden
      />

      <aside
        ref={drawerRef}
        className="absolute top-0 right-0 bottom-0 w-[min(460px,100vw)] bg-bg flex flex-col animate-[slideInRight_300ms_ease-out]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
      >
        <div className="flex items-center justify-between px-8 py-8">
          <h2 id="cart-drawer-title" className="font-sans text-2xl font-medium text-[#1b1718] leading-[1.34]">
            Shopping cart ({getTotalItems()})
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeDrawer}
            className="flex items-center gap-1 group"
            aria-label="Close cart"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f04438" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            <span className="font-sans text-sm font-medium text-[#f04438]">Close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8d8b8b" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <p className="font-sans text-base text-[#8d8b8b]">Your cart is empty</p>
              <button
                type="button"
                onClick={closeDrawer}
                className="font-sans text-sm text-[#862830] hover:underline"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-8 pb-5">
              {items.map((item, idx) => (
                <div key={`${item.productId}-${item.variationId ?? ""}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex gap-6 items-start">
                      <Link
                        href={`/product/${item.slug}`}
                        className="shrink-0 w-[90px] h-[90px] bg-[#faf6f1] overflow-hidden"
                        onClick={closeDrawer}
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={90}
                          height={90}
                          className="object-cover w-full h-full"
                        />
                      </Link>
                      <div className="flex flex-col gap-2 min-w-0 flex-1">
                        <div className="flex flex-col gap-1">
                          <p className="font-sans text-xs text-[#5f5d5d] tracking-[0.24px] leading-[1.6]">
                            {item.category || "Craftkit"}
                          </p>
                          <Link
                            href={`/product/${item.slug}`}
                            className="font-sans text-base text-[#1b1718] leading-[1.4] block hover:opacity-80 transition-opacity break-words"
                            onClick={closeDrawer}
                          >
                            {item.name}
                          </Link>
                        </div>
                        <div className="flex items-center gap-2 font-sans text-sm text-[#5f5d5d] tracking-[0.28px]">
                          <span>Quantity: {item.quantity}</span>
                          {item.attributes &&
                            Object.entries(item.attributes).map(([key, val]) => (
                              <span key={key} className="flex items-center gap-2">
                                <span>•</span>
                                <span>{key}: {val}</span>
                              </span>
                            ))}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-display text-xl font-medium italic text-[#862830] tracking-[-0.4px]">
                            <FormatPrice price={item.price} compact />
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId, item.variationId)}
                      className="shrink-0 p-1 text-[#8d8b8b] hover:text-[#f04438] transition-colors"
                      aria-label={`Remove ${item.name}`}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </button>
                  </div>
                  {idx < items.length - 1 && (
                    <div className="border-b border-[#e0d6c9] mt-8" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-[#e0d6c9] p-8 flex flex-col gap-4">
            <div className="flex items-center justify-between font-sans text-base font-semibold text-[#1b1718] leading-[1.6]">
              <span>Total</span>
              <span><FormatPrice price={getSubtotal()} compact /></span>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                href="/checkout"
                className="flex items-center justify-center gap-2 h-14 bg-[#1b1718] text-white font-sans text-lg text-center leading-[1.6] hover:opacity-90 transition-opacity"
                onClick={closeDrawer}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Proceed to Checkout
              </Link>
              <Link
                href="/cart"
                className="flex items-center justify-center h-14 border border-[#1b1718] text-[#1b1718] font-sans text-lg text-center leading-[1.6] hover:bg-[#f5eae2] transition-colors"
                onClick={closeDrawer}
              >
                View Shopping Cart
              </Link>
            </div>
            <p className="font-sans text-xs text-[#494546] tracking-[0.24px] leading-[1.6]">
              Secure checkout &bull; SSL encrypted
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
