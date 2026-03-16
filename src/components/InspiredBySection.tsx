import Link from "next/link";
import PolaroidCard from "./PolaroidCard";

// Assets in /public/images/ — image-one.png, image-two.png, image-three.png
const POLAROID_IMAGES = [
  { src: "/images/image-one.png", alt: "Two players in an outdoor table tennis game" },
  { src: "/images/image-two.png", alt: "Player mid-air making a table tennis shot with city skyline" },
  { src: "/images/image-three.png", alt: "Two people relaxing on a table tennis table with paddles" },
];

export default function InspiredBySection() {
  return (
    <section
      className="py-16 md:py-20 overflow-hidden"
      style={{ backgroundColor: "rgb(240, 245, 235)" }}
      aria-labelledby="inspired-by-heading"
    >
      <div className="mx-auto max-w-[1312px] px-4 md:px-6">
        {/* 1. Top/Center headline — 2 lines, very large, tight leading */}
        <h2
          id="inspired-by-heading"
          className="font-display font-bold text-[var(--dark-100)] md:text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight md:leading-tight"
        >
          <span className="block">Inspired by <span className="italic text-[#7546FF]">passion,</span></span>
          <span className="block">defined by <span className="italic text-[#7546FF]">quality.</span></span>
        </h2>

        {/* 2. Right-side content block + 3. Polaroids in bottom area */}
        <div className="relative mt-10 md:mt-14 min-h-[100px] md:min-h-[100px] lg:min-h-[600px] xl:min-h-[560px]">
          {/* Paragraph + CTA — right-aligned on desktop, full-width on mobile */}
          <div className="lg:absolute lg:top-0 lg:right-0 lg:max-w-md text-left z-40">
            <p className="font-sans md:text-lg text-base text-[var(--dark-100)] leading-relaxed">
              We are dedicated to providing{" "}
              <span className="italic font-semibold">high-quality</span> table tennis equipment for players of all levels — from beginners to professionals. Our carefully selected{" "}
              <span className="italic font-semibold">range of blades, rubbers, balls, and accessories</span> comes from the world&apos;s most trusted brands.
            </p>
            <Link
              href="/about"
              className="mt-6 inline-flex items-center justify-center bg-[#D6FC45] text-[var(--dark-100)] font-sans font-medium text-sm px-6 py-3 shadow-md hover:opacity-90 transition-opacity"
            >
              About Us
            </Link>
          </div>

          {/* Polaroids — absolute at bottom (desktop only): left, center (highlighted), right */}
          <div className="relative w-full h-[320px] md:h-[360px] lg:h-[400px] mt-12 md:mt-16 lg:mt-0 hidden lg:block xl:-bottom-16 lg:-bottom-24">
            {/* Left polaroid — bottom-left quadrant, counter-clockwise ~5°, width 267px */}
            <div className="absolute left-0 bottom-14 w-[267px] z-10 -rotate-[5deg] md:-rotate-4">
              <PolaroidCard
                src={POLAROID_IMAGES[0].src}
                alt={POLAROID_IMAGES[0].alt}
                rotate=""
                highlight={false}
              />
            </div>
            {/* Middle polaroid — bottom-center, clockwise ~8°, lime bg, width 267px, behind right */}
            <div className="absolute left-1/2 -bottom-28 -translate-x-1/2 w-[267px] z-20 rotate-[8deg] md:rotate-4">
              <PolaroidCard
                src={POLAROID_IMAGES[1].src}
                alt={POLAROID_IMAGES[1].alt}
                rotate=""
                highlight
              />
            </div>
            {/* Right polaroid — bottom-right quadrant, counter-clockwise ~6°, on top, width 297px, 297/230 ratio */}
            <div className="absolute right-0 bottom-0 w-[297px] z-30 -rotate-[6deg] md:-rotate-3">
              <PolaroidCard
                src={POLAROID_IMAGES[2].src}
                alt={POLAROID_IMAGES[2].alt}
                rotate=""
                highlight={false}
                imageAspect="297/230"
              />
            </div>
          </div>
        </div>

        {/* Mobile/tablet: horizontal scroll polaroids with viewport-based width */}
        <div className="flex lg:hidden justify-center md:gap-6 gap-3 mt-8 overflow-x-hidden overflow-y-hidden pb-4 px-2 snap-x snap-mandatory">
          <div className="snap-center  w-1/3 max-w-[267px] -rotate-2">
            <PolaroidCard src={POLAROID_IMAGES[0].src} alt={POLAROID_IMAGES[0].alt} />
          </div>
          <div className="snap-center w-1/3 max-w-[267px] rotate-2">
            <PolaroidCard src={POLAROID_IMAGES[1].src} alt={POLAROID_IMAGES[1].alt} highlight />
          </div>
          <div className="snap-center w-1/3 max-w-[297px] -rotate-3">
            <PolaroidCard src={POLAROID_IMAGES[2].src} alt={POLAROID_IMAGES[2].alt} imageAspect="297/230" />
          </div>
        </div>
      </div>
    </section>
  );
}
