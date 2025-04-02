/**
 * @module RootLayout
 * @description Modul yang menangani layout utama aplikasi dan konfigurasi tema
 */

import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from '@vercel/speed-insights/next';
import "./globals.css";
import { metadata as siteMetadata } from "@/lib/metadata";
import Footer from "@/components/layout/footer";
import { BackToTop } from "@/components/back-to-top";

/**
 * @constant {Object} geistSans
 * @description Konfigurasi font Geist Sans untuk tampilan umum
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

/**
 * @constant {Object} geistMono
 * @description Konfigurasi font Geist Mono untuk tampilan kode
 */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = siteMetadata;

/**
 * @function RootLayout
 * @description Komponen layout utama yang membungkus seluruh aplikasi
 * @param {Object} props - Props komponen
 * @param {React.ReactNode} props.children - Konten child yang akan dirender
 * @returns {JSX.Element} Komponen React yang merender layout utama
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col">
            <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">{children}</main>
            <Footer />
            <BackToTop />
            <Analytics />
            <SpeedInsights />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
