"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { siteConfig } from "@/lib/site-config";

interface Branding {
  siteName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
}

const defaults: Branding = {
  siteName: siteConfig.name,
  tagline: siteConfig.tagline,
  logoUrl: siteConfig.logo,
  faviconUrl: siteConfig.favicon,
};

const BrandingContext = createContext<Branding>(defaults);

export function useBranding() {
  return useContext(BrandingContext);
}

export default function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<Branding>(defaults);

  useEffect(() => {
    fetch("/api/site-config")
      .then((r) => r.json())
      .then((data) => {
        setBranding({
          siteName: data.siteName ?? defaults.siteName,
          tagline: data.tagline ?? defaults.tagline,
          logoUrl: data.logoUrl ?? defaults.logoUrl,
          faviconUrl: data.faviconUrl ?? defaults.faviconUrl,
        });
      })
      .catch(() => {});
  }, []);

  return (
    <BrandingContext.Provider value={branding}>
      {children}
    </BrandingContext.Provider>
  );
}
