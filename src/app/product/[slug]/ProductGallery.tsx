"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import type { Product, ProductVariation } from "@/lib/data";

interface ProductGalleryProps {
  product: Product;
  selectedVariation?: ProductVariation | null;
}

export default function ProductGallery({ product, selectedVariation }: ProductGalleryProps) {
  const baseImages = product.images.length ? product.images : ["/images/placeholder.svg"];
  const variationImages = selectedVariation?.images;
  const displayImages = variationImages && variationImages.length > 0 ? variationImages : baseImages;

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 20 });
  const [thumbRef, thumbApi] = useEmblaCarousel({
    containScroll: "trimSnaps",
    dragFree: true,
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const index = emblaApi.selectedScrollSnap();
    setSelectedIndex(index);
    if (thumbApi) thumbApi.scrollTo(index);
  }, [emblaApi, thumbApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit();
      emblaApi.scrollTo(0, true);
      setSelectedIndex(0);
    }
    if (thumbApi) {
      thumbApi.reInit();
      thumbApi.scrollTo(0, true);
    }
  }, [displayImages, emblaApi, thumbApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="relative overflow-hidden bg-surface" ref={emblaRef}>
        <div className="flex">
          {displayImages.map((img, index) => (
            <div
              key={`${img}-${index}`}
              className="relative aspect-square min-w-0 flex-[0_0_100%]"
            >
              <Image
                src={img}
                alt={index === 0 ? product.name : `${product.name} - view ${index + 1}`}
                fill
                unoptimized
                className="object-cover object-center"
                priority={index === 0}
                sizes="(max-width: 1024px) 100vw, 721px"
              />
            </div>
          ))}
        </div>
        {displayImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={scrollPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 bg-white/80 backdrop-blur-sm text-dark-100 flex items-center justify-center hover:bg-white transition-colors"
              aria-label="Previous image"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={scrollNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 bg-white/80 backdrop-blur-sm text-dark-100 flex items-center justify-center hover:bg-white transition-colors"
              aria-label="Next image"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        )}
      </div>
      {displayImages.length > 1 && (
        <div className="overflow-hidden" ref={thumbRef}>
          <div className="flex gap-3">
            {displayImages.map((img, index) => (
              <button
                key={`thumb-${img}-${index}`}
                type="button"
                onClick={() => scrollTo(index)}
                className={`relative w-20 h-20 md:w-[100px] md:h-[100px] flex-[0_0_auto] overflow-hidden border-2 transition-all duration-200 ${
                  index === selectedIndex
                    ? "border-secondary-100 opacity-100"
                    : "border-black/[0.08] opacity-60 hover:opacity-80"
                }`}
                aria-label={`Go to image ${index + 1}`}
                aria-pressed={index === selectedIndex}
              >
                <Image
                  src={img}
                  alt=""
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="100px"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
