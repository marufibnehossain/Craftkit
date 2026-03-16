import Image from "next/image";

interface PolaroidCardProps {
  src: string;
  alt: string;
  rotate?: string;
  highlight?: boolean;
  className?: string;
  /** Image aspect ratio: default 3/4, use "297/230" for the last polaroid */
  imageAspect?: "3/4" | "297/230";
}

export default function PolaroidCard({ src, alt, rotate = "", highlight = false, className = "", imageAspect = "3/4" }: PolaroidCardProps) {
  const aspectClass = imageAspect === "297/230" ? "aspect-[297/230]" : "aspect-[3/4]";
  return (
    <div className={`${rotate} ${className}`}>
      <div
        className={`rounded-sm shadow-lg md:pt-2 md:px-2 md:pb-8 pb-2 pt-1 px-1 ${
          highlight ? "bg-[#D6FC45]" : "bg-white"
        }`}
      >
        <div className={`relative ${aspectClass} w-full overflow-hidden rounded-sm`}>
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 160px, 220px"
          />
        </div>
      </div>
    </div>
  );
}
