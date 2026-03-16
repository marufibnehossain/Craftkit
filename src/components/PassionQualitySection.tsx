import Image from "next/image";
import Button from "./Button";

export default function PassionQualitySection() {
  return (
    <section className="bg-bg py-[50px] border-t border-brand-dark overflow-hidden">
      <div className="mx-auto max-w-[1312px] px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: single about image — height auto from intrinsic size */}
          <div className="w-full overflow-hidden rounded-none">
            <Image
              src="/images/about.png"
              alt="Table tennis — passion and quality"
              width={800}
              height={1000}
              className="w-full h-auto object-contain"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* Right: heading, paragraphs, CTA */}
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-dark-100 leading-tight">
              Passion for{" "}
              <span className="text-[#2050FC]">Table Tennis.</span>{" "}
              Commitment to{" "}
              <span className="text-[#2050FC]">Quality.</span>
            </h2>
            <p className="mt-6 font-sans text-body-muted leading-relaxed">
              We are dedicated to providing high-quality table tennis equipment for players of all levels — from beginners to professionals. Our carefully selected range of blades, rubbers, balls, and accessories comes from the world&apos;s most trusted brands.
            </p>
            <p className="mt-4 font-sans text-body-muted leading-relaxed">
              With a focus on <em>performance, reliability, and customer satisfaction</em>, we help players elevate their game with the right gear and expert support.
            </p>
            <div className="mt-8">
              <Button href="/about" variant="hero">
                About Us
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
