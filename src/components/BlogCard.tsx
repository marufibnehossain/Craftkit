import Image from "next/image";
import Link from "next/link";

type BlogCardProps = {
  slug: string;
  title: string;
  excerpt: string;
  image: string | null;
  categoryName: string;
  publishedAt?: Date;
  authorName?: string;
};

function estimateReadTime(text: string): number {
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default function BlogCard({
  slug,
  title,
  excerpt,
  image,
  categoryName,
  publishedAt,
  authorName,
}: BlogCardProps) {
  const readTime = estimateReadTime(excerpt || "");

  return (
    <Link
      href={`/blog/${slug}`}
      className="group block overflow-hidden"
    >
      <div className="relative aspect-[405/300] w-full overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#e0d6c9] text-[#8d8b8b]">
            <span className="font-sans text-sm tracking-wider">No image</span>
          </div>
        )}
        <span className="absolute top-4 left-4 bg-[#CCA2A0] px-[13.5px] py-[4.5px] font-sans text-sm text-[#fdfbf8] tracking-[0.28px]">
          {categoryName}
        </span>
      </div>
      <div className="pt-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-[7px]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#8d8b8b]">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="font-sans text-sm text-[#8d8b8b] tracking-[0.28px]">{readTime} min read</span>
          </div>
          <h3 className="font-sans text-2xl font-medium text-[#2f2a26] leading-[1.34] group-hover:text-secondary-100 transition-colors">
            {title}
          </h3>
        </div>
        <p className="mt-4 font-sans text-base text-[#5f5d5d] leading-[1.6] tracking-[0.32px] line-clamp-2">
          {excerpt}
        </p>
      </div>
    </Link>
  );
}
