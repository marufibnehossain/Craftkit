import Link from "next/link";
import Image from "next/image";
import { getCategories } from "@/lib/products";
import {
  getFeaturedProducts,
  getProducts,
  filterTags,
  type Product,
} from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import HomeHero from "@/components/HomeHero";
import DiscoverCategoriesSection from "@/components/DiscoverCategoriesSection";
import BestSellersCarousel from "@/components/BestSellersCarousel";
import ServicesSection from "@/components/ServicesSection";
import MarqueeBar from "@/components/MarqueeBar";
import InsightsSection from "@/components/InsightsSection";
import FooterNewsletter from "@/components/FooterNewsletter";
import PartnerLogos from "@/components/PartnerLogos";
import OurYarnsSection from "@/components/OurYarnsSection";
import HandmadeHeatSection from "@/components/HandmadeHeatSection";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featured = await getFeaturedProducts();
  const allProducts = await getProducts();
  const dbCategories = await getCategories();

  const productCounts = new Map<string, number>();
  for (const product of allProducts) {
    const slug = product.category;
    if (!slug) continue;
    productCounts.set(slug, (productCounts.get(slug) ?? 0) + 1);
  }


  const desiredCategories = [
    "Bargains",
    "Crochet",
    "Cross Stitch & Embroidery",
    "Hobbies & Crafts",
    "Yarns",
    "Thread",
    "Packs & kits",
    "Chunky",
    "Lace",
  ];

  const categoryTiles: { id: string; name: string; slug: string; image: string | null }[] = [];
  for (const name of desiredCategories) {
    const match = dbCategories.find((c) => c.name === name);
    if (match) {
      categoryTiles.push({
        id: match.id,
        name: match.name,
        slug: match.slug,
        image: match.image ?? null,
      });
    }
  }

  const newArrivalsProducts = allProducts.slice(0, 6);
  const featuredIds = new Set(featured.map((p) => p.id));
  const bestSellersProducts =
    featured.length >= 6
      ? featured.slice(0, 6)
      : [...featured, ...allProducts.filter((p) => !featuredIds.has(p.id))].slice(0, 6);

  return (
    <>
      <HomeHero />

      <MarqueeBar />

      <DiscoverCategoriesSection categories={categoryTiles} />

      {newArrivalsProducts.length > 0 && (
        <OurYarnsSection products={newArrivalsProducts} />
      )}

      <ServicesSection />

      <section className="py-16 md:py-24" style={{ backgroundColor: "#862830" }} aria-labelledby="how-to-learn-heading">
        <div className="mx-auto max-w-[1440px] px-6 md:px-20">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-center">
            <div className="flex-1 max-w-[491px]">
              <p className="font-display text-base font-medium tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.6)" }}>
                How To Learn
              </p>
              <h2
                id="how-to-learn-heading"
                className="font-sans text-3xl md:text-5xl lg:text-[64px] font-light text-white mt-2 leading-tight"
              >
                Create a Classic Granny{" "}
                <span className="font-display font-medium">Square!</span>
              </h2>
              <p className="font-sans text-base mt-6 leading-relaxed tracking-wider max-w-[491px]" style={{ color: "rgba(255,255,255,0.7)" }}>
                Learn step-by-step with our professionally designed PDF guide, easy to download, print, and follow as you create a classic granny square with confidence.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-10 h-14 bg-white text-dark-100 font-sans text-lg tracking-wider hover:bg-opacity-90 transition-colors mt-8"
              >
                Shop Now
              </Link>
            </div>
            <div className="flex-1 w-full max-w-[681px] aspect-[681/460] relative overflow-hidden">
              <Image src="/images/yarn-section-small.webp" alt="Granny square tutorial" fill className="object-cover" sizes="(max-width: 768px) 100vw, 405px" />
            </div>
          </div>
        </div>
      </section>

      {bestSellersProducts.length > 0 && (
        <HandmadeHeatSection products={bestSellersProducts} />
      )}

      <div className="pb-24">
        <PartnerLogos />
      </div>

      <section className="relative overflow-hidden" style={{ backgroundColor: "#fbf4eb" }}>
        <div className="flex flex-col lg:flex-row">
          <div className="w-full lg:w-[47%] aspect-[676/564] relative overflow-hidden">
            <Image src="/images/services-image.png" alt="Premium Rowan yarn" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 47vw" />
            <div className="hidden lg:flex absolute inset-0 items-center justify-center pointer-events-none">
              <div className="w-[240px] flex flex-col">
                <div className="h-[236px] bg-[#f5ede2] p-[12px]">
                  <div className="w-[216px] h-[224px] overflow-hidden relative">
                    <Image src="/images/services-image.png" alt="" fill className="object-cover" sizes="216px" />
                  </div>
                </div>
                <div className="h-[63px] bg-[#f5ede2]" />
              </div>
            </div>
          </div>
          <div className="w-full lg:flex-1 flex items-center px-6 md:px-20 lg:pl-[60px] lg:pr-[max(80px,calc((100vw-1440px)/2+80px))]">
            <div className="max-w-[624px] py-12 lg:py-[100px]">
              <p className="font-display text-base font-medium tracking-[0.64px] uppercase" style={{ color: "#8d8b8b" }}>
                Shop Rowan Yarn
              </p>
              <h2 className="font-sans text-3xl md:text-5xl lg:text-[64px] font-light text-dark-100 mt-2 leading-[1.38]">
                Premium Rowan Yarn, Designed for{" "}
                <span className="font-display font-medium leading-none">Knitting</span>
              </h2>
              <p className="font-sans text-base mt-[14px] leading-[1.6] tracking-[0.32px]" style={{ color: "#5f5d5d" }}>
                Explore high-quality Rowan yarns crafted for knitters and crocheters, offering rich textures, beautiful colors, and dependable performance for every creative project.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-10 h-14 border border-dark-100 text-dark-100 font-sans text-lg leading-[1.6] tracking-wider hover:bg-dark-100 hover:text-white transition-colors mt-10"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      <InsightsSection />
      <FooterNewsletter />
    </>
  );
}
