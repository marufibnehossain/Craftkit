"use client";

import { useBranding } from "@/components/BrandingProvider";

interface LogoProps {
  width?: number;
  className?: string;
}

export default function Logo({ width = 120, className = "" }: LogoProps) {
  const { logoUrl, siteName } = useBranding();

  if (!logoUrl) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoUrl}
      alt={siteName}
      width={width}
      style={{ width, height: "auto", display: "block" }}
      className={className}
    />
  );
}
