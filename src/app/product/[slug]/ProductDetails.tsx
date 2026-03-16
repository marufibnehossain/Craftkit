"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import type { Product, ProductVariation } from "@/lib/data";
import RatingStars from "@/components/RatingStars";
import VariationSelector from "./VariationSelector";
import AddToCartButton from "./AddToCartButton";
import FormatPrice from "@/components/FormatPrice";
import { useWishlistStore } from "@/lib/wishlist-store";
import WishlistHeartIcon from "@/components/WishlistHeartIcon";

interface ProductDetailsProps {
  product: Product;
  selectedVariation?: ProductVariation | null;
  selectedAttributes?: Record<string, string>;
  onVariationChange?: (variation: ProductVariation | null, attrs: Record<string, string>) => void;
}

export default function ProductDetails({
  product,
  selectedVariation: externalVariation,
  selectedAttributes: externalAttributes,
  onVariationChange,
}: ProductDetailsProps) {
  const [internalVariation, setInternalVariation] = useState<ProductVariation | null>(null);
  const [internalAttributes, setInternalAttributes] = useState<Record<string, string>>({});

  const selectedVariation = externalVariation ?? internalVariation;
  const selectedAttributes = externalAttributes ?? internalAttributes;
  const { data: session } = useSession();
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product.id));
  const img = product.images[0] ?? "/images/placeholder.svg";

  async function handleWishlist() {
    const item = {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: img,
    };
    const adding = !isInWishlist;
    toggleWishlist(item);
    if (session) {
      try {
        if (adding) {
          await fetch("/api/account/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: product.id }),
          });
        } else {
          await fetch(
            `/api/account/wishlist?productId=${encodeURIComponent(product.id)}`,
            { method: "DELETE" }
          );
        }
      } catch (_) {}
    }
  }

  function handleVariationChange(variation: ProductVariation | null, attrs: Record<string, string>) {
    if (onVariationChange) {
      onVariationChange(variation, attrs);
    } else {
      setInternalVariation(variation);
      setInternalAttributes(attrs);
    }
  }

  const currentPrice = selectedVariation?.price ?? product.price;
  const unlimitedStock = product.trackInventory !== true;
  const currentStock = unlimitedStock ? 999 : (selectedVariation?.stock ?? product.stock);

  const savePercent = product.compareAt && product.compareAt > currentPrice
    ? Math.round(((product.compareAt - currentPrice) / product.compareAt) * 100)
    : null;

  const tags = ["PREMIUM SUPPLIES", "EASY CRAFTING", "BEGINNER FRIENDLY", "FAST SHIPPING"];

  return (
    <div className="lg:sticky lg:top-24 flex flex-col gap-6">
      <h1 className="font-sans text-3xl md:text-[48px] font-medium text-[#1b1718] leading-[1.24]">
        {product.name}
      </h1>

      {/* Reviews hidden for now
      <div className="flex items-center gap-2.5">
        <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
        {product.reviewCount > 0 && (
          <span className="font-sans text-base font-semibold text-[#5f5d5d] leading-[1.6]">
            {product.rating} ({product.reviewCount.toLocaleString()} reviews)
          </span>
        )}
      </div>
      */}

      <div className="flex flex-wrap items-center gap-4 md:gap-7">
        <span className="font-sans text-3xl md:text-[40px] font-light text-[#1b1718] leading-[1.2]">
          <FormatPrice price={currentPrice} compact />
        </span>
        {product.compareAt != null && (
          <span className="font-sans text-lg md:text-xl text-[#5f5d5d] line-through leading-[1.6]">
            <FormatPrice price={product.compareAt} compact />
          </span>
        )}
        {savePercent && (
          <span className="bg-[#862830] text-white font-sans text-sm font-semibold px-2.5 py-1 leading-none">
            You save {savePercent}%
          </span>
        )}
      </div>

      <p className="font-sans text-lg text-[#5f5d5d] leading-[1.6]">
        {product.shortDesc}
      </p>

      <div className="flex flex-wrap gap-3">
        {tags.map((tag) => (
          <span
            key={tag}
            className="bg-[#fbf4eb] h-8 px-3.5 flex items-center justify-center font-sans text-xs font-semibold text-[#1b1718] leading-[1.6]"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="pt-5 space-y-5">
        {product.attributes && product.attributes.length > 0 && product.variations && product.variations.length > 0 && (
          <VariationSelector
            attributes={product.attributes}
            variations={product.variations}
            basePrice={product.price}
            baseImages={product.images.length ? product.images : ["/images/placeholder.svg"]}
            onVariationChange={handleVariationChange}
          />
        )}

        <AddToCartButton
          product={product}
          selectedVariation={selectedVariation}
          selectedAttributes={selectedAttributes}
          hideStockLabel
        />

        <button
          type="button"
          onClick={handleWishlist}
          className="flex items-center justify-center gap-2 w-full h-14 border border-[#e0d6c9] text-[#1b1718] font-sans text-lg leading-[1.6] hover:bg-[#f5eae2] transition-colors"
        >
          <WishlistHeartIcon filled={isInWishlist} size={20} className="text-[#1b1718]" />
          {isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
        </button>

        <div className="flex flex-wrap items-center gap-6 md:gap-10">
          <div className="flex items-center gap-2.5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5f5d5d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span className="font-sans text-base font-semibold text-[#5f5d5d] leading-[1.6]">Secure Checkout</span>
          </div>
          <div className="flex items-center gap-2.5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5f5d5d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            <span className="font-sans text-base font-semibold text-[#5f5d5d] leading-[1.6]">Easy Returns</span>
          </div>
        </div>
      </div>
    </div>
  );
}
