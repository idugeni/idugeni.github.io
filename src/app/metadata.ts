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
  title: "IduGeni - Personal Portfolio",
  description: "Welcome to my personal portfolio website where I showcase my projects and skills",
  icons: {
    icon: "/favicon.png"
  }
};