import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function InsightsSection() {
  let posts:
    | Array<{
        slug: string;
        title: string;
        image: string | null;
        excerpt: string | null;
        publishedAt: Date | null;
        category: { name: string } | null;
      }>
    = [];

  try {
    if (typeof (prisma as { blogPost?: { findMany?: unknown } }).blogPost?.findMany === "function") {
      posts = await prisma.blogPost.findMany({
        where: { publishedAt: { not: null } },
        orderBy: { publishedAt: "desc" },
        take: 3,
        select: {
          slug: true,
          title: true,
          image: true,
          excerpt: true,
          publishedAt: true,
          category: { select: { name: true } },
        },
      });
    }
  } catch (e) {
    console.error("[InsightsSection] Failed to load blog posts", e);
  }

  const hasPosts = posts.length > 0;

  return (
    <section className="py-16 md:py-24 bg-bg" aria-labelledby="insights-heading">
      <div className="mx-auto max-w-[1440px] px-6 md:px-20">
        <div className="flex items-end justify-between gap-4 mb-10">
          <div>
            <p className="font-sans text-sm text-body-muted tracking-widest uppercase">Our Article</p>
            <h2
              id="insights-heading"
              className="font-display text-3xl md:text-5xl lg:text-[64px] font-light text-dark-100 mt-3 leading-tight"
            >
              Expert Opinion
            </h2>
          </div>
          <Link
            href="/blog"
            className="hidden md:inline-flex items-center justify-center px-8 py-4 border border-dark-100 text-dark-100 font-sans text-sm font-medium tracking-wider hover:bg-dark-100 hover:text-white transition-colors shrink-0"
          >
            See More
          </Link>
        </div>

        {hasPosts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block overflow-hidden"
              >
                <div className="relative aspect-[405/300] w-full overflow-hidden">
                  {post.image ? (
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#e0d6c9] text-[#8d8b8b]">
                      <span className="font-sans text-sm tracking-wider">No image</span>
                    </div>
                  )}
                  {post.category && (
                    <span className="absolute top-4 left-4 bg-[#CCA2A0] px-[13.5px] py-[4.5px] font-sans text-sm text-[#fdfbf8] tracking-[0.28px]">
                      {post.category.name}
                    </span>
                  )}
                </div>
                <div className="pt-6">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-[7px]">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8d8b8b" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span className="font-sans text-sm text-[#8d8b8b] tracking-[0.28px]">
                        {Math.max(1, Math.ceil((post.excerpt?.split(/\s+/).length ?? 200) / 200))} min read
                      </span>
                    </div>
                    <h3 className="font-sans text-2xl font-medium text-[#2f2a26] leading-[1.34] group-hover:text-secondary-100 transition-colors">
                      {post.title}
                    </h3>
                  </div>
                  {post.excerpt && (
                    <p className="mt-4 font-sans text-base text-[#5f5d5d] leading-[1.6] tracking-[0.32px] line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="font-sans text-sm text-body-muted text-center tracking-wider">
            No articles yet. Check back soon.
          </p>
        )}
      </div>
    </section>
  );
}
