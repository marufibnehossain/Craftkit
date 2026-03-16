import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getProductBySlug, getRelatedProducts } from "@/lib/data";
import { siteConfig } from "@/lib/site-config";
import ProductWithVariations from "./ProductWithVariations";
import ProductDescriptionSection from "./ProductDescriptionSection";
import RelatedProductsCarousel from "./RelatedProductsCarousel";
import { RecordRecentlyViewed } from "./RecordRecentlyViewed";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return { title: "Product not found" };
  }
  const title = `${product.name} | ${siteConfig.name}`;
  const description = product.shortDesc.slice(0, 160);
  const image = product.images[0] ? (product.images[0].startsWith("http") ? product.images[0] : undefined) : undefined;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      ...(image && { images: [image] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image && { images: [image] }),
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product);

  const baseUrl = siteConfig.url;
  const productUrl = `${baseUrl}/product/${product.slug}`;
  const imageUrl = product.images[0]
    ? product.images[0].startsWith("http")
      ? product.images[0]
      : `${baseUrl}${product.images[0]}`
    : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDesc,
    url: productUrl,
    ...(imageUrl && { image: imageUrl }),
    sku: product.productCode ?? product.id,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "EUR",
      availability:
        product.trackInventory !== true || product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
    ...(product.reviewCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: product.reviewCount,
        bestRating: 5,
      },
    }),
  };

  return (
    <div className="min-h-screen bg-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="bg-bg">
        <div className="mx-auto max-w-[1440px] px-6 md:px-20 py-12 md:py-[100px]">
          <RecordRecentlyViewed slug={product.slug} />
          <ProductWithVariations product={product} />
        </div>
      </section>

      <ProductDescriptionSection product={product} />

      {related.length > 0 && (
        <section className="bg-bg">
          <div className="mx-auto max-w-[1440px] px-6 md:px-20 pb-16 md:pb-[100px]">
            <div className="flex items-center justify-between mb-11">
              <h2 className="font-sans text-3xl md:text-[40px] font-light text-[#1b1718] leading-[1.2]">
                You May Also Like
              </h2>
              <Link
                href="/products"
                className="flex items-center gap-2 font-sans text-base text-[#1b1718] tracking-[0.32px] border-b border-[#1b1718] leading-[1.6] hover:opacity-70 transition-opacity"
              >
                See All
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </div>
            <RelatedProductsCarousel products={related.slice(0, 8)} />
          </div>
        </section>
      )}
    </div>
  );
}
