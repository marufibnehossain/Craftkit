"use client";

import { useState, useEffect } from "react";
import type { Product, ProductVariation } from "@/lib/data";
import { getStockLabel } from "@/lib/data";
import { useCartStore } from "@/lib/cart-store";
import { useCartDrawerStore } from "@/lib/cart-drawer-store";
import QuantityStepper from "@/components/QuantityStepper";

interface AddToCartButtonProps {
  product: Product;
  selectedVariation?: ProductVariation | null;
  selectedAttributes?: Record<string, string>;
  hideStockLabel?: boolean;
}

const UNLIMITED_STOCK = 999999;

export default function AddToCartButton({ product, selectedVariation, selectedAttributes, hideStockLabel }: AddToCartButtonProps) {
  const hasVariations = (product.attributes?.length ?? 0) > 0 && (product.variations?.length ?? 0) > 0;
  const mustSelectVariation = hasVariations && !selectedVariation;
  const currentPrice = selectedVariation?.price ?? product.price;
  const unlimitedStock = product.trackInventory !== true;
  const variationStock = selectedVariation?.stock ?? 0;
  const isVariationUnlimited = variationStock >= UNLIMITED_STOCK;
  const effectiveUnlimited = unlimitedStock || (hasVariations && isVariationUnlimited);
  const currentStock = effectiveUnlimited ? 999 : (selectedVariation?.stock ?? product.stock);
  const currentImages = selectedVariation?.images ?? product.images;
  const maxQty = effectiveUnlimited ? 999 : Math.max(0, currentStock);
  const [quantity, setQuantity] = useState(() => Math.max(1, Math.min(1, maxQty)));
  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartDrawerStore((s) => s.openDrawer);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (maxQty > 0) {
      setQuantity((q) => Math.max(1, Math.min(q, maxQty)));
    }
  }, [maxQty]);

  function handleAdd() {
    if (mustSelectVariation) return;
    if (!effectiveUnlimited && currentStock <= 0) return;
    const qty = effectiveUnlimited ? quantity : Math.min(quantity, currentStock);
    const variationName = selectedVariation && selectedAttributes
      ? `${product.name} (${Object.values(selectedAttributes).join(", ")})`
      : product.name;
    const image = currentImages[0] ?? product.images[0] ?? "/images/placeholder.svg";
    addItem({
      productId: product.id,
      slug: product.slug,
      name: variationName,
      price: currentPrice,
      image,
      category: product.category,
      variationId: selectedVariation?.id,
      attributes: selectedAttributes,
    }, qty);
    openDrawer();
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  }

  const outOfStock = mustSelectVariation || (!effectiveUnlimited && currentStock <= 0);
  const stockLabel = effectiveUnlimited ? "In stock" : getStockLabel(currentStock);

  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="flex items-center gap-5 w-full">
        {!outOfStock && !mustSelectVariation && (
          <QuantityStepper
            value={quantity}
            onChange={(v) => setQuantity(Math.min(Math.max(1, v), maxQty))}
            min={1}
            max={maxQty}
            className="shrink-0"
          />
        )}
        <button
          type="button"
          onClick={handleAdd}
          disabled={outOfStock}
          className="flex items-center justify-center gap-2 h-14 flex-1 min-w-0 bg-[#1b1718] text-white font-sans text-lg text-center leading-[1.6] hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          {mustSelectVariation
            ? "Please select options"
            : outOfStock
              ? "Out of stock"
              : "Add to Cart"}
        </button>
      </div>
      {!hideStockLabel && (
        <span
          className={`font-sans text-sm tracking-wider ${outOfStock ? "text-secondary-100" : stockLabel === "Low stock" ? "text-amber-600" : "text-body-muted"}`}
        >
          {outOfStock ? "Out of stock" : stockLabel === "Low stock" ? `${currentStock} left` : "In stock"}
        </span>
      )}
    </div>
  );
}
