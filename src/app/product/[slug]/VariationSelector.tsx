"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { ProductAttribute, ProductVariation } from "@/lib/data";

interface VariationSelectorProps {
  attributes: ProductAttribute[];
  variations: ProductVariation[];
  basePrice: number;
  baseImages: string[];
  onVariationChange?: (variation: ProductVariation | null, selectedAttributes: Record<string, string>) => void;
}

export default function VariationSelector({
  attributes,
  variations,
  basePrice,
  baseImages,
  onVariationChange,
}: VariationSelectorProps) {
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [currentVariation, setCurrentVariation] = useState<ProductVariation | null>(null);

  useEffect(() => {
    setSelectedAttributes({});
    setCurrentVariation(null);
  }, [attributes.map((a) => a.id).join(",")]);

  useEffect(() => {
    const allSelected = attributes.every((attr) => selectedAttributes[attr.name]);
    const match =
      allSelected &&
      variations.find((v) =>
        Object.keys(selectedAttributes).every((key) => v.attributes[key] === selectedAttributes[key])
      );
    setCurrentVariation(match || null);
    onVariationChange?.(match || null, selectedAttributes);
  }, [selectedAttributes, variations, attributes, onVariationChange]);

  function handleAttributeChange(attrName: string, value: string) {
    setSelectedAttributes((prev) => ({ ...prev, [attrName]: value }));
  }

  const displayType = (attr: ProductAttribute) => attr.displayType ?? "button";

  return (
    <div className="space-y-5">
      {attributes.map((attr) => {
        const type = displayType(attr);
        const displayData = attr.displayData ?? {};
        return (
          <div key={attr.id}>
            <p className="font-sans text-base font-semibold text-[#1b1718] mb-4 leading-[1.6]">
              {attr.name}{selectedAttributes[attr.name] ? `: ${selectedAttributes[attr.name]}` : ""}
            </p>
            <div className="flex flex-wrap gap-5 items-center">
              {attr.values.map((value) => {
                const isSelected = selectedAttributes[attr.name] === value;
                if (type === "swatch") {
                  const color = displayData[value] || "#cccccc";
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleAttributeChange(attr.name, value)}
                      className={`w-[43px] h-[43px] rounded-full shrink-0 transition-all ${
                        isSelected
                          ? "shadow-[0_0_0_2px_white,0_0_0_4px_#8b5cf6]"
                          : "border border-black/[0.08]"
                      }`}
                      style={{ backgroundColor: color }}
                      title={value}
                      aria-label={`${attr.name}: ${value}`}
                      aria-pressed={isSelected}
                    />
                  );
                }
                if (type === "image") {
                  const imgUrl = displayData[value];
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleAttributeChange(attr.name, value)}
                      className={`relative w-[43px] h-[43px] rounded-full overflow-hidden shrink-0 transition-all ${
                        isSelected
                          ? "shadow-[0_0_0_2px_white,0_0_0_4px_#8b5cf6]"
                          : "border border-black/[0.08]"
                      }`}
                      title={value}
                      aria-label={`${attr.name}: ${value}`}
                      aria-pressed={isSelected}
                    >
                      {imgUrl ? (
                        <Image
                          src={imgUrl}
                          alt={value}
                          fill
                          unoptimized
                          className="object-cover"
                          sizes="43px"
                        />
                      ) : (
                        <span className="absolute inset-0 flex items-center justify-center bg-brand-mid font-sans text-[10px] text-body-muted">
                          {value.slice(0, 1)}
                        </span>
                      )}
                    </button>
                  );
                }
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleAttributeChange(attr.name, value)}
                    className={`h-12 px-8 font-sans text-base font-semibold text-[#1b1718] transition-colors leading-[1.6] ${
                      isSelected
                        ? "border-2 border-[#862830]"
                        : "border border-black/[0.08]"
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      {currentVariation?.sku && (
        <p className="font-sans text-xs text-body-muted tracking-wider">SKU: {currentVariation.sku}</p>
      )}
    </div>
  );
}
