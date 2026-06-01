import { getAdminBlogArticlesPage, getBlogStats } from "@/actions/blog";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { Plus, Tag } from "@/lib/icons";
import Link from "next/link";
import { BlogListClient } from "./BlogListClient";

type AdminBlogSearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminBlog({ searchParams }: { searchParams: AdminBlogSearchParams }) {
  const params = await searchParams;
  const [pageData, stats] = await Promise.all([
    getAdminBlogArticlesPage(params),
    getBlogStats(),
  ]);

  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("kategori")
    .select("id, nama, warna")
    .order("nama");

  const transformedArticles = pageData.articles.map((article) => ({
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
        stats={stats}
        filters={pageData.filters}
        pagination={pageData.pagination}
      />
    </div>
  );
}
