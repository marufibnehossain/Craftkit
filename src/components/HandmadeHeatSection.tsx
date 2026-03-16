"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import type { Product } from "@/lib/data";
import ProductCard from "@/components/ProductCard";

interface HandmadeHeatSectionProps {
  products: Product[];
}

export default function HandmadeHeatSection({ products }: HandmadeHeatSectionProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
    loop: false,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <section className="py-16 md:py-24 overflow-hidden" style={{ backgroundColor: "#F5EDE2" }} aria-labelledby="handmade-heat-heading">
      <div className="pl-6 md:pl-20 lg:pl-[max(20px,calc((100vw-1440px)/2+80px))]">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          <div className="max-w-[515px] flex flex-col gap-8 shrink-0">
            <div>
              <p className="font-display text-base font-medium tracking-widest uppercase" style={{ color: "#8d8b8b" }}>
                Handmade Heat
              </p>
              <h2
                id="handmade-heat-heading"
                className="font-sans text-3xl md:text-5xl lg:text-[64px] font-light text-dark-100 mt-2 leading-tight"
              >
                Unique Creations to Suit{" "}
                <span className="font-display font-medium">Any Vibe</span>
              </h2>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-10 h-14 border border-dark-100 text-dark-100 font-sans text-lg tracking-wider hover:bg-dark-100 hover:text-white transition-colors"
              >
                View More
              </Link>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={scrollPrev}
                  disabled={!canScrollPrev}
                  aria-label="Previous products"
                  className="size-12 border border-dark-100 flex items-center justify-center text-dark-100 hover:bg-dark-100 hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-dark-100 disabled:cursor-not-allowed"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={scrollNext}
                  disabled={!canScrollNext}
                  aria-label="Next products"
                  className="size-12 border border-dark-100 flex items-center justify-center text-dark-100 hover:bg-dark-100 hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-dark-100 disabled:cursor-not-allowed"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-hidden" ref={emblaRef}>
            <div className="flex gap-8">
              {products.map((product: Product) => (
                <div key={product.id} className="flex-[0_0_280px] min-w-0">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
