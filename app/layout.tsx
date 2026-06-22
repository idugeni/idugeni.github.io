import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Inter, Space_Mono, Orbitron } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "@/components/ui/sonner";
import { AnnouncementBanner } from "@/components/public/AnnouncementBanner";
import { AnnouncementModal } from "@/components/public/AnnouncementModal";
import { CSRFBoundary } from "@/components/providers/csrf-boundary";
import { ScrollRevealProvider } from "@/components/providers/scroll-reveal-provider";
import { WebVitalsReporter } from "@/components/providers/web-vitals-reporter";
import { siteConfig } from "@/lib/config/site";
import "@/lib/env";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--app-font-sans",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--app-font-mono",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--app-font-orbitron",
  weight: ["400", "700", "900"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    { media: "(prefers-color-scheme: light)", color: "#06b6d4" },
  ],
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    template: `%s | ${siteConfig.name}`,
    default: siteConfig.seo.title,
  },
  description: siteConfig.seo.description,
  keywords: [...siteConfig.seo.keywords],
  authors: [{ name: siteConfig.owner.name, url: siteConfig.url }],
  creator: siteConfig.owner.name,
  publisher: siteConfig.owner.name,
  category: "technology",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-icon.png" },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: siteConfig.seo.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.seo.title,
    description: siteConfig.seo.description,
    images: [
      {
        url: siteConfig.seo.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} — ${siteConfig.seo.title}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.seo.title,
    description: siteConfig.seo.description,
    images: [siteConfig.seo.ogImage],
    creator: "@idugeni",
    site: "@idugeni",
  },
  alternates: {
    canonical: siteConfig.url,
    types: {
      "application/rss+xml": `${siteConfig.url}/feed`,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    other: {
      "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION ?? "",
    },
  },
  other: {
    "google-site-verification": process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION ?? "",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased overflow-x-hidden min-h-screen flex flex-col`}
      >
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <script dangerouslySetInnerHTML={{ __html: "if(history.scrollRestoration)history.scrollRestoration='manual';window.scrollTo(0,0);" }} />
        </head>
        <Suspense>
          <CSRFBoundary>
            <AnnouncementBanner />
            {children}
            <AnnouncementModal />
            <Toaster />
          </CSRFBoundary>
        </Suspense>
        <ScrollRevealProvider />
        <WebVitalsReporter />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
