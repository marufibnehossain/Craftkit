import Link from "next/link";

export default function BottomCtaBanner() {
  return (
    <section className="bg-secondary-100 py-16 md:py-24">
      <div className="mx-auto max-w-[1440px] px-6 md:px-20 text-center">
        <h2 className="font-display text-3xl md:text-5xl lg:text-[64px] font-light text-white leading-tight">
          Ready to Start Creating?
        </h2>
        <p className="font-sans text-sm md:text-base text-white/80 max-w-xl mx-auto mt-4 leading-relaxed tracking-wider">
          Explore our full range of premium craft supplies and find everything you need for your next project.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white text-secondary-100 font-sans text-sm font-medium tracking-wider hover:bg-white/90 transition-colors mt-8"
        >
          Shop Now
        </Link>
      </div>
    </section>
  );
}
