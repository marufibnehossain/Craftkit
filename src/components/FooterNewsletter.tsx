"use client";

import Image from "next/image";

export default function FooterNewsletter() {
  return (
    <section className="relative overflow-hidden" style={{ minHeight: 360 }}>
      <Image
        src="/images/newsletter-bg.webp"
        alt=""
        fill
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-[rgba(27,23,24,0.7)]" />

      <div className="relative z-10 flex items-center justify-center px-6 md:px-20 py-[60px]">
        <div className="w-full max-w-[1280px] flex flex-col items-center gap-[50px]">
          <div className="flex flex-col items-center gap-4 text-center text-[#f5eae2] w-full max-w-[1280px]">
            <div className="flex flex-col items-center gap-2 w-full">
              <p className="font-display text-base font-medium tracking-[2.56px] uppercase leading-none">
                Newsletter
              </p>
              <h2 className="font-sans text-3xl md:text-[56px] font-light leading-[1.38]">
                Looking for{" "}
                <span className="font-display font-medium leading-none">Inspiration?</span>
              </h2>
            </div>
            <p className="font-sans text-base leading-[1.6] tracking-[0.32px]">
              Sign up for free patterns, our best offers and so much newness straight to your inbox!
            </p>
          </div>

          <form
            className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center w-full sm:w-auto"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              required
              placeholder="Enter your email"
              className="h-14 w-full sm:w-[385px] bg-[#f1f1f1] px-6 py-4 font-sans text-base text-dark-100 placeholder:text-[#7b7b7c] tracking-[0.32px] focus:outline-none focus:ring-2 focus:ring-secondary-60"
            />
            <button
              type="submit"
              className="h-14 px-10 py-[14px] bg-secondary-100 text-white font-sans text-lg leading-[1.6] text-center hover:bg-secondary-60 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
