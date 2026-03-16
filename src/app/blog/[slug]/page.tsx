import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BreadcrumbLabel } from "@/components/BreadcrumbContext";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function BlogPostPage(props: PageProps) {
  const { slug } = await props.params;

  const post = await prisma.blogPost.findFirst({
    where: { slug, publishedAt: { not: null } },
    include: { category: { select: { name: true, slug: true } } },
  });

  if (!post) {
    notFound();
  }

  const publishedAt = post.publishedAt!;

  return (
    <div className="min-h-screen bg-bg">
      <BreadcrumbLabel label={post.title} />
      <article className="max-w-3xl mx-auto px-4 md:px-6 py-12 md:py-16">
        {post.image && (
          <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-brand-light mb-8">
            <Image
              src={post.image}
              alt=""
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 896px"
            />
          </div>
        )}
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-block rounded-full bg-brand-mid px-3 py-1 font-sans text-xs text-dark-100 tracking-wider">
            {post.category.name}
          </span>
          <span className="font-sans text-xs text-body-muted tracking-wider">
            {formatDate(publishedAt)}
          </span>
        </div>
        <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-normal text-dark-100 italic leading-tight">
          {post.title}
        </h1>
        <p className="mt-3 font-sans text-sm text-body-muted tracking-wider">
          By {post.authorName}
        </p>
        <div className="mt-8 font-sans text-dark-80 leading-relaxed max-w-none">
          {post.body ? (
            <div className="blog-body" dangerouslySetInnerHTML={{ __html: post.body }} />
          ) : (
            <p>{post.excerpt}</p>
          )}
        </div>
      </article>
    </div>
  );
}
