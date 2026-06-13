import type { Metadata } from "next";
import { Suspense } from "react";
import { getAdminBlogCategoriesPage } from "@/actions/blog";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Plus, Tag, Loader2Icon } from "@/lib/icons";
import Link from "next/link";
import { CategoryListClient } from "./CategoryListClient";

export const metadata: Metadata = { title: "Categories" };

async function CategoriesContent() {
  let pageData = null;
  let error: string | null = null;

  try {
    pageData = await getAdminBlogCategoriesPage();
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load categories";
  }

  if (error) {
    return (
      <div className="rounded-none border border-red-500/30 bg-red-500/10 p-6">
        <p className="font-mono text-sm text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="BLOG_TAXONOMY"
        title="Categories"
        subtitle="Manage article categories, colors, slugs, and editorial taxonomy used across the public blog."
        icon={<Tag className="h-7 w-7 text-primary" />}
        actions={
          <Button asChild className="rounded-none bg-primary font-mono text-primary-foreground hover:bg-primary/90">
            <Link href="/admin/categories/new">
              <Plus className="mr-2 h-4 w-4" /> NEW_CATEGORY
            </Link>
          </Button>
        }
      />

      <CategoryListClient categories={pageData!.categories} stats={pageData!.stats} />
    </div>
  );
}

function CategoriesLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
      <p className="font-mono text-xs text-muted-foreground">Loading categories...</p>
    </div>
  );
}

export default function AdminBlogCategoriesPage() {
  return (
    <Suspense fallback={<CategoriesLoading />}>
      <CategoriesContent />
    </Suspense>
  );
}
