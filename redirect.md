# Konfigurasi Redirect

Dokumen ini menjelaskan tentang konfigurasi redirect yang diimplementasikan di website ini menggunakan Next.js.

## Cara Kerja

Konfigurasi redirect diatur untuk mengalihkan semua rute dari domain utama (`oldsoul.id`) ke subdomain blog (`blog.oldsoul.id`), dengan beberapa pengecualian untuk halaman-halaman tertentu.

### Contoh Pengalihan

Ketika mengakses URL di domain utama:
- `oldsoul.id/artikel-contoh` → akan diarahkan ke `blog.oldsoul.id/artikel-contoh`
- `oldsoul.id/kategori/teknologi` → akan diarahkan ke `blog.oldsoul.id/kategori/teknologi`

### Pengecualian

Beberapa rute berikut akan tetap diakses di domain utama (`oldsoul.id`) dan tidak akan dialihkan:

#### Halaman Utama
- `/about` - Halaman tentang saya
- `/contact` - Halaman kontak
- `/projects` - Halaman portfolio proyek
- `/resume` - Halaman resume

#### File Sistem dan SEO
- `/robots.txt` - File konfigurasi untuk web crawler
- `/sitemap.xml` - Peta situs untuk SEO
- `/favicon.ico` - Favicon website

#### API dan Aset
- `/api/*` - Endpoint API
- `/public/*` - Aset statis seperti gambar dan file

## Implementasi

Konfigurasi redirect diimplementasikan di `next.config.ts` menggunakan fitur `redirects()` dari Next.js. Pengalihan hanya akan terjadi ketika header host adalah `oldsoul.id` dan rute yang diakses bukan termasuk dalam daftar pengecualian.

Dengan konfigurasi ini, konten blog dapat diorganisir dengan rapi di subdomain terpisah, sementara halaman-halaman utama tetap dapat diakses di domain utama.