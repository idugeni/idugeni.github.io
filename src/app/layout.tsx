/**
 * @module RootLayout
 * @description Modul yang menangani layout utama aplikasi dan konfigurasi tema
 */

import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { metadata as siteMetadata } from "./metadata";

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
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
