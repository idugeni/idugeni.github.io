"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { ArrowLeft, Clock, Eye, Heart } from "@/lib/icons";
import { ReadingProgressBar, TableOfContents, MobileTocDrawer, extractHeadings, useActiveHeading, scrollToHeading } from "./blog-toc";
import { ViewTracker, BlogActionBar } from "./blog-actions";
import { CommentSection } from "./blog-comments";
import { getAspectRatioClass } from "@/lib/utils/aspect-ratio";
import { getSafeImageSource, shouldBypassImageOptimization } from "@/lib/utils/image-source";
import { formatCompactNumber } from "@/lib/utils";
import type { BlogDetailClientProps } from "@/types/pages";

export function BlogDetailClient({
  article,
  comments: initialComments,
  relatedArticles,
  processedContent,
}: BlogDetailClientProps) {
  const [showComments, setShowComments] = useState(false);
  const headings = useMemo(() => extractHeadings(article.konten), [article.konten]);
  const readingTime = useMemo(() => Math.max(1, Math.ceil(article.konten.split(/\s+/).length / 200)), [article.konten]);
  const activeHeadingId = useActiveHeading(headings);

  return (
    <>
      <ViewTracker articleId={article.id} />
      <ReadingProgressBar />
      <MobileTocDrawer headings={headings} activeId={activeHeadingId} onItemClick={scrollToHeading} />

      <div className="pt-4 pb-16 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-8">
            <div className="min-w-0">
              <ScrollReveal>
                <Link href="/blog" prefetch={false}>
                  <Button variant="ghost" className="mb-6 font-mono text-muted-foreground hover:text-primary">
                    <ArrowLeft className="mr-2 h-4 w-4" /> BACK_TO_FEED
                  </Button>
                </Link>

                <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-muted-foreground uppercase mb-4">
                  <span className="text-primary border border-primary/30 bg-primary/10 px-3 py-1 rounded-full">GENERAL</span>
                  <span>{article.publishedAt ? format(new Date(article.publishedAt), "dd MMM yyyy") : "UNKNOWN"}</span>
                  <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {readingTime} MIN</span>
                  <span className="flex items-center"><Eye className="w-3 h-3 mr-1" /> {formatCompactNumber(article.jumlahView)}</span>
                  <span className="flex items-center"><Heart className="w-3 h-3 mr-1" /> {formatCompactNumber(article.jumlahLike)}</span>
                </div>

                <h1 className="text-3xl md:text-4xl font-orbitron font-bold mb-8 leading-tight">{article.judul}</h1>
                <p className="text-muted-foreground font-mono text-base mb-8 border-l-2 border-primary/50 pl-4 italic">{article.ringkasan}</p>
              </ScrollReveal>

              {getSafeImageSource(article.thumbnailUrl) && (
                <ScrollReveal delay={100}>
                  <div className={`w-full ${getAspectRatioClass(article.thumbnailAspectRatio)} border border-primary/30 rounded-lg overflow-hidden mb-10 shadow-[0_0_30px_rgba(6,182,212,0.1)] relative`}>
                    <Image
                      src={getSafeImageSource(article.thumbnailUrl)!}
                      alt={article.judul}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 800px"
                      loading="eager"
                      fetchPriority="high"
                      unoptimized={shouldBypassImageOptimization(article.thumbnailUrl)}
                    />
                  </div>
                </ScrollReveal>
              )}

              <ScrollReveal delay={150}>
                <article className="irnk-prose text-justify" dangerouslySetInnerHTML={{ __html: processedContent }} />
              </ScrollReveal>

              <div className="mt-12 pt-8 border-t border-primary/20">
                <BlogActionBar
                  articleId={article.id}
                  initialViewCount={article.jumlahView}
                  initialLikeCount={article.jumlahLike}
                  commentCount={initialComments.length}
                  onToggleComments={() => setShowComments(!showComments)}
                />
              </div>

              <CommentSection articleId={article.id} initialComments={initialComments} />

              {relatedArticles.length > 0 && (
                <div className="mt-12 pt-8 border-t border-primary/20">
                  <h3 className="font-orbitron font-bold text-lg mb-6">RELATED_TRANSMISSIONS</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {relatedArticles.map((rel) => (
                      <Link key={rel.id} href={`/blog/${rel.slug}`}>
                        <div className="border border-border/50 bg-secondary/30 p-4 hover:border-primary/50 transition-colors cursor-pointer group h-full">
                          {getSafeImageSource(rel.thumbnailUrl) && (
                            <div className="relative w-full h-24 mb-3 overflow-hidden border border-primary/20">
                              <Image
                                src={getSafeImageSource(rel.thumbnailUrl)!}
                                alt={rel.judul}
                                fill
                                className="object-cover grayscale group-hover:grayscale-0 transition-all"
                                sizes="(max-width: 768px) 100vw, 250px"
                                unoptimized={shouldBypassImageOptimization(rel.thumbnailUrl)}
                              />
                            </div>
                          )}
                          <h4 className="font-orbitron text-sm font-bold group-hover:text-primary transition-colors line-clamp-2">{rel.judul}</h4>
                          <p className="font-mono text-xs text-muted-foreground mt-2 line-clamp-2">{rel.ringkasan}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside className="hidden lg:block" aria-label="Article sidebar">
              <div className="sticky top-24">
                <TableOfContents headings={headings} activeId={activeHeadingId} onItemClick={scrollToHeading} />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
