import { Suspense } from "react";
import { PublicLayout } from "@/components/layout/public-layout";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import { BlogListClient } from "@/components/pages/blog/blog-list-client";
import { getBlogIndexPageData } from "@/lib/data/public-content";
import { BlogIndexSkeleton } from "@/components/ui/index-page-skeletons";
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

async function BlogContent({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const page = Number(params?.page ?? "1");
  const { articles, categories, pagination, activeCategory, error } = await getBlogIndexPageData({
    category: params?.category,
    page,
  });

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Failed to load blog data.</p>
      </div>
    );
  }

  return (
    <BlogListClient
      articles={articles}
      categories={categories}
      activeCategory={activeCategory}
      pagination={pagination}
    />
  );
}

export default function BlogPage({ searchParams }: BlogPageProps) {
  return (
    <PublicLayout>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Blog", url: "/blog" },
        ]}
      />
      <Suspense
        fallback={<BlogIndexSkeleton />}
      >
        <BlogContent searchParams={searchParams} />
      </Suspense>
    </PublicLayout>
  );
}
