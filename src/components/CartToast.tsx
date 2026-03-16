"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useCartToastStore } from "@/lib/cart-toast-store";
import { useCartDrawerStore } from "@/lib/cart-drawer-store";
import FormatPrice from "./FormatPrice";

export default function CartToast() {
  const { isOpen, item, hideToast } = useCartToastStore();

  useEffect(() => {
    if (!isOpen) return;
    const timeout = setTimeout(() => {
      hideToast();
    }, 3000);
    return () => clearTimeout(timeout);
  }, [isOpen, hideToast]);

  if (!isOpen || !item) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[60] max-w-sm w-full px-4">
      <div className="flex items-center gap-3 rounded-2xl border border-brand-dark bg-bg shadow-lg px-4 py-3">
        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-brand-mid shrink-0">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-sans text-xs text-body-muted uppercase tracking-widest">
            Added to cart
          </p>
          <p className="font-sans text-sm font-medium text-dark-100 truncate tracking-wider">
            {item.name}
          </p>
          <p className="font-sans text-xs text-body-muted tracking-wider">
            <FormatPrice price={item.price} />
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            type="button"
            onClick={hideToast}
            className="font-sans text-xs text-body-muted hover:text-dark-100"
            aria-label="Close"
          >
            ×
          </button>
          <button
            type="button"
            onClick={() => {
              hideToast();
              useCartDrawerStore.getState().openDrawer();
            }}
            className="font-sans text-xs font-medium text-white bg-secondary-100 px-3 py-1.5 rounded-full hover:bg-secondary-60 transition-colors tracking-wider"
          >
            View cart
          </button>
        </div>
      </div>
    </div>
  );
}
