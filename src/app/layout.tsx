import { Playfair_Display, Merriweather } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from '@vercel/speed-insights/next';
import "./globals.css";
import { metadata as siteMetadata } from "@/lib/metadata";
import Footer from "@/components/layout/footer";
import { BackToTop } from "@/components/back-to-top";
import { Toaster } from "@/components/ui/sonner";

const playfair = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
  fallback: ["serif"],
  preload: true,
  adjustFontFallback: true
});

const merriweather = Merriweather({
  variable: "--font-merriweather", 
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  display: "swap",
  fallback: ["serif"],
  preload: true,
  adjustFontFallback: true
});

export const metadata = siteMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${merriweather.variable} antialiased min-h-screen bg-background`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col">
            <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">{children}</main>
            <Footer />
            <BackToTop />
            <Analytics />
            <SpeedInsights />
            <Toaster />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
