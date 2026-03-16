import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import { Inter_Tight, Cormorant } from "next/font/google";
import Script from "next/script";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import StoreShell from "@/components/StoreShell";
import CurrencyInitializer from "@/components/CurrencyInitializer";
import BrandingProvider from "@/components/BrandingProvider";
import { prisma } from "@/lib/prisma";

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter-tight",
  display: "swap",
});

const cormorant = Cormorant({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

async function getBrandingSetting(key: string): Promise<string | null> {
  try {
    const row = await prisma.setting.findUnique({ where: { key } });
    return row?.value ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const [siteName, tagline, faviconUrl] = await Promise.all([
    getBrandingSetting("branding_site_name"),
    getBrandingSetting("branding_tagline"),
    getBrandingSetting("branding_favicon_url"),
  ]);

  return {
    title: `${siteName ?? siteConfig.name} — Online Store`,
    description: tagline ?? siteConfig.tagline,
    icons: faviconUrl ? { icon: faviconUrl } : undefined,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${interTight.variable} ${cormorant.variable}`}>
      <body className="min-h-screen flex flex-col">
        <NextTopLoader color="#862830" height={3} showSpinner={false} />
        <SessionProvider>
          <BrandingProvider>
            <CurrencyInitializer />
            <StoreShell>{children}</StoreShell>
          </BrandingProvider>
        </SessionProvider>
        <Script
          src="//code.tidio.co/qcxu8oux8lftzaontp5nhkdgu8pbsjsm.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
