/**
 * Modul konfigurasi metadata untuk aplikasi web.
 * @module metadata
 */

/**
 * Konfigurasi metadata untuk SEO dan tampilan halaman.
 * Berisi pengaturan judul, deskripsi, dan ikon aplikasi.
 * 
 * @constant
 * @type {Object}
 * @property {string} title - Judul halaman web yang akan ditampilkan di tab browser
 * @property {string} description - Deskripsi singkat tentang website untuk SEO
 * @property {Object} icons - Konfigurasi ikon website
 * @property {string} icons.icon - Path ke file favicon
 */
export const metadata = {
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
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
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
    google: "google-site-verification_code",
    yandex: "yandex-verification_code",
    bing: "msvalidate.01.verification_code"
  }
};