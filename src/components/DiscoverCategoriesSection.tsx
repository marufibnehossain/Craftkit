"use client";

import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { useLanguageStore } from "@/lib/language-store";

export interface CategoryTile {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
}

interface DiscoverCategoriesSectionProps {
  categories: CategoryTile[];
}

export default function DiscoverCategoriesSection({ categories }: DiscoverCategoriesSectionProps) {
  const { t } = useLanguageStore();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
    loop: false,
    slidesToScroll: 1,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

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

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (!categories.length) return null;

  return (
    <section className="bg-bg py-16 md:py-24" aria-labelledby="discover-categories-heading">
      <div className="mx-auto max-w-[1440px] px-6 md:px-20">
        <div className="text-center mb-10 md:mb-14">
          <p className="font-display text-base font-medium tracking-widest uppercase" style={{ color: "#8d8b8b" }}>
            {t("category.label")}
          </p>
          <h2
            id="discover-categories-heading"
            className="font-sans text-4xl md:text-5xl lg:text-[64px] font-light text-dark-100 mt-2 leading-tight"
          >
            {t("category.title_1")}{" "}
            <span className="font-display font-medium">{t("category.title_2")}</span>
          </h2>
        </div>

        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${encodeURIComponent(cat.slug)}`}
                  className="group flex flex-col items-center gap-4 min-w-0 flex-[0_0_calc(100%/3)] sm:flex-[0_0_calc(100%/4)] md:flex-[0_0_calc(100%/5)] lg:flex-[0_0_calc(100%/7)]"
                >
                  <div className="w-20 h-20 flex items-center justify-center overflow-hidden">
                    {cat.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={cat.image}
                        alt=""
                        width={80}
                        height={80}
                        className="w-20 h-20 object-contain"
                      />
                    ) : (
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-dark-80">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M8 12h8M12 8v8" />
                      </svg>
                    )}
                  </div>
                  <span className="font-sans text-lg font-medium text-dark-100 text-center leading-snug group-hover:text-secondary-100 transition-colors">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {canScrollPrev && (
            <button
              onClick={scrollPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Previous categories"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}
          {canScrollNext && (
            <button
              onClick={scrollNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Next categories"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
