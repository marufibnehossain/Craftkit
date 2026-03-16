"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguageStore } from "@/lib/language-store";

export default function HomeHero() {
  const { t } = useLanguageStore();

  return (
    <section className="relative w-full overflow-hidden" style={{ backgroundColor: "#F5EDE2" }}>
      <div className="mx-auto max-w-[1440px] px-6 md:px-20 pt-16 md:pt-24">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-[168px]">
          <div className="flex-1 max-w-[584px] flex flex-col gap-16 md:gap-20">
            <div className="max-w-[452px]">
              <div className="mb-10">
                <h1 className="font-display text-dark-100 leading-none tracking-tight">
                  <span className="text-5xl md:text-6xl lg:text-[80px] font-medium">{t("hero.title_1")}</span>{" "}
                  <span className="text-5xl md:text-7xl lg:text-[84px] font-semibold">{t("hero.title_2")}</span>
                </h1>
                <p className="font-sans text-base leading-relaxed tracking-wider mt-4" style={{ color: "#5f5d5d" }}>
                  {t("hero.subtitle")}
                </p>
              </div>

              <div className="flex flex-wrap gap-5">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center px-10 h-14 bg-secondary-100 text-white font-sans text-lg tracking-wider hover:opacity-90 transition-opacity"
                >
                  {t("hero.cta")}
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center px-10 h-14 border border-dark-100 text-dark-100 font-sans text-lg tracking-wider hover:bg-dark-100 hover:text-white transition-colors"
                >
                  {t("hero.download")}
                </Link>
              </div>
            </div>

            <div className="flex items-start gap-8">
              <div className="w-[393px] h-[245px] overflow-hidden relative hidden md:block">
                <Image src="/images/hero-left-small.webp" alt="Handmade craft" fill className="object-cover" sizes="393px" />
              </div>
              <div className="flex flex-col gap-3">
                <span className="font-sans text-[64px] font-light leading-tight text-dark-100">12k+</span>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center -space-x-5">
                    {["/images/avatar-1.webp", "/images/avatar-2.webp", "/images/avatar-3.webp"].map((src, i) => (
                      <div key={i} className="w-12 h-12 rounded-full border-2 border-white flex-shrink-0 overflow-hidden relative" style={{ zIndex: i }}>
                        <Image src={src} alt="" fill className="object-cover" sizes="48px" />
                      </div>
                    ))}
                    <div className="w-12 h-12 rounded-full bg-dark-100 border-2 border-white flex items-center justify-center flex-shrink-0" style={{ zIndex: 3 }}>
                      <span className="text-white text-xs font-medium">+9k</span>
                    </div>
                  </div>
                  <span className="font-sans text-sm text-dark-60 tracking-wider">Happy customers</span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[506px] shrink-0 self-stretch">
            <div className="relative w-full h-full min-h-[400px] overflow-hidden">
              <Image
                src="/images/hero-right.webp"
                alt="Craft supplies"
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 506px"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
