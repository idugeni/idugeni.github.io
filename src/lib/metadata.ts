/**
 * @module metadata
 * @description Modul yang menangani konfigurasi metadata untuk aplikasi web, termasuk SEO dan tampilan halaman
 * @since 1.0.0
 */

/**
 * @typedef {Object} TwitterMetadata
 * @property {string} card - Tipe kartu Twitter (summary_large_image)
 * @property {string} title - Judul untuk tampilan di Twitter
 * @property {string} description - Deskripsi untuk tampilan di Twitter
 * @property {string[]} images - Array URL gambar untuk tampilan di Twitter
 * @property {string} creator - Username Twitter pemilik website
 */

/**
 * @typedef {Object} RobotsMetadata
 * @property {boolean} index - Mengizinkan pengindeksan halaman
 * @property {boolean} follow - Mengizinkan penelusuran link
 * @property {Object} googleBot - Konfigurasi khusus untuk Google Bot
 */

/**
 * @typedef {Object} OpenGraphImage
 * @property {string} url - URL gambar
 * @property {number} width - Lebar gambar dalam pixel
 * @property {number} height - Tinggi gambar dalam pixel
 * @property {string} alt - Teks alternatif untuk gambar
 */

/**
 * @typedef {Object} OpenGraphMetadata
 * @property {string} type - Tipe konten OpenGraph
 * @property {string} locale - Kode bahasa dan wilayah
 * @property {string} url - URL kanonikal website
 * @property {string} siteName - Nama website
 * @property {string} title - Judul untuk tampilan OpenGraph
 * @property {string} description - Deskripsi untuk tampilan OpenGraph
 * @property {OpenGraphImage[]} images - Array objek gambar untuk OpenGraph
 */

import { validateMetadata } from "./validateMetadata";

/**
 * Konfigurasi metadata untuk SEO dan tampilan halaman.
 * Berisi pengaturan untuk mesin pencari, media sosial, dan tampilan browser.
 * 
 * @constant
 * @type {Object}
 * @property {string} title - Judul halaman web yang akan ditampilkan di tab browser
 * @property {string} description - Deskripsi singkat tentang website untuk SEO
 * @property {string} keywords - Kata kunci yang relevan untuk SEO
 * @property {Object} icons - Konfigurasi ikon website
 * @property {string} icons.icon - Path ke file favicon
 * @property {URL} metadataBase - URL dasar untuk metadata relatif
 * @property {Object} alternates - Konfigurasi URL alternatif
 * @property {string} alternates.canonical - URL kanonikal website
 * @property {TwitterMetadata} twitter - Konfigurasi metadata untuk Twitter Cards
 * @property {RobotsMetadata} robots - Konfigurasi untuk robot crawler
 * @property {OpenGraphMetadata} openGraph - Konfigurasi metadata untuk OpenGraph
 * @property {Object} verification - Kode verifikasi untuk layanan webmaster
 * @see {@link https://nextjs.org/docs/app/api-reference/functions/generate-metadata Metadata API Next.js}
 */
export const metadata = validateMetadata({
  title: "Eliyanto Sarage - Pengembang Web Full Stack & Portfolio",
  description: "Portfolio profesional Eliyanto Sarage, pengembang web full stack dengan keahlian dalam React, Node.js, dan teknologi modern. Lihat proyek terbaru dan pengalaman saya dalam pengembangan aplikasi web enterprise.",
  keywords: "pengembang web, full stack developer, react developer, node.js developer, portfolio web developer, web development indonesia",
  icons: {
    icon: "/favicon.png"
  },
  metadataBase: new URL("https://oldsoul.id"),
  alternates: {
    canonical: "https://oldsoul.id"
  },
  twitter: {
    card: "summary_large_image",
    title: "Eliyanto Sarage - Pengembang Web Full Stack & Portfolio",
    description: "Portfolio profesional Eliyanto Sarage, pengembang web full stack dengan keahlian dalam React, Node.js, dan teknologi modern.",
    images: ["https://oldsoul.id/thumbnail.png"],
    creator: "@eliyantosarage"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': 30,
      'max-image-preview': 'large',
      'max-snippet': 50
    }
  } as const,
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://oldsoul.id",
    siteName: "Eliyanto Sarage Portfolio",
    title: "Eliyanto Sarage - Pengembang Web Full Stack & Portfolio",
    description: "Portfolio profesional Eliyanto Sarage, pengembang web full stack dengan keahlian dalam React, Node.js, dan teknologi modern. Lihat proyek terbaru dan pengalaman saya dalam pengembangan aplikasi web enterprise.",
    images: [
      {
        url: "/thumbnail.png",
        width: 1200,
        height: 630,
        alt: "Eliyanto Sarage Portfolio Preview - Pengembang Web Full Stack"
      }
    ]
  },
  verification: {
    google: "A8fHl75zCCT4JkAAiEkw_t9bxs07JyH0Z0gclsIFG7A",
    yandex: "yandex-verification_code"
  }
});