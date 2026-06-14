"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Eye, Heart, Clock, Calendar, Tag, Star } from "@/lib/icons";
import Image from "next/image";
import {
  getSafeImageSource,
  shouldBypassImageOptimization,
} from "@/lib/utils/image-source";

interface PreviewModalProps {
  article: {
    judul: string;
    slug: string;
    ringkasan: string;
    konten: string;
    thumbnail_url: string | null;
    status: "draft" | "published";
    featured: boolean;
    jumlah_view: number;
    jumlah_like: number;
    waktu_baca: number;
    publishedAt: string | null;
    kategori?: {
      nama: string;
      warna: string | null;
    } | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PreviewModal({ article, open, onOpenChange }: PreviewModalProps) {
  if (!article) return null;

  // Strip HTML tags for preview
  const stripHtml = (html: string) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const contentPreview = stripHtml(article.konten).substring(0, 500);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto rounded-none border-border/50">
        <DialogHeader>
          <DialogTitle className="font-orbitron text-xl">
            ARTICLE_PREVIEW
          </DialogTitle>
          <DialogDescription className="font-mono text-sm text-muted-foreground">
            Preview of article content and metadata
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Thumbnail */}
          {getSafeImageSource(article.thumbnail_url) && (
            <div className="relative w-full h-64 bg-secondary">
              <Image
                src={getSafeImageSource(article.thumbnail_url)!}
                alt={article.judul}
                fill
                className="object-cover"
                unoptimized={shouldBypassImageOptimization(article.thumbnail_url)}
              />
            </div>
          )}

          {/* Title */}
          <div>
            <h2 className="text-2xl font-bold font-orbitron">{article.judul}</h2>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {/* Status */}
            <Badge
              variant={article.status === "published" ? "default" : "secondary"}
              className="font-mono rounded-none"
            >
              {article.status.toUpperCase()}
            </Badge>

            {/* Featured */}
            {article.featured && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-mono text-xs">FEATURED</span>
              </div>
            )}

            {/* Category */}
            {article.kategori && (
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <div className="flex items-center gap-1">
                  {article.kategori.warna && (
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: article.kategori.warna }}
                    />
                  )}
                  <span className="font-mono">{article.kategori.nama}</span>
                </div>
              </div>
            )}

            {/* Date */}
            {article.publishedAt && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span className="font-mono">
                  {format(new Date(article.publishedAt), "dd MMM yyyy")}
                </span>
              </div>
            )}

            {/* Reading Time */}
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span className="font-mono">{article.waktu_baca} min</span>
            </div>

            {/* Views */}
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span className="font-mono">{article.jumlah_view}</span>
            </div>

            {/* Likes */}
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              <span className="font-mono">{article.jumlah_like}</span>
            </div>
          </div>

          {/* Excerpt */}
          {article.ringkasan && (
            <div>
              <h3 className="font-mono text-sm font-semibold mb-2 text-primary">
                EXCERPT:
              </h3>
              <p className="text-muted-foreground">{article.ringkasan}</p>
            </div>
          )}

          {/* Content Preview */}
          <div>
            <h3 className="font-mono text-sm font-semibold mb-2 text-primary">
              CONTENT_PREVIEW:
            </h3>
            <p className="text-muted-foreground">
              {contentPreview}
              {article.konten.length > 500 && "..."}
            </p>
          </div>

          {/* Slug */}
          <div>
            <h3 className="font-mono text-sm font-semibold mb-2 text-primary">
              SLUG:
            </h3>
            <code className="text-sm bg-secondary px-2 py-1 rounded font-mono break-all">
              /blog/{article.slug}
            </code>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
