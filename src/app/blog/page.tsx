import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import BlogCard from "@/components/BlogCard";

interface PageProps {
  searchParams?: Promise<{ category?: string }>;
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function estimateReadTime(text: string): number {
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default async function BlogPage(props: PageProps) {
  const searchParams = (await props.searchParams) ?? {};
  const categorySlug = searchParams.category?.trim() || null;

  let categories: Array<{ id: string; name: string; slug: string }> = [];
  let posts: Array<{
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    image: string | null;
    authorName: string;
    publishedAt: Date | null;
    category: { id: string; name: string; slug: string };
  }> = [];

  try {
    if (typeof (prisma as { blogCategory?: { findMany: unknown } }).blogCategory?.findMany !== "function") {
      throw new Error("Prisma client missing blog models — run: npx prisma generate");
    }
    const [categoriesData, categoryFilteredData] = await Promise.all([
      prisma.blogCategory.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, slug: true },
      }),
      categorySlug
        ? prisma.blogCategory.findUnique({
            where: { slug: categorySlug },
            select: { id: true },
          })
        : null,
    ]);
    categories = categoriesData;
    const categoryIdFilter = categoryFilteredData?.id ?? null;
    posts = await prisma.blogPost.findMany({
      where: {
        publishedAt: { not: null },
        ...(categoryIdFilter ? { categoryId: categoryIdFilter } : {}),
      },
      orderBy: { publishedAt: "desc" },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });
  } catch (e) {
    console.error("[BlogPage]", e);
  }

  const featuredPost = !categorySlug && posts.length > 0 ? posts[0] : null;
  const gridPosts = featuredPost ? posts.slice(1) : posts;

  return (
    <div className="min-h-screen bg-[#f5ede2]">
      {featuredPost && (
        <section className="bg-[#f5ede2]">
          <div className="mx-auto max-w-[1440px] px-6 md:px-20 py-16 md:py-[100px]">
            <div className="mb-11">
              <h2 className="font-sans font-light text-2xl text-[#1b1718] leading-[1.34]">
                Featured Story
              </h2>
            </div>
            <div className="flex flex-col lg:flex-row gap-10 lg:gap-[80px] items-center">
              <div className="w-full lg:w-[548px] shrink-0">
                <div className="relative aspect-[548/556] w-full overflow-hidden">
                  {featuredPost.image ? (
                    <Image
                      src={featuredPost.image}
                      alt={featuredPost.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 548px"
                      priority
                    />
                  ) : (
                    <Image
                      src="/images/blog-featured.webp"
                      alt={featuredPost.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 548px"
                      priority
                    />
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-[50px] flex-1">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-6">
                    <span className="inline-flex self-start bg-[#b57a7b] px-3 py-1 font-sans text-xs font-semibold text-[#f5eae2] tracking-[0.24px]">
                      {featuredPost.category.name}
                    </span>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-[6px]">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8d8b8b" strokeWidth="1.5">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span className="font-sans text-sm text-[#8d8b8b] tracking-[0.28px]">
                          {formatDate(featuredPost.publishedAt!)}
                        </span>
                      </div>
                      <div className="w-1 h-1 rounded-sm bg-[#8d8b8b]" />
                      <div className="flex items-center gap-[6px]">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8d8b8b" strokeWidth="1.5">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span className="font-sans text-sm text-[#8d8b8b] tracking-[0.28px]">
                          {estimateReadTime(featuredPost.excerpt || "")} min read
                        </span>
                      </div>
                    </div>
                  </div>
                  <h1 className="font-sans font-light text-[64px] text-[#1b1718] leading-[1.1]">
                    {featuredPost.title}
                  </h1>
                  <p className="font-sans text-base text-[#5f5d5d] leading-[1.6] tracking-[0.32px]">
                    {featuredPost.excerpt}
                  </p>
                </div>
                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="inline-flex self-start items-center justify-center h-14 px-10 bg-[#862830] text-white font-sans text-lg leading-[1.6] hover:bg-[#6e2028] transition-colors"
                >
                  Read Article
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="bg-[#f5ede2]">
        <div className="mx-auto max-w-[1440px] px-6 md:px-20 pb-16 md:pb-[100px]">
          <div className="flex flex-col gap-11">
            <div>
              <h2 className="font-sans font-light text-2xl text-[#1b1718] leading-[1.34]">
                Latest Articles
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {posts.length === 0 ? (
                <p className="col-span-full font-sans text-[#8d8b8b] text-center py-16 tracking-wider">
                  No posts yet. Check back soon.
                </p>
              ) : gridPosts.length === 0 ? null : (
                gridPosts.map((post) => (
                  <BlogCard
                    key={post.id}
                    slug={post.slug}
                    title={post.title}
                    excerpt={post.excerpt}
                    image={post.image}
                    categoryName={post.category.name}
                    publishedAt={post.publishedAt!}
                    authorName={post.authorName}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
