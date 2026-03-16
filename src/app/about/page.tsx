import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/site-config";
import { getProducts } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import PartnerLogos from "@/components/PartnerLogos";
import InsightsSection from "@/components/InsightsSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `About Us — ${siteConfig.name}`,
  description: "Learn about our story, mission, and the passion behind every handcrafted product we offer.",
};

export const dynamic = "force-dynamic";

const commitments = [
  {
    num: "01",
    title: "PREMIUM SUPPLIES",
    desc: "We source only the highest quality materials to ensure your creations stand the test of time.",
  },
  {
    num: "02",
    title: "EXPERT GUIDANCE",
    desc: "From beginner tutorials to advanced patterns, we guide creators at every stage of their journey.",
  },
  {
    num: "03",
    title: "CREATIVE FREEDOM",
    desc: "We provide the essential foundational tools so your imagination can freely explore without limits.",
  },
  {
    num: "04",
    title: "MAKER COMMUNITY",
    desc: "We celebrate and connect creators of all skill levels from around the world, fostering collaboration and innovation.",
  },
];

export default async function AboutPage() {
  const allProducts = await getProducts();
  const displayProducts = allProducts.slice(0, 4);

  return (
    <>
      <section className="relative h-[520px] overflow-hidden">
        <Image
          src="/images/about-hero.webp"
          alt="About Craftkit"
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0" style={{ backgroundColor: "rgba(27,23,24,0.6)" }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-[50px] w-full max-w-[666px] px-6 text-center">
            <div className="flex flex-col items-center gap-6">
              <h1 className="font-sans font-medium text-[48px] leading-[1.24] text-[#f5eae2] w-full">
                The Art of the Handmade Craftsmanship
              </h1>
              <p className="font-sans text-lg leading-[1.6] text-[#faf6f1]">
                Craftkit was built for makers who care about quality, creativity, and thoughtful design. We curate premium craft supplies, tools, and kits to help ideas come to life beautifully and confidently.
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center justify-center h-14 px-10 bg-secondary-100 text-white font-sans text-lg leading-[1.6] hover:bg-secondary-60 transition-colors"
            >
              Explore
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-bg">
        <div className="mx-auto max-w-[1440px] px-6 md:px-20 py-[100px]">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-[80px] items-center">
            <div className="flex flex-col justify-between w-full lg:w-[622px] shrink-0 min-h-[500px] lg:min-h-[700px]">
              <h2 className="font-sans font-light text-[40px] md:text-[64px] leading-[1.2] text-dark-100">
                Weaving Memories,{" "}
                <span className="font-display font-medium leading-none">One Stitch at a Time</span>
              </h2>

              <div className="flex flex-col gap-[44px]">
                <p className="font-sans text-xl leading-[1.6] text-[#5f5d5d]">
                  Craftkit began with a simple belief: crafting should feel inspiring, not overwhelming. From beginner-friendly kits to premium materials trusted by experienced makers, every product is selected with care.
                </p>
                <div className="border-t border-[#e0d6c9] pt-5 flex items-center justify-between">
                  <span className="font-display font-medium text-[32px] leading-none tracking-[-0.64px] text-dark-100">Our Story</span>
                  <span className="font-display font-medium text-[32px] leading-none tracking-[-0.64px] text-dark-100">Since 2015</span>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-[578px] h-[500px] lg:h-[700px] overflow-hidden shrink-0">
              <Image
                src="/images/about-story.webp"
                alt="Our story"
                width={578}
                height={700}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-bg pb-[100px]">
        <div className="mx-auto max-w-[1440px] px-6 md:px-20">
          <div className="flex flex-col gap-5 mb-[44px]">
            <h2 className="font-sans font-light text-[40px] md:text-[64px] leading-[1.38] text-dark-100">
              Curated With <span className="font-display font-medium leading-none">Purpose</span>
            </h2>
            <div className="flex items-center gap-8">
              <div className="flex-1 h-px bg-[#e0d6c9]" />
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-[#767474] rotate-45" />
                <span className="font-sans font-light text-sm leading-[1.6] tracking-[0.28px] text-[#767474]">PHILOSOPHY</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-[26px]">
            <div className="w-full lg:w-[624px] shrink-0">
              <p className="font-display font-medium text-[32px] leading-none tracking-[-0.64px] text-[#494546]">Enduring charm</p>
              <p className="font-sans text-lg leading-[1.6] text-[#767474] mt-3">Eternal beauty</p>
              <div className="h-[400px] lg:h-[621px] overflow-hidden mt-3">
                <Image
                  src="/images/about-charm.webp"
                  alt="Enduring charm"
                  width={624}
                  height={621}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="w-full lg:w-[630px] flex flex-col gap-12">
              <div>
                <p className="font-display font-medium text-[32px] leading-none tracking-[-0.64px] text-[#494546]">Crafted with passion</p>
                <p className="font-sans text-lg leading-[1.6] text-[#767474] mt-3">Soulful design</p>
                <div className="h-[300px] lg:h-[445px] overflow-hidden mt-3 bg-[#5f5d5d]">
                  <Image
                    src="/images/about-passion.webp"
                    alt="Crafted with passion"
                    width={630}
                    height={445}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <p className="font-sans text-xl leading-[1.6] text-[#5f5d5d] text-right max-w-[509px] self-end">
                We think knitting should be more than just a hobby. It should express the creativity of the knitter. Our goal is to craft patterns that are as unique and personal as the individuals who create them.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-secondary-100 overflow-hidden">
        <div className="mx-auto max-w-[1440px] px-6 md:px-20 py-[100px]">
          <div className="flex flex-col gap-[44px]">
            <div className="flex flex-col gap-6">
              <h2 className="font-sans font-light text-[40px] md:text-[64px] leading-[1.38] text-[#f5eae2]">
                What We <span className="font-display font-medium leading-none">Believe In</span>
              </h2>
              <div className="border-t border-[#b57a7b] pt-4 flex flex-wrap gap-12">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-[#cca2a0] rotate-45" />
                  <span className="font-sans font-light text-sm leading-[1.6] tracking-[0.28px] text-[#cca2a0]">DEDICATION</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-[#cca2a0] rotate-45" />
                  <span className="font-sans font-light text-sm leading-[1.6] tracking-[0.28px] text-[#cca2a0]">PASSION</span>
                </div>
              </div>
            </div>

            <div className="h-[300px] md:h-[500px] overflow-hidden">
              <Image
                src="/images/about-commitment.webp"
                alt="Our commitment"
                width={1280}
                height={500}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {commitments.map((item) => (
                <div key={item.num} className="flex flex-col gap-5 w-full max-w-[296px]">
                  <div className="w-12 h-12 rounded-full bg-[#98484f] flex items-center justify-center">
                    <span className="font-sans text-lg leading-[1.6] text-[#f5eae2]">{item.num}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="font-sans font-light text-2xl leading-[1.34] text-[#f5eae2]">{item.title}</p>
                    <p className="font-sans text-base leading-[1.6] tracking-[0.32px] text-[#cca2a0]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-bg pt-[100px]">
        <div className="mx-auto max-w-[1440px] px-6 md:px-20">
          <div className="flex flex-col gap-[44px]">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-2 w-full">
                <p className="font-display font-medium text-base leading-none tracking-[0.64px] uppercase text-[#8d8b8b]">Our Curated Collections</p>
                <h2 className="font-sans font-light text-[40px] leading-[1.2] text-dark-100">
                  Our Curated Collections
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {displayProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-bg">
        <div className="mx-auto max-w-[1440px] px-6 md:px-20 py-[100px]">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-[80px] items-center">
            <div className="w-full lg:w-[578px] h-[400px] lg:h-[550px] overflow-hidden shrink-0">
              <Image
                src="/images/about-selected.webp"
                alt="Thoughtfully selected"
                width={578}
                height={550}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="w-full lg:w-[624px] flex flex-col justify-between h-auto lg:h-[550px] gap-8">
              <h2 className="font-sans font-light text-[40px] md:text-[64px] leading-[1.38] text-dark-100">
                Thoughtfully <span className="font-display font-medium leading-none">Selected</span>
              </h2>
              <p className="font-sans text-xl leading-[1.6] text-[#5f5d5d]">
                Every item on Craftkit is chosen for quality, usability, and creative potential. We test, refine, and curate, so you can focus on making, not searching.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-bg">
        <div className="mx-auto max-w-[1440px]">
          <PartnerLogos />
        </div>
      </div>

      <InsightsSection />
    </>
  );
}
