/**
 * Konfigurasi terpusat untuk data site owner dan branding.
 * Ubah di sini, otomatis update di seluruh aplikasi.
 */

export const siteConfig = {
  // Brand
  name: "IRNK Codes",
  tagline: "Engineering the future",
  version: "1.0.0",
  url: "https://irnk.codes",

  // Owner
  owner: {
    name: "Eliyanto Sarage",
    title: "Full Stack Developer, UI/UX Designer & AI Engineer",
    roles: ["Full Stack Developer", "UI/UX Designer", "AI Engineer", "Mobile Developer"],
    bio: "Saya tidak sekadar membangun perangkat lunak; saya merekayasa masa depan. Menggabungkan estetika cyberpunk dengan fungsionalitas presisi tinggi.",
    location: "Wonosobo, Indonesia",
    yearsExperience: "5+",
    projectsDelivered: "50+",
    happyClients: "30+",
    techMastered: "25+",
  },

  // Contact
  contact: {
    email: "irnk.codes@proton.me",
    phone: "+62 858-0064-4055",
    whatsapp: "+62 858-0064-4055",
    address: "Wonosobo, Jawa Tengah, Indonesia",
    responseTime: "< 24 jam",
  },

  // Social Media
  social: {
    github: "https://github.com/idugeni",
    instagram: "https://www.instagram.com/eliyantosarage_/",
    linkedin: "#",
    twitter: "#",
  },

  // SEO
  seo: {
    title: "IRNK Codes — Full Stack Developer, UI/UX Designer & AI Engineer | Eliyanto Sarage",
    description: "IRNK Codes oleh Eliyanto Sarage — Full Stack Developer, UI/UX Designer, dan AI Engineer di Indonesia. Spesialis Next.js, React, TypeScript, dan Python. Membangun solusi digital premium untuk bisnis dan startup.",
    keywords: [
      "Eliyanto Sarage",
      "IRNK Codes",
      "irnk.codes",
      "Full Stack Developer",
      "Full Stack Developer Indonesia",
      "UI/UX Designer",
      "AI Engineer",
      "Web Developer Indonesia",
      "Next.js Developer",
      "React Developer",
      "TypeScript Developer",
      "Python Developer",
      "Software Engineer Indonesia",
      "Jasa Pembuatan Website",
      "Jasa Web Developer",
      "Portfolio Developer",
      "Wonosobo Developer",
      "Frontend Developer",
      "Backend Developer",
    ],
    ogImage: "/opengraph-image.png",
    locale: "id_ID",
  },

  // Navigation
  nav: {
    main: [
      { href: "/", label: "Home" },
      { href: "/about", label: "About" },
      { href: "/projects", label: "Projects" },
      { href: "/services", label: "Services" },
      { href: "/blog", label: "Blog" },
      { href: "/gallery", label: "Gallery" },
    ],
    footer: {
      navigation: [
        { href: "/", label: "Home" },
        { href: "/about", label: "About" },
        { href: "/projects", label: "Projects" },
        { href: "/blog", label: "Blog" },
        { href: "/gallery", label: "Gallery" },
        { href: "/resume", label: "Resume" },
        { href: "/contact", label: "Contact" },
      ],
      services: [
        { href: "/services", label: "Web Development" },
        { href: "/services", label: "AI & ML Integration" },
        { href: "/services", label: "UI/UX Design" },
        { href: "/services", label: "Mobile Development" },
        { href: "/services", label: "DevOps & Cloud" },
        { href: "/services", label: "Technical Consulting" },
      ],
      legal: [
        { href: "/privacy", label: "Privacy Policy" },
        { href: "/terms", label: "Terms of Service" },
        { href: "/sitemap", label: "Sitemap" },
        { href: "/feed.xml", label: "RSS Feed" },
      ],
    },
  },
} as const;

export type SiteConfig = typeof siteConfig;
