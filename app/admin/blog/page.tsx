import { Suspense } from "react";
import { getAdminBlogArticlesPage, getBlogStats } from "@/actions/blog";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { Plus, Tag, Loader2Icon } from "@/lib/icons";
import Link from "next/link";
import { BlogListClient } from "./BlogListClient";

type AdminBlogSearchParams = Promise<Record<string, string | string[] | undefined>>;

async function BlogContent({ searchParams }: { searchParams: AdminBlogSearchParams }) {
  let pageData = null;
  let stats = null;
  let categories: { id: string; nama: string; warna: string }[] | null = null;
  let error: string | null = null;

  try {
    const params = await searchParams;
    const [pd, st] = await Promise.all([
      getAdminBlogArticlesPage(params),
      getBlogStats(),
    ]);
    pageData = pd;
    stats = st;

    const supabase = await createClient();
    const { data } = await supabase
      .from("kategori")
      .select("id, nama, warna")
      .order("nama");
    categories = data;
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load blog data";
  }

  if (error) {
    return (
      <div className="rounded-none border border-red-500/30 bg-red-500/10 p-6">
        <p className="font-mono text-sm text-red-400">{error}</p>
      </div>
    );
  }

  const transformedArticles = pageData!.articles.map((article) => ({
    id: article.id,
    judul: article.judul,
    slug: article.slug,
    ringkasan: article.ringkasan,
    konten: article.konten,
    thumbnail_url: article.thumbnail_url,
    status: article.status,
    featured: article.featured,
    jumlah_view: article.jumlah_view,
    jumlah_like: article.jumlah_like,
    waktu_baca: article.waktu_baca,
    publishedAt: article.published_at,
    createdAt: article.created_at,
    kategori: Array.isArray(article.kategori)
      ? article.kategori[0] ?? null
      : article.kategori ?? null,
  }));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="EDITORIAL_CONTROL_CENTER"
        title="Blog"
        subtitle="Manage editorial transmissions, categories, status pipeline, featured placement, and SEO publication signals."
        actions={
          <>
            <Button asChild variant="outline" className="rounded-none font-mono">
              <Link href="/admin/categories">
                <Tag className="mr-2 h-4 w-4" /> CATEGORIES
              </Link>
            </Button>
            <Button asChild className="rounded-none bg-primary font-mono text-primary-foreground hover:bg-primary/90">
              <Link href="/admin/blog/new">
                <Plus className="mr-2 h-4 w-4" /> NEW_TRANSMISSION
              </Link>
            </Button>
          </>
        }
      />

      <BlogListClient
        initialArticles={transformedArticles}
        categories={categories || []}
        stats={stats!}
        filters={pageData!.filters}
        pagination={pageData!.pagination}
      />
    </div>
  );
}

function BlogLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
      <p className="font-mono text-xs text-muted-foreground">Loading blog data...</p>
    </div>
  );
}

export default function AdminBlog({ searchParams }: { searchParams: AdminBlogSearchParams }) {
  return (
    <Suspense fallback={<BlogLoading />}>
      <BlogContent searchParams={searchParams} />
    </Suspense>
  );
}
