"use client";

import Link from "next/link";
import Image from "next/image";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Button } from "@/components/ui/button";
import { HiOutlineArrowRight } from "react-icons/hi2";
import type { LatestArticlesProps } from "@/types/pages";
import {
  getSafeImageSource,
  shouldBypassImageOptimization,
} from "@/lib/utils/image-source";

export function LatestArticles({ articles }: LatestArticlesProps) {
  if (!articles || articles.length === 0) return null;

  return (
    <section className="py-24 bg-card relative section-fade">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-orbitron font-bold neon-text">
              LATEST_TRANSMISSIONS
            </h2>
            <Link href="/blog">
              <Button
                variant="ghost"
                className="font-mono text-primary hover:text-primary/80"
              >
                VIEW_ALL <HiOutlineArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((article, i) => (
            <ScrollReveal key={article.id} delay={i * 150}>
              <Link href={`/blog/${article.slug}`}>
                <div className="glass-card h-full flex flex-col overflow-hidden group cursor-pointer hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] transition-shadow">
                  {getSafeImageSource(article.thumbnailUrl) && (
                    <div className="relative h-40 overflow-hidden border-b border-primary/20">
                      <Image
                        src={getSafeImageSource(article.thumbnailUrl)!}
                        alt={article.judul}
                        fill
                        className="object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                        sizes="(max-width: 768px) 100vw, 350px"
                        unoptimized={shouldBypassImageOptimization(article.thumbnailUrl)}
                      />
                    </div>
                  )}
                  <div className="p-5 flex-1 flex flex-col">
                    <span className="text-[10px] font-mono text-primary uppercase mb-2">
                      {article.publishedAt
                        ? new Date(article.publishedAt).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : ""}
                    </span>
                    <h3 className="font-orbitron font-bold text-sm mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {article.judul}
                    </h3>
                    <p className="text-muted-foreground font-mono text-xs line-clamp-2 flex-1">
                      {article.ringkasan}
                    </p>
                    <div className="flex items-center gap-3 mt-3 font-mono text-[10px] text-muted-foreground">
                      <span>{article.jumlahView} views</span>
                      <span>•</span>
                      <span>{article.jumlahLike} likes</span>
                    </div>
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
