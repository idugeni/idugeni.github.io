import { Inter, Montserrat } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from '@vercel/speed-insights/next';
import "./globals.css";
import { metadata as siteMetadata } from "@/lib/metadata";
import Footer from "@/components/layout/FooterTemp";
import { BackToTop } from "@/components/layout/BackToTop";
import { Toaster } from "@/components/ui/sonner";

// Font utama yang modern dan tegas untuk judul dan heading
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
  preload: true,
  adjustFontFallback: true
});

// Font sekunder yang bersih dan mudah dibaca untuk konten
const inter = Inter({
  variable: "--font-inter", 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
  preload: true,
  adjustFontFallback: true
});

// Font untuk kode (menggunakan variabel CSS untuk konsistensi)
const fontMono = { variable: "--font-mono" };

export const metadata = {
  ...siteMetadata,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': 7,
      'max-image-preview': "large", 
      'max-snippet': 8,
    },
  },
};

/**
 * Layout root aplikasi yang membungkus seluruh halaman dengan ThemeProvider dan komponen global.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${montserrat.variable} ${inter.variable} ${fontMono.variable} antialiased min-h-screen bg-background`}
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
