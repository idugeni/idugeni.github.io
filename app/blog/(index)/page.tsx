import { PublicLayout } from "@/components/layout/public-layout";
import { BlogListClient } from "@/components/pages/blog/blog-list-client";
import { getBlogIndexPageData } from "@/lib/data/public-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Artikel, tutorial, dan insight seputar web development, AI, UI/UX design, dan teknologi modern dari Eliyanto Sarage.",
};

interface BlogPageProps {
  searchParams?: Promise<{
    category?: string;
    page?: string;
  }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const page = Number(params?.page ?? "1");
  const { articles, categories, pagination, activeCategory, error } = await getBlogIndexPageData({
    category: params?.category,
    page,
  });

  if (error) {
    return (
      <PublicLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Failed to load blog data.</p>
        </div>
      </PublicLayout>
    );
  }


  return (
    <PublicLayout>
      <BlogListClient
        articles={articles}
        categories={categories}
        activeCategory={activeCategory}
        pagination={pagination}
      />
    </PublicLayout>
  );
}
