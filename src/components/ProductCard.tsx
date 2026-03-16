"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import type { Product } from "@/lib/data";
import FormatPrice from "./FormatPrice";
import { useCartStore } from "@/lib/cart-store";
import { useWishlistStore } from "@/lib/wishlist-store";
import WishlistHeartIcon from "@/components/WishlistHeartIcon";
import { useCartDrawerStore } from "@/lib/cart-drawer-store";

interface ProductCardProps {
  product: Product;
  variant?: "default" | "featured" | "newArrivals" | "bestSellers";
}

export default function ProductCard({ product, variant = "default" }: ProductCardProps) {
  const { data: session } = useSession();
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product.id));
  const openDrawer = useCartDrawerStore((s) => s.openDrawer);
  const img = product.images[0] ?? "/images/placeholder.svg";

  const outOfStock = product.trackInventory === true && product.stock <= 0;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: img,
        category: product.category,
      },
      1
    );
    openDrawer();
  }

  async function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const item = { productId: product.id, slug: product.slug, name: product.name, price: product.price, image: img };
    const adding = !isInWishlist;
    toggleWishlist(item);
    if (session) {
      try {
        if (adding) {
          await fetch("/api/account/wishlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: product.id }) });
        } else {
          await fetch(`/api/account/wishlist?productId=${encodeURIComponent(product.id)}`, { method: "DELETE" });
        }
      } catch (_) {}
    }
  }

  return (
    <article className="group overflow-hidden">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[296/400] overflow-hidden bg-surface">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleWishlist(e);
            }}
            className="absolute top-4 right-4 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-[#FBF4EB] hover:bg-[#F5EDE2] transition-colors shadow-sm"
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <WishlistHeartIcon filled={isInWishlist} size={18} className="text-dark-100 translate-y-[0.5px]" />
          </button>
          <div className="absolute top-0 left-0 z-10 flex flex-wrap gap-1.5">
            {product.price === 0 ? (
              <span className="px-3 py-1 bg-dark-100 font-sans text-base text-white tracking-wider">
                Free
              </span>
            ) : product.compareAt != null && product.compareAt > product.price ? (
              <span className="px-3 py-1 font-sans text-base text-dark-100 tracking-wider" style={{ backgroundColor: "#b57a7b" }}>
                Sale
              </span>
            ) : null}
            {product.badge === "NEW" && (
              <span className="px-3 py-1 bg-dark-100 font-sans text-base text-white tracking-wider">
                New
              </span>
            )}
            {product.badge === "BESTSELLER" && (
              <span className="px-3 py-1 bg-secondary-60 font-sans text-base text-white tracking-wider">
                Bestseller
              </span>
            )}
          </div>
          <Image
            src={img}
            alt={product.name}
            fill
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          {outOfStock ? (
            <div className="absolute bottom-0 left-0 right-0 z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <span className="flex items-center justify-center w-full h-12 bg-bg/90 backdrop-blur-sm font-sans text-base text-body-muted tracking-wider">
                Out of stock
              </span>
            </div>
          ) : (
            <div
              className="absolute bottom-0 left-0 right-0 z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none"
              aria-hidden
            >
              <button
                type="button"
                onClick={handleAddToCart}
                className="pointer-events-auto flex items-center justify-center gap-2 w-full h-12 bg-dark-100 font-sans text-base text-white tracking-wider hover:bg-dark-80 transition-colors"
              >
                Add to Cart
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
                </svg>
              </button>
            </div>
          )}
        </div>
        <div className="py-3">
          <h3 className="font-sans text-xl font-normal text-dark-100 leading-relaxed truncate">
            {product.name}
          </h3>
          <div className="mt-2 flex items-center gap-3">
            <span className="font-sans text-xl font-semibold leading-none text-secondary-100 tracking-tight">
              <FormatPrice price={product.price} compact />
            </span>
            {product.compareAt != null && product.compareAt > product.price && (
              <span className="font-sans text-base line-through tracking-wider" style={{ color: "#5f5d5d" }}>
                <FormatPrice price={product.compareAt} compact />
              </span>
            )}
          </div>
          {outOfStock && (
            <p className="font-sans text-xs text-secondary-60 mt-1 tracking-wider">Out of stock</p>
          )}
        </div>
      </Link>
    </article>
  );
}
