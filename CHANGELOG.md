# Changelog

Semua perubahan penting pada proyek ini akan didokumentasikan dalam file ini.

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

## [Unreleased]
- Integrasi dengan AI untuk personalisasi konten
- Sistem notifikasi real-time
- Multi-language support
- Progressive Web App (PWA) implementation