import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import { getWebsiteSettings } from "@/lib/public-data";

import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getWebsiteSettings().catch(() => ({} as Record<string, string>));
  const title = settings.site_name
    ? `${settings.site_name} — Premium Handbags & Luxury Accessories`
    : "ASSEY Atelier — Premium Handbags & Luxury Accessories";
  const description = settings.site_description
    ? settings.site_description
    : "Discover ASSEY Atelier's curated collection of premium leather handbags.";
  const keywords = settings.site_keywords
    ? settings.site_keywords.split(",").map((k: string) => k.trim())
    : ["handbags", "luxury", "leather", "atelier", "fashion", "accessories"];

  return {
    title,
    description,
    keywords,
    openGraph: {
      title: settings.site_name ? `${settings.site_name} — Premium Handbags` : "ASSEY Atelier — Premium Handbags",
      description,
      type: "website",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#fbf6ee",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>): JSX.Element {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="min-h-screen bg-background text-ink antialiased">{children}</body>
    </html>
  );
}
