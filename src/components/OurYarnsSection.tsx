"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import type { Product } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import { useLanguageStore } from "@/lib/language-store";

interface OurYarnsSectionProps {
  products: Product[];
}

export default function OurYarnsSection({ products }: OurYarnsSectionProps) {
  const { t } = useLanguageStore();
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
    <section className="pb-16 md:pb-24 overflow-hidden" style={{ backgroundColor: "#F5EDE2" }} aria-labelledby="our-yarns-heading">
      <div className="mx-auto max-w-[1440px] px-6 md:px-20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="max-w-[664px]">
            <p className="font-display text-base font-medium tracking-widest uppercase" style={{ color: "#8d8b8b" }}>
              {t("yarns.label")}
            </p>
            <h2
              id="our-yarns-heading"
              className="font-sans text-4xl md:text-5xl lg:text-[64px] font-light text-dark-100 mt-2 leading-tight"
            >
              {t("yarns.title_1")}{" "}
              <span className="font-display font-medium">{t("yarns.title_2")}</span>
            </h2>
          </div>
          <p className="font-sans text-base leading-relaxed tracking-wider max-w-[362px]" style={{ color: "#5f5d5d" }}>
            {t("yarns.description")}
          </p>
        </div>
      </div>

      <div className="pl-6 md:pl-20 lg:pl-[max(20px,calc((100vw-1440px)/2+80px))]">
        <div className="flex gap-8 items-stretch">
          <div className="w-[405px] shrink-0 aspect-[405/488] overflow-hidden relative hidden lg:block">
            <Image src="/images/yarn-section-large.webp" alt="Our yarns collection" fill className="object-cover" sizes="405px" />
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

      <div className="mx-auto max-w-[1440px] px-6 md:px-20">
        <div className="flex items-center justify-center gap-6 mt-12">
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
          <Link
            href="/products"
            className="inline-flex items-center gap-2 font-sans text-base text-dark-100 tracking-wider border-b border-dark-100 pb-1 hover:opacity-70 transition-opacity"
          >
            {t("yarns.shop_all")}
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M1 7.5h13M8.5 2l5.5 5.5-5.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
