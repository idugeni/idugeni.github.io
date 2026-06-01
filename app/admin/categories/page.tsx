import { getAdminBlogCategoriesPage } from "@/actions/blog";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Plus, Tag } from "@/lib/icons";
import Link from "next/link";
import { CategoryListClient } from "./CategoryListClient";

export default async function AdminBlogCategoriesPage() {
  const pageData = await getAdminBlogCategoriesPage();

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

      <CategoryListClient categories={pageData.categories} stats={pageData.stats} />
    </div>
  );
}
