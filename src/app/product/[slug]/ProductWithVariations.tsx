"use client";

import { useState, useEffect, useMemo } from "react";
import type { Product, ProductVariation } from "@/lib/data";
import ProductGallery from "./ProductGallery";
import ProductDetails from "./ProductDetails";

interface ProductWithVariationsProps {
  product: Product;
}

export default function ProductWithVariations({ product }: ProductWithVariationsProps) {
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});

  const allVariationImages = useMemo(() => {
    const urls = new Set<string>();
    for (const v of product.variations ?? []) {
      if (v.images) {
        for (const img of v.images) {
          urls.add(img);
        }
      }
    }
    return [...urls];
  }, [product.variations]);

  useEffect(() => {
    for (const src of allVariationImages) {
      const img = new Image();
      img.src = src;
    }
  }, [allVariationImages]);

  function handleVariationChange(variation: ProductVariation | null, attrs: Record<string, string>) {
    setSelectedVariation(variation);
    setSelectedAttributes(attrs);
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-11 lg:items-start">
      <div className="w-full lg:w-[56%] shrink-0">
        <ProductGallery product={product} selectedVariation={selectedVariation} />
      </div>
      <div className="w-full lg:flex-1">
        <ProductDetails
          product={product}
          selectedVariation={selectedVariation}
          selectedAttributes={selectedAttributes}
          onVariationChange={handleVariationChange}
        />
      </div>
    </div>
  );
}
