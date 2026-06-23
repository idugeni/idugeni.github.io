import "server-only";

import { z } from "zod";
import { requireAdmin } from "@/lib/auth/rbac";
import { createAdminClient } from "@/lib/supabase/admin";

const categorySlugSchema = z
  .string()
  .min(1)
  .max(120)
  .trim()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid category slug");

type AdminBlogCategoryRow = {
  id: string;
  nama: string;
  slug: string;
  deskripsi: string | null;
  warna: string | null;
  created_at: Date | string;
};

function serializeCategory(category: AdminBlogCategoryRow & { article_count?: number }) {
  return {
    ...category,
    created_at: category.created_at instanceof Date ? category.created_at.toISOString() : category.created_at,
    article_count: Number(category.article_count ?? 0),
  };
}

export async function getAdminBlogCategoriesReadModel() {
  await requireAdmin();

  const supabase = createAdminClient();

  const [categoriesResult, articlesResult] = await Promise.all([
    supabase
      .from("kategori")
      .select("id,nama,slug,deskripsi,warna,created_at")
      .order("nama", { ascending: true }),
    supabase
      .from("blog_artikel")
      .select("kategori_id")
      .not("kategori_id", "is", null),
  ]);

  const countByCategory = new Map<string, number>();
  (articlesResult.data ?? []).forEach((row) => {
    if (row.kategori_id) {
      countByCategory.set(row.kategori_id, (countByCategory.get(row.kategori_id) ?? 0) + 1);
    }
  });

  const enrichedCategories = (categoriesResult.data ?? []).map((category) => serializeCategory({
    ...category,
    article_count: countByCategory.get(category.id) ?? 0,
  }));

  return {
    categories: enrichedCategories,
    stats: {
      total: enrichedCategories.length,
      used: enrichedCategories.filter((category) => category.article_count > 0).length,
      empty: enrichedCategories.filter((category) => category.article_count === 0).length,
    },
  };
}

export async function getAdminBlogCategoryBySlugReadModel(slug: string) {
  await requireAdmin();

  const parsed = categorySlugSchema.safeParse(slug);
  if (!parsed.success) {
    throw new Error("Invalid category slug");
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("kategori")
    .select("id,nama,slug,deskripsi,warna,created_at")
    .eq("slug", parsed.data)
    .maybeSingle();

  if (error || !data) return null;
  return serializeCategory(data);
}
