import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
  fallback: ["system-ui", "Arial", "sans-serif"],
});
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { CommandPalette } from "@/components/CommandPalette";
import { JsonLd } from "@/components/JsonLd";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mineralwater.com";

export const metadata: Metadata = {
  title: {
    default: "MineralWater — Find Your Perfect Water",
    template: "%s — MineralWater",
  },
  description:
    "Compare mineral water brands by mineral content. Track your hydration. Find the best water for your health goals.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "MineralWater",
    title: "MineralWater — Find Your Perfect Water",
    description:
      "Compare mineral water brands by mineral content. Track your hydration. Find the best water for your health goals.",
  },
  twitter: {
    card: "summary_large_image",
    title: "MineralWater — Find Your Perfect Water",
    description:
      "Compare mineral water brands by mineral content. Track your hydration. Find the best water for your health goals.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased ${roboto.className} ${roboto.variable}`}>
      <body className="min-h-full flex flex-col">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "MineralWater",
            url: siteUrl,
            logo: `${siteUrl}/favicon.ico`,
            description:
              "Compare mineral water brands by mineral content. Track your hydration.",
            sameAs: [],
          }}
        />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "MineralWater",
            url: siteUrl,
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: `${siteUrl}/brands?q={search_term_string}`,
              },
              "query-input": "required name=search_term_string",
            },
          }}
        />
        <Header />
        <main className="flex-1 pt-16 pb-16 md:pb-0">{children}</main>
        <Footer />
        <BottomNav />
        <CommandPalette />
      </body>
    </html>
  );
}
