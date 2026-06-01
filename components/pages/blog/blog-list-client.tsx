"use client";

import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { PageHeader } from "@/components/ui/page-header";
import { HiClock, HiEye, HiHeart, HiSignal, HiTag } from "react-icons/hi2";
import { FiChevronLeft, FiChevronRight, FiGrid, FiLayers } from "react-icons/fi";
import type { BlogListClientProps } from "@/types/pages";

function getCategoryHref(categoryId?: string, page?: number) {
  const params = new URLSearchParams();
  if (categoryId) params.set("category", categoryId);
  if (page && page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/blog?${query}` : "/blog";
}

export function BlogListClient({
  articles,
  categories,
  activeCategory,
  pagination,
}: BlogListClientProps) {
  const featuredArticle = articles[0] ?? null;
  const regularArticles = articles.slice(1);
  const activeCategoryName = categories.find((c) => c.id === activeCategory)?.nama;
  const currentPage = pagination?.page ?? 1;
  const totalPages = pagination?.totalPages ?? 1;
  const totalItems = pagination?.totalItems ?? articles.length;

  return (
    <div className="pt-4 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          badge="Live Feed"
          badgeIcon={<HiSignal className="w-3 h-3 animate-pulse" />}
          title="TRANSMISSIONS // BLOG"
          description="Dispatches from the digital frontier — insights, tutorials, and explorations."
        />

        {featuredArticle && (
          <div className="mb-16">
            <Link href={`/blog/${featuredArticle.slug}`} className="block group">
              <div className="relative overflow-hidden rounded-xl bg-black shadow-2xl shadow-black/50">
                <div className="relative h-[340px] md:h-[440px] overflow-hidden">
                  {featuredArticle.thumbnailUrl && (
                    <Image
                      src={featuredArticle.thumbnailUrl}
                      alt={featuredArticle.judul}
                      fill
                      className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
                      sizes="(max-width: 768px) 100vw, 1200px"
                      priority
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/10" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />

                  <div className="absolute top-5 left-5 md:top-8 md:left-8">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-sm font-mono text-[10px] text-primary uppercase tracking-widest backdrop-blur-md">
                      <FiLayers className="w-3 h-3" />
                      Featured
                    </span>
                  </div>

                  {featuredArticle.waktuBaca && (
                    <div className="absolute top-5 right-5 md:top-8 md:right-8">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-black/50 backdrop-blur-md rounded-sm font-mono text-[10px] text-white/70">
                        <HiClock className="w-3 h-3" />
                        {featuredArticle.waktuBaca} min read
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 border border-primary/20 rounded-sm font-mono text-[10px] text-primary uppercase tracking-wider">
                        <HiTag className="w-3 h-3" />
                        {categories.find((c) => c.id === featuredArticle.kategoriId)?.nama ?? "GENERAL"}
                      </span>
                      <span className="font-mono text-[11px] text-white/50">
                        {featuredArticle.publishedAt
                          ? format(new Date(featuredArticle.publishedAt), "dd MMM yyyy")
                          : "DRAFT"}
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-4xl font-orbitron font-bold text-white mb-4 leading-tight group-hover:text-primary transition-colors duration-500">
                      {featuredArticle.judul}
                    </h2>
                    <p className="font-mono text-sm text-white/60 line-clamp-2 max-w-2xl mb-6">
                      {featuredArticle.ringkasan}
                    </p>
                    <div className="flex items-center gap-6 font-mono text-xs text-white/40">
                      <span className="flex items-center gap-1.5">
                        <HiEye className="w-3.5 h-3.5" /> {featuredArticle.jumlahView}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <HiHeart className="w-3.5 h-3.5" /> {featuredArticle.jumlahLike}
                      </span>
                      <span className="ml-auto inline-flex items-center gap-1.5 text-primary font-medium group-hover:gap-2.5 transition-all duration-300">
                        Read Article <FiChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-3 space-y-8">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <FiGrid className="w-4 h-4 text-primary" />
              <h2 className="font-orbitron text-lg font-bold tracking-wide">
                ALL TRANSMISSIONS
              </h2>
              <span className="font-mono text-[10px] text-muted-foreground bg-primary/5 border border-primary/20 px-2.5 py-0.5 rounded-sm">
                {totalItems} entries
              </span>
              {activeCategoryName && (
                <span className="font-mono text-[10px] text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-sm">
                  {activeCategoryName.toUpperCase()}
                </span>
              )}
            </div>

            {regularArticles.length === 0 ? (
              <ScrollReveal>
                <div className="p-16 text-center border border-dashed border-primary/20 rounded-xl bg-card/50">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/5 border border-primary/20 mb-4">
                    <HiSignal className="w-7 h-7 text-primary/40" />
                  </div>
                  <p className="font-orbitron text-lg text-muted-foreground mb-2">
                    NO_TRANSMISSIONS_FOUND
                  </p>
                  <p className="font-mono text-xs text-muted-foreground/60">
                    Signal lost. Try adjusting your frequency filters.
                  </p>
                </div>
              </ScrollReveal>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {regularArticles.map((article, i) => (
                  <ScrollReveal key={article.id} delay={i * 60}>
                    <Link href={`/blog/${article.slug}`} className="block h-full">
                      <div className="group h-full rounded-xl overflow-hidden bg-card/80 backdrop-blur-sm border border-border/20 hover:border-primary/30 transition-all duration-500 hover:shadow-[0_8px_40px_-12px_rgba(6,182,212,0.15)] hover:-translate-y-1">
                        <div className="relative h-48 overflow-hidden bg-black">
                          {article.thumbnailUrl ? (
                            <Image
                              src={article.thumbnailUrl}
                              alt={article.judul}
                              fill
                              className="object-cover opacity-90 transition-all duration-700 group-hover:opacity-100"
                              sizes="(max-width: 768px) 100vw, 400px"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/5 to-black flex items-center justify-center">
                              <HiSignal className="w-10 h-10 text-primary/15" />
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card/80 to-transparent" />
                          <div className="absolute top-3 left-3">
                            <span className="inline-block px-2 py-0.5 bg-black/70 backdrop-blur-md rounded-sm font-mono text-[9px] text-primary uppercase tracking-wider">
                              {categories.find((c) => c.id === article.kategoriId)?.nama ?? "GENERAL"}
                            </span>
                          </div>
                        </div>

                        <div className="p-5 flex flex-col flex-1">
                          <div className="flex items-center gap-3 font-mono text-[10px] text-muted-foreground/60 mb-3">
                            <span>
                              {article.publishedAt
                                ? format(new Date(article.publishedAt), "dd MMM yyyy")
                                : "DRAFT"}
                            </span>
                            {article.waktuBaca && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                <span className="flex items-center gap-1">
                                  <HiClock className="w-2.5 h-2.5" /> {article.waktuBaca} min
                                </span>
                              </>
                            )}
                          </div>
                          <h3 className="font-orbitron text-[15px] font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300 leading-snug">
                            {article.judul}
                          </h3>
                          <p className="font-mono text-xs text-muted-foreground/70 line-clamp-2 mb-4 leading-relaxed flex-1">
                            {article.ringkasan}
                          </p>
                          <div className="flex items-center gap-4 font-mono text-[10px] text-muted-foreground/50 pt-3 border-t border-border/10">
                            <span className="flex items-center gap-1">
                              <HiEye className="w-3 h-3" /> {article.jumlahView}
                            </span>
                            <span className="flex items-center gap-1">
                              <HiHeart className="w-3 h-3" /> {article.jumlahLike}
                            </span>
                            <span className="ml-auto text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-0.5 font-medium">
                              Read <FiChevronRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            )}

            {pagination && totalPages > 1 && (
              <nav aria-label="Blog pagination" className="flex items-center justify-between pt-8 border-t border-border/30">
                <Link
                  href={pagination.hasPreviousPage ? getCategoryHref(activeCategory, currentPage - 1) : getCategoryHref(activeCategory, 1)}
                  aria-disabled={!pagination.hasPreviousPage}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-sm border px-4 py-2 font-mono text-xs transition-all duration-200",
                    pagination.hasPreviousPage
                      ? "border-primary/30 text-primary hover:bg-primary/10"
                      : "pointer-events-none border-border/20 text-muted-foreground/40"
                  )}
                >
                  <FiChevronLeft className="w-4 h-4" /> Previous
                </Link>
                <span className="font-mono text-xs text-muted-foreground">
                  Page {currentPage} / {totalPages}
                </span>
                <Link
                  href={pagination.hasNextPage ? getCategoryHref(activeCategory, currentPage + 1) : getCategoryHref(activeCategory, totalPages)}
                  aria-disabled={!pagination.hasNextPage}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-sm border px-4 py-2 font-mono text-xs transition-all duration-200",
                    pagination.hasNextPage
                      ? "border-primary/30 text-primary hover:bg-primary/10"
                      : "pointer-events-none border-border/20 text-muted-foreground/40"
                  )}
                >
                  Next <FiChevronRight className="w-4 h-4" />
                </Link>
              </nav>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <ScrollReveal delay={200}>
                <div className="rounded-xl bg-card/80 backdrop-blur-sm border border-border/20 p-5">
                  <h3 className="font-orbitron font-bold text-sm mb-4 flex items-center gap-2 text-primary">
                    <HiTag className="w-4 h-4" />
                    FREQUENCIES
                  </h3>
                  <div className="space-y-0.5">
                    <Link
                      href="/blog"
                      className={cn(
                        "block w-full text-left font-mono text-xs py-2.5 px-3 rounded-md transition-all duration-200 border-l-2",
                        !activeCategory
                          ? "border-primary text-primary bg-primary/5"
                          : "border-transparent text-muted-foreground hover:text-foreground hover:bg-white/5 hover:border-primary/30"
                      )}
                    >
                      ALL_FREQUENCIES
                    </Link>
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={getCategoryHref(cat.id)}
                        className={cn(
                          "block w-full text-left font-mono text-xs py-2.5 px-3 rounded-md transition-all duration-200 border-l-2",
                          activeCategory === cat.id
                            ? "border-primary text-primary bg-primary/5"
                            : "border-transparent text-muted-foreground hover:text-foreground hover:bg-white/5 hover:border-primary/30"
                        )}
                      >
                        {cat.nama.toUpperCase()}
                      </Link>
                    ))}
                  </div>
                </div>

                {articles.length > 0 && (
                  <div className="rounded-xl bg-card/80 backdrop-blur-sm border border-border/20 p-5">
                    <h4 className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-3">
                      Signal Stats
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/10">
                        <div className="font-orbitron text-xl font-bold text-primary">
                          {totalItems}
                        </div>
                        <div className="font-mono text-[9px] text-muted-foreground/60 uppercase mt-1">
                          Posts
                        </div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/10">
                        <div className="font-orbitron text-xl font-bold text-primary">
                          {articles.reduce((sum, a) => sum + (a.jumlahView || 0), 0)}
                        </div>
                        <div className="font-mono text-[9px] text-muted-foreground/60 uppercase mt-1">
                          Page Views
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </ScrollReveal>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
