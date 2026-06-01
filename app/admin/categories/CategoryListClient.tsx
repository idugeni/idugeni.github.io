"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmActionDialog } from "@/components/admin/ConfirmActionDialog";
import { deleteBlogCategory } from "@/actions/blog";
import { CategoryTable, type AdminBlogCategory } from "./CategoryTable";

interface CategoryListClientProps {
  categories: AdminBlogCategory[];
  stats: {
    total: number;
    used: number;
    empty: number;
  };
}

export function CategoryListClient({ categories, stats }: CategoryListClientProps) {
  const router = useRouter();
  const [categoryToDelete, setCategoryToDelete] = useState<AdminBlogCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);

    try {
      await deleteBlogCategory(categoryToDelete.id);
      toast.success("Category deleted successfully");
      setCategoryToDelete(null);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete category");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-none border-border/50 bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-mono text-xs text-muted-foreground">TOTAL_CATEGORIES</CardTitle>
          </CardHeader>
          <CardContent className="font-orbitron text-3xl font-bold text-primary">{stats.total}</CardContent>
        </Card>
        <Card className="rounded-none border-border/50 bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-mono text-xs text-muted-foreground">IN_USE</CardTitle>
          </CardHeader>
          <CardContent className="font-orbitron text-3xl font-bold text-emerald-400">{stats.used}</CardContent>
        </Card>
        <Card className="rounded-none border-border/50 bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-mono text-xs text-muted-foreground">EMPTY</CardTitle>
          </CardHeader>
          <CardContent className="font-orbitron text-3xl font-bold text-amber-400">{stats.empty}</CardContent>
        </Card>
      </div>

      <Card className="rounded-none border-border/50 bg-card">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle className="font-orbitron">CATEGORY_REGISTRY</CardTitle>
          <p className="font-mono text-xs text-muted-foreground">
            {categories.length} taxonomy node(s) loaded
          </p>
        </CardHeader>
        <CardContent>
          <CategoryTable categories={categories} onDelete={setCategoryToDelete} />
        </CardContent>
      </Card>

      <ConfirmActionDialog
        open={Boolean(categoryToDelete)}
        onOpenChange={(open) => {
          if (!open) setCategoryToDelete(null);
        }}
        title="DELETE_CATEGORY"
        description={
          categoryToDelete
            ? `Delete category "${categoryToDelete.nama}"? This is only allowed when no article is using it.`
            : "Delete this category?"
        }
        confirmLabel="DELETE"
        variant="destructive"
        isPending={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
