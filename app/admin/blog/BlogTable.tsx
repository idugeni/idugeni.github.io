"use client";

import { format, isValid } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy, Edit, Eye, Globe, ImageIcon, Star } from "@/lib/icons";
import { DeleteBlogArticleButton } from "./DeleteBlogArticleButton";
import { AdminTableActionButton } from "@/components/admin/AdminTableActionButton";
import { StatusPill } from "@/components/admin/StatusPill";

interface BlogArticle {
  id: string;
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
  createdAt: string;
  kategori?: { id: string; nama: string; warna: string | null } | null;
}

interface BlogTableProps {
  articles: BlogArticle[];
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectOne: (id: string, checked: boolean) => void;
  onPreview: (article: BlogArticle) => void;
  onDuplicate: (slug: string) => void;
}

function safeDate(value: string | null) {
  if (!value) return "UNPUBLISHED";
  const date = new Date(value);
  return isValid(date) ? format(date, "dd MMM yyyy") : "INVALID_DATE";
}

function excerpt(article: BlogArticle) {
  return (article.ringkasan || article.konten.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

function Thumbnail({ article }: { article: BlogArticle }) {
  return (
    <div className="relative h-32 w-full overflow-hidden border border-primary/20 bg-secondary/80 shadow-[0_0_24px_hsl(var(--primary)/0.08)] sm:h-28 sm:w-44 lg:h-24 lg:w-40">
      {article.thumbnail_url ? (
        // Use a plain image here so admin thumbnails render for any Supabase Storage URL,
        // including signed URLs with query strings, without waiting on Next image optimizer rules.
        <img
          src={article.thumbnail_url}
          alt={`Thumbnail ${article.judul}`}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
          <ImageIcon className="h-7 w-7" />
          <span className="font-mono text-[10px]">NO_THUMBNAIL</span>
        </div>
      )}
    </div>
  );
}

export function BlogTable({ articles, selectedIds, onSelectAll, onSelectOne, onPreview, onDuplicate }: BlogTableProps) {
  const allSelected = articles.length > 0 && selectedIds.length === articles.length;

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border/50 hover:bg-transparent">
            <TableHead className="w-11">
              <Checkbox checked={allSelected} onCheckedChange={onSelectAll} aria-label="Select all" className="rounded-none" />
            </TableHead>
          <TableHead className="w-44 font-mono text-primary">THUMBNAIL</TableHead>
          <TableHead className="font-mono text-primary">ARTICLE_DETAIL</TableHead>
          <TableHead className="hidden w-52 font-mono text-primary xl:table-cell">STATUS_METRICS</TableHead>
          <TableHead className="w-32 text-right font-mono text-primary">ACTIONS</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {articles.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="py-8 text-center font-mono text-muted-foreground">NO_ARTICLES_FOUND</TableCell>
          </TableRow>
        ) : articles.map((article) => {
          const articleExcerpt = excerpt(article);

          return (
            <TableRow key={article.id} className="border-border/50 align-top hover:bg-secondary/40">
              <TableCell className="pt-5">
                <Checkbox
                  checked={selectedIds.includes(article.id)}
                  onCheckedChange={(checked) => onSelectOne(article.id, checked as boolean)}
                  aria-label={`Select ${article.judul}`}
                  className="rounded-none"
                />
              </TableCell>

              <TableCell className="py-4 align-top">
                <Thumbnail article={article} />
              </TableCell>

              <TableCell className="py-4 align-top">
                <div className="min-w-0 space-y-3">
                  <div className="flex min-w-0 flex-wrap items-start gap-2">
                    {article.featured && <Star className="mt-0.5 h-4 w-4 shrink-0 fill-yellow-500 text-yellow-500" />}
                    <h3 className="min-w-0 whitespace-normal break-words font-mono text-base font-semibold leading-relaxed text-foreground md:text-lg">
                      {article.judul}
                    </h3>
                  </div>

                  <p className="whitespace-normal break-all font-mono text-xs leading-relaxed text-primary/80">/{article.slug}</p>

                  {articleExcerpt && (
                    <p className="whitespace-normal break-words text-sm leading-relaxed text-muted-foreground">
                      {articleExcerpt}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {article.kategori ? (
                      <span className="inline-flex items-center gap-1 border border-border/50 bg-secondary px-2 py-1 font-mono text-[11px]">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: article.kategori.warna || "hsl(var(--primary))" }} />
                        {article.kategori.nama}
                      </span>
                    ) : (
                      <span className="border border-border/50 px-2 py-1 font-mono text-[11px] text-muted-foreground">NO_CATEGORY</span>
                    )}
                    <StatusPill tone={article.status === "published" ? "success" : "warning"}>
                      {article.status.toUpperCase()}
                    </StatusPill>
                    <span className="border border-border/50 px-2 py-1 font-mono text-[11px] text-muted-foreground">{safeDate(article.publishedAt)}</span>
                  </div>

                  <div className="grid gap-2 font-mono text-xs text-muted-foreground sm:grid-cols-3 xl:hidden">
                    <span>{article.jumlah_view} views</span>
                    <span>{article.jumlah_like} likes</span>
                    <span>{article.waktu_baca} min read</span>
                  </div>
                </div>
              </TableCell>

              <TableCell className="hidden py-4 align-top xl:table-cell">
                <div className="space-y-2 font-mono text-xs">
                  <div className="inline-block">
                    <StatusPill tone={article.status === "published" ? "success" : "warning"}>
                      {article.status.toUpperCase()}
                    </StatusPill>
                  </div>
                  <div className="text-muted-foreground">{article.jumlah_view} views</div>
                  <div className="text-muted-foreground">{article.jumlah_like} likes</div>
                  <div className="text-muted-foreground">{article.waktu_baca} min read</div>
                  <div className="text-muted-foreground">{safeDate(article.publishedAt)}</div>
                </div>
              </TableCell>

              <TableCell className="py-4 text-right align-top">
                <div className="flex flex-wrap justify-end gap-1">
                  <AdminTableActionButton label={`Preview ${article.judul}`} icon={Eye} intent="view" onClick={() => onPreview(article)} />
                  {article.status === "published" && (
                    <AdminTableActionButton label={`View ${article.judul} public page`} icon={Globe} intent="open" href={`/blog/${article.slug}`} target="_blank" />
                  )}
                  <AdminTableActionButton label={`Edit ${article.judul}`} icon={Edit} intent="edit" href={`/admin/blog/${article.slug}/edit`} />
                  <AdminTableActionButton label={`Duplicate ${article.judul}`} icon={Copy} intent="duplicate" onClick={() => onDuplicate(article.slug)} />
                  <DeleteBlogArticleButton articleSlug={article.slug} articleTitle={article.judul} />
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
    </div>
  );
}
