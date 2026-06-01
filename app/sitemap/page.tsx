import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { cacheLife, cacheTag } from "next/cache";
import { PublicLayout } from "@/components/layout/public-layout";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { createPublicClient } from "@/lib/supabase/public";

export const metadata: Metadata = {
  title: "Sitemap",
  description: "Peta situs lengkap IRNK Codes — temukan semua halaman, artikel blog, proyek, dan layanan yang tersedia.",
  alternates: {
    canonical: "https://irnk.codes/sitemap",
  },
};

interface SitemapSection {
  title: string;
  links: { href: string; label: string; description?: string }[];
}

const SITEMAP_CACHE_LIFE = {
  stale: 300,
  revalidate: 300,
  expire: 3_600,
} as const;

async function getSitemapSections(): Promise<SitemapSection[]> {
  "use cache";
  cacheLife(SITEMAP_CACHE_LIFE);
  cacheTag(CACHE_TAGS.blog, CACHE_TAGS.projects, CACHE_TAGS.services);

  const supabase = createPublicClient();
  const [articlesResult, projectsResult, servicesResult] = await Promise.all([
    supabase
      .from("blog_artikel")
      .select("judul, slug")
      .eq("status", "published")
      .order("published_at", { ascending: false }),
    supabase
      .from("projects")
      .select("nama, slug")
      .order("urutan"),
    supabase
      .from("services")
      .select("nama, slug")
      .eq("aktif", true)
      .order("urutan"),
  ]);

  const articles = articlesResult.data ?? [];
  const projects = projectsResult.data ?? [];
  const services = servicesResult.data ?? [];

  return [
    {
      title: "Halaman Utama",
      links: [
        { href: "/", label: "Home", description: "Halaman utama IRNK Codes" },
        { href: "/about", label: "About", description: "Tentang Eliyanto Sarage" },
        { href: "/contact", label: "Contact", description: "Hubungi kami" },
        { href: "/resume", label: "Resume", description: "Resume profesional" },
        { href: "/gallery", label: "Gallery", description: "Koleksi media" },
      ],
    },
    {
      title: "Blog",
      links: [
        { href: "/blog", label: "Semua Artikel", description: "Daftar semua artikel blog" },
        ...articles.map((article) => ({
          href: `/blog/${article.slug}`,
          label: article.judul,
        })),
      ],
    },
    {
      title: "Projects",
      links: [
        { href: "/projects", label: "Semua Proyek", description: "Daftar semua proyek" },
        ...projects.map((project) => ({
          href: `/projects/${project.slug}`,
          label: project.nama,
        })),
      ],
    },
    {
      title: "Services",
      links: [
        { href: "/services", label: "Semua Layanan", description: "Daftar semua layanan" },
        ...services.map((service) => ({
          href: `/services/${service.slug}`,
          label: service.nama,
        })),
      ],
    },
    {
      title: "Legal & Lainnya",
      links: [
        { href: "/privacy", label: "Privacy Policy", description: "Kebijakan privasi" },
        { href: "/terms", label: "Terms of Service", description: "Syarat dan ketentuan" },
        { href: "/sitemap.xml", label: "Sitemap XML", description: "Sitemap untuk mesin pencari" },
        { href: "/feed.xml", label: "RSS Feed", description: "Berlangganan via RSS" },
      ],
    },
  ];
}

function SitemapFallback() {
  return (
    <div className="flex min-h-[45vh] items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-primary">LOADING_SITEMAP</p>
      </div>
    </div>
  );
}

async function SitemapContent() {
  const sections = await getSitemapSections();

  return (
    <div className="space-y-10">
      {sections.map((section) => (
        <ScrollReveal key={section.title}>
          <div className="rounded-sm border border-border/50 bg-secondary/20 p-6">
            <h2 className="mb-4 border-b border-primary/20 pb-2 font-orbitron text-lg font-bold text-primary">
              {section.title}
            </h2>
            <ul className="space-y-2">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group -mx-2 flex items-baseline gap-3 rounded px-2 py-1.5 transition-colors hover:bg-primary/5"
                  >
                    <span className="shrink-0 font-mono text-xs text-primary/50">→</span>
                    <span className="font-mono text-sm text-foreground transition-colors group-hover:text-primary">
                      {link.label}
                    </span>
                    {link.description && (
                      <span className="hidden font-mono text-xs text-muted-foreground/60 sm:inline">
                        — {link.description}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </ScrollReveal>
      ))}
    </div>
  );
}

export default function SitemapPage() {
  return (
    <PublicLayout>
      <div className="min-h-screen pb-16 pt-4">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="mb-12">
              <h1 className="mb-4 font-orbitron text-4xl font-bold neon-text md:text-5xl">
                SITEMAP
              </h1>
              <p className="font-mono text-sm text-muted-foreground">
                Peta situs lengkap // Navigasi semua halaman
              </p>
            </div>
          </ScrollReveal>

          <Suspense fallback={<SitemapFallback />}>
            <SitemapContent />
          </Suspense>
        </div>
      </div>
    </PublicLayout>
  );
}
