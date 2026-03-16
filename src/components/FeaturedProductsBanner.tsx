"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/data";
import FormatPrice from "./FormatPrice";

interface FeaturedProductsBannerProps {
  products: Product[];
}

const BG_IMAGE = "/images/featured-product.jpg";

export default function FeaturedProductsBanner({ products }: FeaturedProductsBannerProps) {
  const [product1, product2] = products.slice(0, 2);
  const hasTwo = product1 && product2;

  return (
    <section
      className="relative min-h-[420px] md:min-h-[500px] overflow-hidden"
      aria-labelledby="featured-products-banner-heading"
    >
      {/* Full-bleed background image */}
      <div className="absolute inset-0">
        <Image
          src={BG_IMAGE}
          alt=""
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-black/20" aria-hidden />
      </div>

      {/* Overlaid lime product cards — lower right */}
      <div className="relative z-10 w-full px-4 md:px-6 flex flex-col items-end justify-end min-h-[420px] md:min-h-[500px] pb-8 md:pb-12">
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg sm:max-w-none sm:w-auto sm:ml-auto">
          {product1 && (
            <Link
              href={`/product/${product1.slug}`}
              className="flex items-end gap-4 bg-[var(--secondary-100)] p-3 rounded-none w-full sm:w-[280px] shrink-0 hover:opacity-95 transition-opacity"
            >
              <div className="relative w-20 h-20 shrink-0 bg-white/60 overflow-hidden rounded-none">
                <Image
                  src={product1.images[0] ?? "/images/placeholder.svg"}
                  alt={product1.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-sans font-bold text-dark-100 text-sm truncate">
                  {product1.name}
                </h3>
                <p className="font-sans text-xs text-body-muted mt-0.5">Starting at</p>
                <p className="font-sans font-bold text-dark-100 text-sm mt-0.5">
                  <FormatPrice price={product1.price} />
                </p>
              </div>
            </Link>
          )}
          {product2 && (
            <Link
              href={`/product/${product2.slug}`}
              className="hidden sm:flex items-end gap-4 bg-[var(--secondary-100)] p-3 rounded-none w-full sm:w-[280px] shrink-0 hover:opacity-95 transition-opacity"
            >
              <div className="relative w-20 h-20 shrink-0 bg-white/60 overflow-hidden rounded-none">
                <Image
                  src={product2.images[0] ?? "/images/placeholder.svg"}
                  alt={product2.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-sans font-bold text-dark-100 text-sm truncate">
                  {product2.name}
                </h3>
                <p className="font-sans text-xs text-body-muted mt-0.5">Starting at</p>
                <p className="font-sans font-bold text-dark-100 text-sm mt-0.5">
                  <FormatPrice price={product2.price} />
                </p>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Hidden heading for a11y */}
      <h2 id="featured-products-banner-heading" className="sr-only">
        Featured products
      </h2>
    </section>
  );
}
