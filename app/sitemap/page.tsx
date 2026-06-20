import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { PublicLayout } from "@/components/layout/public-layout";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import { PageHeader } from "@/components/ui/page-header";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { createPublicClient } from "@/lib/supabase/public";
import { ExternalLink, FileText, Globe } from "@/lib/icons";

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

async function getSitemapSections(): Promise<SitemapSection[]> {
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
        { href: "/feed", label: "RSS Feed", description: "Berlangganan via RSS" },
      ],
    },
  ];
}

function SitemapFallback() {
  return (
    <div className="sr-only" role="status" aria-live="polite">
      Memuat peta situs...
    </div>
  );
}

async function SitemapContent() {
  const sections = await getSitemapSections();

  return (
    <div className="space-y-8">
      {sections.map((section, index) => (
        <ScrollReveal key={section.title} delay={index * 70}>
          <section className="glass-card group relative overflow-hidden p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_32px_rgba(6,182,212,0.08)] sm:p-6">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-60" />
            <div className="mb-5 flex flex-col gap-3 border-b border-primary/15 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 font-orbitron text-xs font-bold text-primary shadow-[0_0_18px_rgba(6,182,212,0.12)]">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div>
                  <h2 className="font-orbitron text-lg font-bold text-primary">
                    {section.title}
                  </h2>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground/70">
                    {section.links.length} node tersedia
                  </p>
                </div>
              </div>
              <span className="w-fit rounded-full border border-primary/20 bg-primary/5 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-primary/80">
                PUBLIC_ROUTE
              </span>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group/link flex min-h-14 items-start gap-3 rounded-xl border border-border/30 bg-background/20 px-3 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-primary/5"
                  >
                    <span className="mt-1 shrink-0 font-mono text-xs text-primary/60 transition-colors group-hover/link:text-primary">→</span>
                    <span className="min-w-0">
                      <span className="block truncate font-mono text-sm text-foreground transition-colors group-hover/link:text-primary">
                        {link.label}
                      </span>
                      {link.description && (
                        <span className="mt-1 block font-mono text-[11px] leading-relaxed text-muted-foreground/70">
                          {link.description}
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </ScrollReveal>
      ))}
    </div>
  );
}

export default function SitemapPage() {
  return (
    <PublicLayout>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Sitemap", url: "/sitemap" },
        ]}
      />
      <div className="min-h-screen pb-20 pt-4">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <PageHeader
            badge="~/sitemap --public-index"
            badgeIcon={<Globe className="h-4 w-4" />}
            title="SITEMAP"
            description="Peta navigasi lengkap untuk halaman publik, artikel, proyek, layanan, dan endpoint crawler IRNK Codes."
          />

          <ScrollReveal delay={80}>
            <section className="mb-8 grid gap-4 md:grid-cols-3">
              {[
                { href: "/sitemap.xml", label: "Sitemap XML", icon: FileText },
                { href: "/feed", label: "RSS Feed", icon: ExternalLink },
                { href: "/robots.txt", label: "Robots.txt", icon: Globe },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="glass-card flex items-center gap-3 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-primary/5"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block font-orbitron text-sm font-bold text-foreground">
                        {item.label}
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        crawler endpoint
                      </span>
                    </span>
                  </Link>
                );
              })}
            </section>
          </ScrollReveal>

          <Suspense fallback={<SitemapFallback />}>
            <SitemapContent />
          </Suspense>
        </div>
      </div>
    </PublicLayout>
  );
}
