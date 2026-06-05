"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { NeonBorder } from "@/components/ui/neon-border";
import {
  ArrowLeft,
  Clock,
  Eye,
  Heart,
  Share2,
  MessageSquare,
  Check,
  Send,
  User,
  List,
  ChevronRight,
  X,
} from "@/lib/icons";
import { useToast } from "@/hooks/use-toast";
import { toggleBlogLike, createBlogComment, trackArticleView } from "@/actions/blog";
import { createClient } from "@/lib/supabase/client";
import type { BlogDetailClientProps } from "@/types/pages";
import { getAspectRatioClass } from "@/lib/utils/aspect-ratio";

// --- Constants ---
const SCROLL_OFFSET = 96; // Match scroll-mt-24 (24 * 4px) for consistent heading detection and scrolling

// --- TOC Types & Utilities ---
interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function extractHeadings(content: string): TocHeading[] {
  const headings: TocHeading[] = [];
  const slugCount: Record<string, number> = {};

  // Parse HTML headings (h2 and h3)
  const regex = /<h([23])[^>]*>(.*?)<\/h[23]>/gi;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const level = parseInt(match[1]) as 2 | 3;
    // Strip HTML tags from heading text
    const text = match[2].replace(/<[^>]*>/g, "").trim();

    if (text) {
      let slug = slugify(text);
      if (slugCount[slug] !== undefined) {
        slugCount[slug]++;
        slug = `${slug}-${slugCount[slug]}`;
      } else {
        slugCount[slug] = 0;
      }
      headings.push({ id: slug, text, level });
    }
  }

  return headings;
}

// --- TOC Component ---
function TableOfContents({
  headings,
  activeId,
  onItemClick,
}: {
  headings: TocHeading[];
  activeId: string | null;
  onItemClick?: (id: string) => void;
}) {
  const activeItemRef = useRef<HTMLAnchorElement>(null);
  
  if (headings.length === 0) return null;

  const activeIndex = headings.findIndex((h) => h.id === activeId);
  const progressPercent =
    activeIndex >= 0 ? ((activeIndex + 1) / headings.length) * 100 : 0;

  // Auto-scroll active item into view
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [activeId]);

  return (
    <div className="border border-border/50 bg-secondary/30 p-4 rounded-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-orbitron text-xs font-bold text-primary uppercase">
          Table of Contents
        </h4>
        <span className="font-mono text-[10px] text-muted-foreground">
          {activeIndex >= 0 ? activeIndex + 1 : 0}/{headings.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-border/50 rounded-full mb-3 overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <nav aria-label="Table of contents" role="navigation">
        <ol className="space-y-0.5 list-none m-0 p-0 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40">
          {headings.map((h) => (
            <li key={h.id} className="m-0 p-0">
              <a
                ref={activeId === h.id ? activeItemRef : null}
                href={`#${h.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onItemClick?.(h.id);
                }}
                aria-current={activeId === h.id ? "location" : undefined}
                className={`
                  block font-mono text-xs py-1.5 rounded transition-all duration-200
                  border-l-2 no-underline
                  ${h.level === 3 ? "pl-5" : "pl-2"}
                  ${
                    activeId === h.id
                      ? "text-primary bg-primary/10 border-primary font-medium"
                      : "text-muted-foreground border-transparent hover:text-foreground hover:border-primary/40 hover:bg-primary/5"
                  }
                `}
              >
                <span className="line-clamp-2">{h.text}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}

// --- Mobile TOC Drawer ---
function MobileTocDrawer({
  headings,
  activeId,
  onItemClick,
}: {
  headings: TocHeading[];
  activeId: string | null;
  onItemClick: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  if (headings.length === 0) return null;

  return (
    <>
      {/* Floating TOC button - mobile only */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open table of contents"
        className="lg:hidden fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
      >
        <List className="w-5 h-5" />
      </button>

      {/* Drawer overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute right-0 top-0 h-full w-[300px] max-w-[85vw] bg-background border-l border-border/50 p-6 overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-orbitron text-sm font-bold text-primary uppercase">
                Contents
              </h4>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close table of contents"
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-secondary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav aria-label="Table of contents" role="navigation">
              <ol className="space-y-1 list-none m-0 p-0">
                {headings.map((h) => (
                  <li key={h.id} className="m-0 p-0">
                    <a
                      href={`#${h.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onItemClick(h.id);
                        setOpen(false);
                      }}
                      aria-current={activeId === h.id ? "location" : undefined}
                      className={`
                        flex items-center gap-2 font-mono text-sm py-2 px-3 rounded no-underline transition-all
                        ${h.level === 3 ? "pl-6" : "pl-3"}
                        ${
                          activeId === h.id
                            ? "text-primary bg-primary/10 font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                        }
                      `}
                    >
                      {activeId === h.id && (
                        <ChevronRight className="w-3 h-3 shrink-0" />
                      )}
                      <span className="line-clamp-2">{h.text}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

export function BlogDetailClient({
  article,
  comments: initialComments,
  relatedArticles,
  processedContent,
}: BlogDetailClientProps) {
  const { toast } = useToast();
  const viewTracked = useRef(false);

  // Like state
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(article.jumlahLike);
  const [likeLoading, setLikeLoading] = useState(false);

  // Share/copy state
  const [copied, setCopied] = useState(false);

  // Comments state
  const [comments, setComments] = useState(initialComments);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentForm, setCommentForm] = useState({
    nama: "",
    email: "",
    komentar: "",
  });
  const [commentLoading, setCommentLoading] = useState(false);

  // Reading progress
  const [progress, setProgress] = useState(0);

  // Active heading for TOC (IntersectionObserver-based)
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);

  // Extract headings with stable slug-based IDs
  const headings = useMemo(() => extractHeadings(article.konten), [article.konten]);

  // Estimate reading time (words / 200 wpm)
  const readingTime = useMemo(
    () => Math.max(1, Math.ceil(article.konten.split(/\s+/).length / 200)),
    [article.konten]
  );

  // Track view once on mount
  useEffect(() => {
    if (!viewTracked.current) {
      viewTracked.current = true;
      trackArticleView(article.id).catch(() => undefined);
    }
  }, [article.id]);

  // Reading progress bar
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth scroll to heading
  const scrollToHeading = useCallback((id: string) => {
    setActiveHeadingId(id);
    const el = document.getElementById(id);
    if (el) {
      const offset = SCROLL_OFFSET; // account for fixed header
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }, []);

  const handleLike = async () => {
    setLiked(!liked);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
    setLikeLoading(true);
    try {
      await toggleBlogLike(article.id);
    } catch {
      // Revert on error
      setLiked(liked);
      setLikeCount(article.jumlahLike);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({
        title: article.judul,
        text: article.ringkasan,
        url,
      });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "URL artikel berhasil disalin.",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentLoading(true);
    try {
      await createBlogComment({
        artikel_id: article.id,
        nama_komentator: commentForm.nama,
        email_komentator: commentForm.email,
        isi_komentar: commentForm.komentar,
      });
      setCommentForm({ nama: "", email: "", komentar: "" });
      setShowCommentForm(false);
      toast({
        title: "Komentar terkirim!",
        description: "Komentar Anda akan tampil setelah disetujui.",
      });
    } catch {
      toast({
        title: "Gagal mengirim komentar",
        description: "Silakan coba lagi.",
      });
    } finally {
      setCommentLoading(false);
    }
  };


  return (
    <>
      {/* Reading progress bar */}
      <div
        className="fixed top-16 left-0 h-0.5 bg-primary z-50 transition-all duration-150"
        style={{ width: `${progress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Reading progress"
      />

      {/* Mobile TOC Drawer */}
      <MobileTocDrawer
        headings={headings}
        activeId={activeHeadingId}
        onItemClick={scrollToHeading}
      />

      <div className="pt-4 pb-16 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-8">
            {/* Main content */}
            <div className="min-w-0">
              <ScrollReveal>
                <Link href="/blog">
                  <Button
                    variant="ghost"
                    className="mb-6 font-mono text-muted-foreground hover:text-primary"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> BACK_TO_FEED
                  </Button>
                </Link>

                <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-muted-foreground uppercase mb-4">
                  <span className="text-primary border border-primary/30 bg-primary/10 px-3 py-1 rounded-full">
                    GENERAL
                  </span>
                  <span>
                    {article.publishedAt
                      ? format(new Date(article.publishedAt), "dd MMM yyyy")
                      : "UNKNOWN"}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" /> {readingTime} MIN
                  </span>
                  <span className="flex items-center">
                    <Eye className="w-3 h-3 mr-1" /> {article.jumlahView}
                  </span>
                  <span className="flex items-center">
                    <Heart className="w-3 h-3 mr-1" /> {likeCount}
                  </span>
                </div>

                <h1 className="text-3xl md:text-4xl font-orbitron font-bold mb-8 leading-tight">
                  {article.judul}
                </h1>

                <p className="text-muted-foreground font-mono text-base mb-8 border-l-2 border-primary/50 pl-4 italic">
                  {article.ringkasan}
                </p>
              </ScrollReveal>

              {/* Thumbnail */}
              {article.thumbnailUrl && (
                <ScrollReveal delay={100}>
                  <div className={`w-full ${getAspectRatioClass(article.thumbnailAspectRatio)} border border-primary/30 rounded-lg overflow-hidden mb-10 shadow-[0_0_30px_rgba(6,182,212,0.1)] relative`}>
                    <Image
                      src={article.thumbnailUrl}
                      alt={article.judul}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 800px"
                      priority
                    />
                  </div>
                </ScrollReveal>
              )}

              {/* Article content */}
              <ScrollReveal delay={150}>
                <article
                  className="irnk-prose text-justify"
                  dangerouslySetInnerHTML={{ __html: processedContent }}
                />
              </ScrollReveal>

              {/* Action bar */}
              <div className="mt-12 pt-8 border-t border-primary/20">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className={`font-mono border-primary/50 hover:bg-primary/20 ${liked ? "bg-primary/20 text-primary" : ""}`}
                      onClick={handleLike}
                      disabled={likeLoading}
                    >
                      <Heart
                        className={`mr-2 h-4 w-4 ${liked ? "fill-primary" : ""} ${likeLoading ? "animate-pulse" : ""}`}
                      />
                      {likeCount} LIKES
                    </Button>
                    <Button
                      variant="outline"
                      className="font-mono border-primary/50 hover:bg-primary/20"
                      onClick={handleShare}
                    >
                      {copied ? (
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                      ) : (
                        <Share2 className="mr-2 h-4 w-4" />
                      )}
                      {copied ? "COPIED" : "SHARE"}
                    </Button>
                    <Button
                      variant="outline"
                      className="font-mono border-primary/50 hover:bg-primary/20"
                      onClick={() => setShowCommentForm(!showCommentForm)}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      {comments.length} COMMENTS
                    </Button>
                  </div>
                </div>
              </div>

              {/* Comments section */}
              <div className="mt-10">
                {/* Comment form */}
                {showCommentForm && (
                  <ScrollReveal>
                    <NeonBorder className="mb-8">
                      <form
                        onSubmit={handleSubmitComment}
                        className="p-6 space-y-4"
                      >
                        <h3 className="font-orbitron font-bold text-lg mb-4">
                          LEAVE_COMMENT
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="font-mono text-xs text-muted-foreground">
                              NAMA
                            </Label>
                            <Input
                              required
                              value={commentForm.nama}
                              onChange={(e) =>
                                setCommentForm({
                                  ...commentForm,
                                  nama: e.target.value,
                                })
                              }
                              className="bg-secondary/50 font-mono border-primary/30 rounded-none mt-1"
                              placeholder="Nama Anda"
                            />
                          </div>
                          <div>
                            <Label className="font-mono text-xs text-muted-foreground">
                              EMAIL
                            </Label>
                            <Input
                              required
                              type="email"
                              value={commentForm.email}
                              onChange={(e) =>
                                setCommentForm({
                                  ...commentForm,
                                  email: e.target.value,
                                })
                              }
                              className="bg-secondary/50 font-mono border-primary/30 rounded-none mt-1"
                              placeholder="email@example.com"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="font-mono text-xs text-muted-foreground">
                            KOMENTAR
                          </Label>
                          <textarea
                            required
                            value={commentForm.komentar}
                            onChange={(e) =>
                              setCommentForm({
                                ...commentForm,
                                komentar: e.target.value,
                              })
                            }
                            className="w-full min-h-[100px] bg-secondary/50 font-mono text-sm border border-primary/30 rounded-none mt-1 p-3 resize-none focus:outline-none focus:border-primary"
                            placeholder="Tulis komentar Anda..."
                          />
                        </div>
                        <Button
                          type="submit"
                          className="font-mono bg-primary text-primary-foreground hover:bg-primary/90"
                          disabled={commentLoading}
                        >
                          <Send className="mr-2 h-4 w-4" />
                          {commentLoading ? "SENDING..." : "SUBMIT_COMMENT"}
                        </Button>
                      </form>
                    </NeonBorder>
                  </ScrollReveal>
                )}

                {/* Comments list */}
                {comments.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-orbitron font-bold text-lg border-b border-primary/20 pb-2">
                      COMMENTS ({comments.length})
                    </h3>
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="border border-border/50 bg-secondary/30 p-4 rounded-sm"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <span className="font-mono text-sm font-bold text-foreground">
                              {comment.namaKomentator}
                            </span>
                            <span className="font-mono text-xs text-muted-foreground ml-3">
                              {comment.createdAt
                                ? format(
                                    new Date(comment.createdAt),
                                    "dd MMM yyyy"
                                  )
                                : ""}
                            </span>
                          </div>
                        </div>
                        <p className="font-mono text-sm text-muted-foreground pl-11">
                          {comment.isiKomentar}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Related articles */}
              {relatedArticles.length > 0 && (
                <div className="mt-12 pt-8 border-t border-primary/20">
                  <h3 className="font-orbitron font-bold text-lg mb-6">
                    RELATED_TRANSMISSIONS
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {relatedArticles.map((rel) => (
                      <Link key={rel.id} href={`/blog/${rel.slug}`}>
                        <div className="border border-border/50 bg-secondary/30 p-4 hover:border-primary/50 transition-colors cursor-pointer group h-full">
                          {rel.thumbnailUrl && (
                            <div className="relative w-full h-24 mb-3 overflow-hidden border border-primary/20">
                              <Image
                                src={rel.thumbnailUrl}
                                alt={rel.judul}
                                fill
                                className="object-cover grayscale group-hover:grayscale-0 transition-all"
                                sizes="(max-width: 768px) 100vw, 250px"
                              />
                            </div>
                          )}
                          <h4 className="font-orbitron text-sm font-bold group-hover:text-primary transition-colors line-clamp-2">
                            {rel.judul}
                          </h4>
                          <p className="font-mono text-xs text-muted-foreground mt-2 line-clamp-2">
                            {rel.ringkasan}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - Table of Contents */}
            <aside className="hidden lg:block" aria-label="Article sidebar">
              <div className="sticky top-24">
                <TableOfContents
                  headings={headings}
                  activeId={activeHeadingId}
                  onItemClick={scrollToHeading}
                />

                {/* Stats card */}
                <div className="border border-border/50 bg-secondary/30 p-4 rounded-sm mt-4">
                  <h4 className="font-orbitron text-xs font-bold mb-3 text-primary uppercase">
                    Stats
                  </h4>
                  <div className="space-y-2 font-mono text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Views</span>
                      <span className="text-foreground">{article.jumlahView}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Likes</span>
                      <span className="text-foreground">{likeCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Comments</span>
                      <span className="text-foreground">{comments.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Read time</span>
                      <span className="text-foreground">{readingTime} min</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
