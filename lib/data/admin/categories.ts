import "server-only";

import { z } from "zod";
import { requireAdmin } from "@/lib/auth/rbac";
import { queryPooler, queryPoolerSingle } from "@/lib/db/pooler";

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

  const [categories, articleCounts] = await Promise.all([
    queryPooler<AdminBlogCategoryRow>(
      `SELECT id, nama, slug, deskripsi, warna, created_at FROM kategori ORDER BY nama ASC`,
    ),
    queryPooler<{ kategori_id: string; article_count: number }>(
      `SELECT kategori_id, COUNT(*)::int AS article_count
       FROM blog_artikel
       WHERE kategori_id IS NOT NULL
       GROUP BY kategori_id`,
    ),
  ]);

  const countByCategory = new Map(articleCounts.map((row) => [row.kategori_id, Number(row.article_count)]));
  const enrichedCategories = categories.map((category) => serializeCategory({
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

  const category = await queryPoolerSingle<AdminBlogCategoryRow>(
    `SELECT id, nama, slug, deskripsi, warna, created_at FROM kategori WHERE slug = $1`,
    [parsed.data],
  );

  return category ? serializeCategory(category) : null;
}
