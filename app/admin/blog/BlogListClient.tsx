"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCards } from "./StatCards";
import { BlogFilters } from "./BlogFilters";
import { BlogTable } from "./BlogTable";
import { BulkActionsBar } from "./BulkActionsBar";
import { PreviewModal } from "./PreviewModal";
import { bulkUpdateArticles, bulkDeleteArticles, duplicateArticle } from "@/actions/blog";

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
  kategori?: {
    id: string;
    nama: string;
    warna: string | null;
  } | null;
}

interface BlogListClientProps {
  initialArticles: BlogArticle[];
  categories: Array<{ id: string; nama: string; warna: string | null }>;
  stats: {
    total: number;
    published: number;
    draft: number;
    featured: number;
  };
  filters: {
    q?: string;
    status?: "published" | "draft";
    category?: string;
    featured?: "true";
    sort?: "date" | "views" | "likes" | "title";
    order?: "asc" | "desc";
  };
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

function pageHref(page: number, filters: BlogListClientProps["filters"]) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.status) params.set("status", filters.status);
  if (filters.category) params.set("category", filters.category);
  if (filters.featured) params.set("featured", filters.featured);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.order) params.set("order", filters.order);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/admin/blog?${query}` : "/admin/blog";
}

export function BlogListClient({ initialArticles, categories, stats, filters, pagination }: BlogListClientProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [previewArticle, setPreviewArticle] = useState<BlogArticle | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? initialArticles.map((article) => article.id) : []);
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds((current) => checked ? [...current, id] : current.filter((selectedId) => selectedId !== id));
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteArticles(selectedIds);
      toast.success(`Deleted ${selectedIds.length} article(s)`);
      setSelectedIds([]);
      router.refresh();
    } catch {
      toast.error("Failed to delete articles");
    }
  };

  const handleBulkPublish = async () => {
    try {
      await bulkUpdateArticles(selectedIds, { status: "published" });
      toast.success(`Published ${selectedIds.length} article(s)`);
      setSelectedIds([]);
      router.refresh();
    } catch {
      toast.error("Failed to publish articles");
    }
  };

  const handleBulkUnpublish = async () => {
    try {
      await bulkUpdateArticles(selectedIds, { status: "draft" });
      toast.success(`Unpublished ${selectedIds.length} article(s)`);
      setSelectedIds([]);
      router.refresh();
    } catch {
      toast.error("Failed to unpublish articles");
    }
  };

  const handleBulkSetFeatured = async () => {
    try {
      await bulkUpdateArticles(selectedIds, { featured: true });
      toast.success(`Set ${selectedIds.length} article(s) as featured`);
      setSelectedIds([]);
      router.refresh();
    } catch {
      toast.error("Failed to set featured");
    }
  };

  const handleBulkUnsetFeatured = async () => {
    try {
      await bulkUpdateArticles(selectedIds, { featured: false });
      toast.success(`Unset ${selectedIds.length} article(s) as featured`);
      setSelectedIds([]);
      router.refresh();
    } catch {
      toast.error("Failed to unset featured");
    }
  };

  const handleDuplicate = async (slug: string) => {
    try {
      await duplicateArticle(slug);
      toast.success("Article duplicated successfully");
      router.refresh();
    } catch {
      toast.error("Failed to duplicate article");
    }
  };

  const canGoPrevious = pagination.page > 1;
  const canGoNext = pagination.page < pagination.totalPages;

  return (
    <div className="space-y-6">
      <StatCards stats={stats} />

      <BlogFilters filters={filters} categories={categories} />

      <BulkActionsBar
        selectedCount={selectedIds.length}
        onBulkDelete={handleBulkDelete}
        onBulkPublish={handleBulkPublish}
        onBulkUnpublish={handleBulkUnpublish}
        onBulkSetFeatured={handleBulkSetFeatured}
        onBulkUnsetFeatured={handleBulkUnsetFeatured}
        onClearSelection={() => setSelectedIds([])}
      />

      <Card className="bg-card border-border/50 rounded-none">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle className="font-orbitron">
            TRANSMISSION_LOGS ({pagination.totalItems})
          </CardTitle>
          <p className="font-mono text-xs text-muted-foreground">
            PAGE {pagination.page}/{pagination.totalPages} · SHOWING {initialArticles.length} OF {pagination.totalItems}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <BlogTable
            articles={initialArticles}
            selectedIds={selectedIds}
            onSelectAll={handleSelectAll}
            onSelectOne={handleSelectOne}
            onPreview={(article) => {
              setPreviewArticle(article);
              setPreviewOpen(true);
            }}
            onDuplicate={handleDuplicate}
          />

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-4">
            <Button asChild variant="outline" className="rounded-none font-mono" disabled={!canGoPrevious}>
              <Link href={canGoPrevious ? pageHref(pagination.page - 1, filters) : pageHref(1, filters)}>PREVIOUS</Link>
            </Button>
            <span className="font-mono text-xs text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button asChild variant="outline" className="rounded-none font-mono" disabled={!canGoNext}>
              <Link href={canGoNext ? pageHref(pagination.page + 1, filters) : pageHref(pagination.totalPages, filters)}>NEXT</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <PreviewModal article={previewArticle} open={previewOpen} onOpenChange={setPreviewOpen} />
    </div>
  );
}
