"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Tag } from "@/lib/icons";
import { createBlogCategory, updateBlogCategory } from "@/actions/blog";
import { slugify } from "@/lib/utils/slug";

interface BlogCategoryFormData {
  id: string;
  nama: string;
  slug: string;
  deskripsi: string | null;
  warna: string | null;
}

interface CategoryFormProps {
  mode: "create" | "edit";
  category?: BlogCategoryFormData;
}

export function CategoryForm({ mode, category }: CategoryFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    nama: category?.nama ?? "",
    slug: category?.slug ?? "",
    deskripsi: category?.deskripsi ?? "",
    warna: category?.warna ?? "#06b6d4",
  });

  const updateName = (nama: string) => {
    setFormData((current) => ({
      ...current,
      nama,
      slug: mode === "create" && !current.slug ? slugify(nama) : current.slug,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    const payload = {
      nama: formData.nama,
      slug: formData.slug || slugify(formData.nama),
      deskripsi: formData.deskripsi,
      warna: formData.warna,
    };

    try {
      if (mode === "edit" && category) {
        await updateBlogCategory(category.id, payload);
        toast.success("Category updated successfully");
      } else {
        await createBlogCategory(payload);
        toast.success("Category created successfully");
      }
      router.push("/admin/categories");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save category");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon" className="rounded-none text-muted-foreground hover:text-primary">
          <Link href="/admin/categories" prefetch={false} aria-label="Back to categories">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <p className="font-mono text-xs uppercase tracking-eyebrow text-primary">BLOG_TAXONOMY</p>
          <h1 className="font-orbitron text-2xl font-bold text-primary">
            {mode === "edit" ? "Edit Category" : "New Category"}
          </h1>
        </div>
      </div>

      <Card className="rounded-none border-border/50 bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-orbitron">
            <Tag className="h-5 w-5 text-primary" /> CATEGORY_DATA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category-name" className="font-mono text-xs text-muted-foreground">CATEGORY_NAME</Label>
                <Input
                  id="category-name"
                  required
                  value={formData.nama}
                  onChange={(event) => updateName(event.target.value)}
                  className="rounded-none border-primary/30 bg-secondary/50 font-mono"
                  placeholder="Engineering Notes"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-slug" className="font-mono text-xs text-muted-foreground">SLUG</Label>
                <Input
                  id="category-slug"
                  required
                  value={formData.slug}
                  onChange={(event) => setFormData({ ...formData, slug: slugify(event.target.value) })}
                  className="rounded-none border-primary/30 bg-secondary/50 font-mono"
                  placeholder="engineering-notes"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[180px_1fr]">
              <div className="space-y-2">
                <Label htmlFor="category-color" className="font-mono text-xs text-muted-foreground">COLOR</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="category-color"
                    type="color"
                    value={formData.warna}
                    onChange={(event) => setFormData({ ...formData, warna: event.target.value })}
                    className="h-10 w-16 rounded-none border-primary/30 bg-secondary/50 p-1"
                  />
                  <Input
                    aria-label="Category color hex value"
                    value={formData.warna}
                    onChange={(event) => setFormData({ ...formData, warna: event.target.value })}
                    className="rounded-none border-primary/30 bg-secondary/50 font-mono"
                    placeholder="#06b6d4"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-description" className="font-mono text-xs text-muted-foreground">DESCRIPTION</Label>
                <Textarea
                  id="category-description"
                  value={formData.deskripsi}
                  onChange={(event) => setFormData({ ...formData, deskripsi: event.target.value })}
                  className="min-h-28 rounded-none border-primary/30 bg-secondary/50 font-mono"
                  placeholder="Describe what kind of articles belong to this category..."
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-border/50 pt-6 sm:flex-row sm:justify-end">
              <Button asChild type="button" variant="outline" className="rounded-none font-mono">
                <Link href="/admin/categories" prefetch={false}>CANCEL</Link>
              </Button>
              <Button type="submit" disabled={isSaving} className="rounded-none bg-primary font-mono text-primary-foreground hover:bg-primary/90">
                <Save className="mr-2 h-4 w-4" /> {isSaving ? "SAVING..." : "SAVE_CATEGORY"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
