import { siteConfig } from "@/lib/config/site";

export const resumeData = {
  owner: siteConfig.owner.name,
  headline: "Full Stack Developer, UI/UX Designer & AI Engineer",
  location: siteConfig.owner.location,
  email: siteConfig.contact.email,
  phone: siteConfig.contact.phone,
  website: siteConfig.url.replace("https://", ""),
  github: siteConfig.social.github.replace("https://", ""),
  instagram: siteConfig.social.instagram.replace("https://www.", ""),
  availability: "Available for selected remote, freelance, and product engineering collaborations",
  summary:
    "Engineer produk digital yang menggabungkan full stack development, desain UI/UX premium, dan integrasi AI untuk membangun aplikasi web modern yang cepat, aman, dan siap produksi. Berpengalaman merancang pengalaman publik, dashboard admin, automasi, sistem konten, dan solusi berbasis data dengan pendekatan server-first, scalable, dan maintainable.",
  metrics: [
    { label: "Years Experience", value: siteConfig.owner.yearsExperience },
    { label: "Projects Delivered", value: siteConfig.owner.projectsDelivered },
    { label: "Client Satisfaction", value: siteConfig.owner.happyClients },
    { label: "Technologies", value: siteConfig.owner.techMastered },
  ],
  focusAreas: [
    "Next.js App Router & React Server Components",
    "Production-grade frontend architecture",
    "Supabase, PostgreSQL, Auth, Storage & Realtime",
    "AI-assisted automation and intelligent workflows",
    "Premium UI systems, responsive UX, and design tokens",
    "Performance optimization, SEO, accessibility, and security hardening",
  ],
  experience: [
    {
      role: "Full Stack Developer & AI Engineer",
      company: "IRNK Codes",
      period: "2021 — Present",
      location: "Remote / Indonesia",
      description:
        "Membangun aplikasi web, sistem konten, dashboard admin, dan solusi automasi berbasis AI dengan stack modern berorientasi performa, keamanan, dan maintainability.",
      highlights: [
        "Merancang aplikasi portfolio/blog/service platform berbasis Next.js App Router, Supabase, Server Actions, dan Route Handlers.",
        "Mengimplementasikan admin CMS, analytics, gallery management, newsletter flow, shortlinks, dan content publishing workflow.",
        "Mengoptimalkan Core Web Vitals, metadata, Open Graph, sitemap, robots, caching, dan streaming boundaries untuk pengalaman publik yang cepat.",
        "Menerapkan validasi input, sanitasi HTML, auth checks, dan security headers untuk mengurangi risiko produksi.",
      ],
    },
    {
      role: "UI/UX Designer & Frontend Engineer",
      company: "Independent Projects",
      period: "2019 — 2021",
      location: "Indonesia",
      description:
        "Mendesain dan membangun antarmuka web/mobile dengan fokus pada visual identity, motion, accessibility, dan konsistensi design system.",
      highlights: [
        "Membuat landing page, dashboard, dan komponen interaktif dengan pendekatan reusable component system.",
        "Menerjemahkan kebutuhan bisnis menjadi user flow, wireframe, visual design, dan implementasi frontend responsif.",
        "Mengintegrasikan desain cyberpunk/premium dengan prinsip usability agar tetap cepat, jelas, dan scalable.",
      ],
    },
  ],
  projects: [
    {
      name: "IRNK Codes Platform",
      category: "Portfolio, Blog, CMS, Analytics",
      impact:
        "Platform publik dan admin terpadu dengan SEO, Open Graph, dashboard, Supabase integration, newsletter, gallery, shortlinks, dan production-grade routing.",
    },
    {
      name: "AI Workflow Integrations",
      category: "Automation & AI Engineering",
      impact:
        "Automasi workflow dan intelligent content/process tooling untuk mempercepat pekerjaan operasional dan meningkatkan konsistensi output.",
    },
    {
      name: "Premium Web Interfaces",
      category: "Frontend & UI Systems",
      impact:
        "UI publik modern dengan responsive layout, visual hierarchy kuat, dark cyberpunk aesthetic, micro-interactions, dan komponen reusable.",
    },
  ],
  skillGroups: [
    {
      label: "Frontend",
      skills: ["Next.js", "React", "TypeScript", "Tailwind CSS", "RSC", "App Router", "shadcn/ui", "Radix UI"],
    },
    {
      label: "Backend",
      skills: ["Server Actions", "Route Handlers", "Node.js", "PostgreSQL", "Supabase", "Auth", "Storage", "Realtime"],
    },
    {
      label: "AI & Automation",
      skills: ["AI Agents", "Workflow Automation", "Prompt Systems", "Content Pipelines", "Python", "API Integration"],
    },
    {
      label: "Production",
      skills: ["SEO", "Caching", "Security", "Performance", "Vercel", "CI Verification", "Observability", "Accessibility"],
    },
    {
      label: "Design",
      skills: ["UI/UX", "Design Systems", "Responsive Design", "Interaction Design", "Visual Identity", "Micro Animations"],
    },
  ],
  capabilities: [
    {
      title: "Full Stack Product Builds",
      description: "Membangun aplikasi dari konsep, arsitektur data, UI, backend, auth, CMS, hingga deployment produksi.",
    },
    {
      title: "App Router Optimization",
      description: "Mengoptimalkan server/client boundaries, streaming, caching, metadata, dan performa route publik maupun admin.",
    },
    {
      title: "Secure Admin Systems",
      description: "Dashboard admin dengan validasi input, auth enforcement, role-aware flows, dan pengamanan data sensitif.",
    },
    {
      title: "AI-Enhanced Workflows",
      description: "Integrasi AI dan automasi untuk mempercepat produksi konten, analisis, dan proses operasional.",
    },
  ],
  education: [
    {
      title: "Continuous Software Engineering Practice",
      institution: "Self-directed, project-based learning",
      period: "Ongoing",
      description:
        "Fokus pada Next.js, React, TypeScript, Supabase, AI engineering, secure coding, performance, dan production operations.",
    },
    {
      title: "UI/UX & Product Design Practice",
      institution: "Independent design systems and product builds",
      period: "Ongoing",
      description:
        "Pendalaman visual hierarchy, accessibility, responsive design, user flow, brand consistency, dan implementation-ready UI systems.",
    },
  ],
  languages: ["Indonesian — Native", "English — Professional working proficiency"],
} as const;

export type ResumeData = typeof resumeData;
