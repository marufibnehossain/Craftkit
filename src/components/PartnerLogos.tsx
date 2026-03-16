"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

const partners = [
  { name: "Nest Brand", src: "/images/partners/logo1.svg" },
  { name: "Spacewool", src: "/images/partners/logo2.svg" },
  { name: "Clothing Company", src: "/images/partners/logo3.webp" },
  { name: "Lacoste", src: "/images/partners/logo4.webp" },
  { name: "Brio Threads", src: "/images/partners/logo5.svg" },
  { name: "Partner 6", src: "/images/partners/logo6.webp" },
  { name: "Partner 7", src: "/images/partners/logo7.svg" },
];

const allSlides = [...partners, ...partners];

export default function PartnerLogos() {
  const [emblaRef] = useEmblaCarousel(
    {
      align: "start",
      loop: true,
      dragFree: true,
      containScroll: false,
      slidesToScroll: 1,
    },
    [Autoplay({ delay: 2000, stopOnInteraction: false, stopOnMouseEnter: true })]
  );

  return (
    <section className="overflow-hidden" style={{ backgroundColor: "#F5EDE2" }}>
      <div className="mx-auto max-w-[1440px] px-6 md:px-20">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {allSlides.map((partner, i) => (
              <div
                key={`${partner.name}-${i}`}
                className="flex-[0_0_calc(100%/7)] min-w-0 flex items-center justify-center"
                style={{ paddingLeft: "52px", paddingRight: "52px" }}
              >
                <div className="h-[50px] flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={partner.src}
                    alt={partner.name}
                    className="h-[50px] w-auto"
                    style={{ objectFit: "contain" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
