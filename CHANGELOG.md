# Changelog

## [3.0.0] - 2025-04-09

### Added
- Implementasi pengambilan proyek dinamis dari GitHub API melalui route baru `/api/github-projects`, menggantikan `projects.json` statis
- Penambahan loading states dan error handling pada bagian projects
- Menampilkan gambar OpenGraph GitHub pada kartu proyek
- Penambahan `sitemap.ts` untuk menghasilkan sitemap secara otomatis untuk meningkatkan SEO

### Changed
- Migrasi verifikasi form kontak dari Cloudflare Turnstile ke Google reCAPTCHA v2
- Pembaruan tipografi situs: Inter untuk teks body, Montserrat untuk heading
- Penyegaran styling untuk komponen ProjectCard untuk presentasi visual yang lebih baik
- Pembaruan berbagai dependencies Radix UI ke versi terbaru
- Pembaruan konfigurasi Next.js, environment variables, dan konfigurasi Turborepo untuk mendukung perubahan ini

## [2.9.1] - 2025-04-08

### Added
- Form kontak aman dengan pemisahan komponen (`ContactForm`, `ContactInfo`, `TurnstileWidget`)
- API `/api/contact` dengan validasi Zod & integrasi Nodemailer
- Integrasi Cloudflare Turnstile untuk proteksi bot
- Pembatasan rate limit berbasis IP pada API kontak
- Peningkatan notifikasi email dengan IP geolokasi dan detail QR code
- Sitemap dinamis di `/api/sitemap`

### Changed
- Update `robots.txt` untuk memblokir crawler non-esensial
- Judul halaman dinamis mengikuti tab navigasi aktif
- Validasi environment variable menggunakan Zod (`lib/env.ts`)

### Dependencies
- Penambahan package `qrcode`

## [2.7.0] - 2025-04-08

### Changed
- Refactor halaman redirect untuk pemisahan komponen `RedirectContent` guna pemisahan logika client-side
- Implementasi `ignoredSlugs.ts` untuk mencegah redirect pada halaman aplikasi (seperti /about, /contact) dan aset statis
- Penyempurnaan UI notifikasi redirect dengan pesan yang lebih jelas, timer hitung mundur, serta penanganan error slug tidak valid atau diabaikan

## [2.0.0] - 2025-04-07

### Changed
- Arsitektur aplikasi yang lebih modular
- Peningkatan performa loading dengan implementasi SSR
- UI/UX yang lebih modern dan intuitif
- Sistem routing yang lebih efisien

### Fixed
- Optimasi caching untuk performa yang lebih baik
- Perbaikan masalah pada dark mode switching
- Peningkatan accessibility score ke WCAG AAA

### Security
- Implementasi rate limiting
- Peningkatan validasi input
- Penambahan CSRF protection
- Audit dan pembaruan dependencies

## [1.0.0] - 2025-04-03

### Added
- Implementasi awal website portfolio menggunakan Next.js 15.2.4
- Integrasi React 19.1.0 untuk UI development
- Integrasi TypeScript 5 untuk type safety
- Implementasi Tailwind CSS 4 untuk styling
- Integrasi Radix UI untuk komponen headless
- Fitur dark mode
- Halaman About, Projects, Resume, dan Contact
- Optimasi SEO dan performa
- Implementasi responsive design
- Integrasi dengan GitHub Pages untuk deployment

### Changed
- Upgrade ke Next.js 15.2 dari versi sebelumnya
- Pembaruan dependencies ke versi terbaru
- Peningkatan UI/UX secara keseluruhan

### Fixed
- Perbaikan masalah responsivitas pada mobile devices
- Optimasi loading time
- Perbaikan accessibility issues

### Security
- Implementasi best practices keamanan
- Penambahan security headers
- Proteksi terhadap common vulnerabilities