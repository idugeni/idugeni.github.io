"use server";

import { revalidatePath } from "next/cache";
import { updatePublicContent, CACHE_TAGS } from "@/lib/cache/tags";
import { z } from "zod";
import { queryPooler } from "@/lib/db/pooler";
import { requireAdmin } from "@/lib/auth/rbac";
import type { Database } from "@/lib/supabase/types";

type TestimonialRow = Database["public"]["Tables"]["testimonials"]["Row"];
type TestimonialUpdate = Database["public"]["Tables"]["testimonials"]["Update"];

const testimonialBaseSchema = z.object({
  nama: z.string().min(1).max(100).trim(),
  jabatan: z.string().max(200).trim().optional().nullable(),
  posisi: z.string().max(200).trim().optional().nullable(),
  perusahaan: z.string().max(200).trim().optional().nullable(),
  isi: z.string().min(10).max(2000).trim().optional(),
  testimonial: z.string().min(10).max(2000).trim().optional(),
  rating: z.coerce.number().int().min(1).max(5),
  avatar_url: z.string().url().max(500).optional().nullable().or(z.literal("")),
  foto: z.string().url().max(500).optional().nullable().or(z.literal("")),
  tampil: z.boolean().optional(),
  featured: z.boolean().optional(),
});

const testimonialInputSchema = testimonialBaseSchema.refine((value) => Boolean(value.isi || value.testimonial), {
  message: "Testimonial content is required",
});

const testimonialUpdateSchema = testimonialBaseSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: "At least one field is required",
});

const uuidSchema = z.string().uuid();
const uuidArraySchema = z.array(uuidSchema).min(1).max(50);
const adminTestimonialsFilterSchema = z.object({
  q: z.string().trim().max(100).optional(),
  visibility: z.enum(["visible", "hidden"]).optional(),
  featured: z.enum(["true", "false"]).optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  sort: z.enum(["date", "name", "rating", "featured", "visibility"]).optional().default("date"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(5).max(50).optional().default(10),
});

const bulkTestimonialPatchSchema = z.object({
  tampil: z.boolean().optional(),
  featured: z.boolean().optional(),
}).refine((value) => value.tampil !== undefined || value.featured !== undefined, {
  message: "At least one field must be updated",
});

function normalizeTestimonialPayload(data: z.infer<typeof testimonialInputSchema> | z.infer<typeof testimonialUpdateSchema>): TestimonialUpdate {
  const normalized: TestimonialUpdate = {};
  if (data.nama !== undefined) normalized.nama = data.nama;
  if (data.jabatan !== undefined || data.posisi !== undefined) normalized.jabatan = data.jabatan || data.posisi || null;
  if (data.perusahaan !== undefined) normalized.perusahaan = data.perusahaan || null;
  if (data.isi !== undefined || data.testimonial !== undefined) normalized.isi = data.isi || data.testimonial || "";
  if (data.rating !== undefined) normalized.rating = data.rating;
  if (data.avatar_url !== undefined || data.foto !== undefined) normalized.avatar_url = data.avatar_url || data.foto || null;
  if (data.tampil !== undefined) normalized.tampil = data.tampil;
  if (data.featured !== undefined) normalized.featured = data.featured;
  return normalized;
}

function getTestimonialSortColumn(sort: z.infer<typeof adminTestimonialsFilterSchema>["sort"]) {
  if (sort === "name") return "nama";
  if (sort === "rating") return "rating";
  if (sort === "featured") return "featured";
  if (sort === "visibility") return "tampil";
  return "created_at";
}

export async function getTestimonials(filters?: { featured?: boolean }) {
  const conditions = ["tampil = $1"];
  const params: unknown[] = [true];
  let idx = 2;
  if (filters?.featured) {
    conditions.push(`featured = $${idx++}`);
    params.push(true);
  }
  return await queryPooler(`SELECT * FROM testimonials WHERE ${conditions.join(" AND ")} ORDER BY created_at DESC`, params);
}

export async function getAllTestimonials() {
  await requireAdmin();
  return await queryPooler(`SELECT * FROM testimonials ORDER BY created_at DESC`);
}

export async function getAdminTestimonialsPage(rawFilters: unknown) {
  await requireAdmin();

  const filters = adminTestimonialsFilterSchema.parse(rawFilters ?? {});

  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (filters.q) {
    const escaped = filters.q.replace(/[%_]/g, '\\$&');
    conditions.push(`(nama ILIKE '%' || $${idx} || '%' ESCAPE '\\' OR jabatan ILIKE '%' || $${idx} || '%' ESCAPE '\\' OR perusahaan ILIKE '%' || $${idx} || '%' ESCAPE '\\' OR isi ILIKE '%' || $${idx} || '%' ESCAPE '\\')`);
    params.push(escaped);
    idx++;
  }
  if (filters.visibility === "visible") { conditions.push(`tampil = $${idx}`); params.push(true); idx++; }
  if (filters.visibility === "hidden") { conditions.push(`tampil = $${idx}`); params.push(false); idx++; }
  if (filters.featured === "true") { conditions.push(`featured = $${idx}`); params.push(true); idx++; }
  if (filters.featured === "false") { conditions.push(`featured = $${idx}`); params.push(false); idx++; }
  if (filters.rating) { conditions.push(`rating = $${idx}`); params.push(filters.rating); idx++; }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const sortCol = getTestimonialSortColumn(filters.sort);
  const sortDir = filters.order === "asc" ? "ASC" : "DESC";
  const limit = filters.pageSize;
  const offset = (filters.page - 1) * filters.pageSize;

  const [countResult, data] = await Promise.all([
    queryPooler<{ count: number }>(`SELECT COUNT(*)::int AS count FROM testimonials ${where}`, params),
    queryPooler<TestimonialRow>(`SELECT * FROM testimonials ${where} ORDER BY ${sortCol} ${sortDir} LIMIT $${idx} OFFSET $${idx + 1}`, [...params, limit, offset]),
  ]);

  const totalItems = countResult[0]?.count ?? 0;
  return {
    testimonials: data,
    filters,
    pagination: {
      page: filters.page,
      pageSize: filters.pageSize,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / filters.pageSize)),
    },
  };
}

export async function getTestimonialStats() {
  await requireAdmin();

  const [row] = await queryPooler<{
    total: number;
    visible: number;
    hidden: number;
    featured: number;
    average_rating: number;
  }>(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE tampil = true)::int AS visible,
      COUNT(*) FILTER (WHERE tampil = false)::int AS hidden,
      COUNT(*) FILTER (WHERE featured = true)::int AS featured,
      COALESCE(ROUND(AVG(rating)::numeric, 1), 0)::float AS average_rating
    FROM testimonials
  `);

  return {
    total: row.total,
    visible: row.visible,
    hidden: row.hidden,
    featured: row.featured,
    averageRating: row.average_rating,
  };
}

export async function createTestimonial(data: Record<string, unknown>) {
  await requireAdmin();

  const parsed = testimonialInputSchema.safeParse(data);
  if (!parsed.success) throw new Error("Invalid testimonial data: " + parsed.error.issues[0].message);

  const payload = normalizeTestimonialPayload(parsed.data);
  const columns = Object.keys(payload);
  const values = Object.values(payload);
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
  const [testimonial] = await queryPooler<TestimonialRow>(
    `INSERT INTO testimonials (${columns.join(", ")}) VALUES (${placeholders}) RETURNING *`,
    values,
  );
  updatePublicContent([CACHE_TAGS.testimonials]);
  revalidatePath("/admin/testimonials");
  return testimonial;
}

export async function updateTestimonial(id: string, data: Record<string, unknown>) {
  await requireAdmin();

  const parsedId = uuidSchema.parse(id);
  const parsed = testimonialUpdateSchema.safeParse(data);
  if (!parsed.success) throw new Error("Invalid testimonial data: " + parsed.error.issues[0].message);

  const payload = normalizeTestimonialPayload(parsed.data);
  const columns = Object.keys(payload);
  const values = Object.values(payload);
  const setClauses = columns.map((col, i) => `${col} = $${i + 1}`).join(", ");
  const [testimonial] = await queryPooler<TestimonialRow>(
    `UPDATE testimonials SET ${setClauses} WHERE id = $${columns.length + 1} RETURNING *`,
    [...values, parsedId],
  );
  if (!testimonial) throw new Error("Testimonial not found");
  updatePublicContent([CACHE_TAGS.testimonials]);
  revalidatePath("/admin/testimonials");
  return testimonial;
}

export async function bulkUpdateTestimonials(ids: string[], patch: { tampil?: boolean; featured?: boolean }) {
  await requireAdmin();

  const parsedIds = uuidArraySchema.parse(ids);
  const parsedPatch = bulkTestimonialPatchSchema.parse(patch);
  const columns = Object.keys(parsedPatch);
  const values = Object.values(parsedPatch);
  const setClauses = columns.map((col, i) => `${col} = $${i + 1}`).join(", ");
  const placeholders = parsedIds.map((_, i) => `$${columns.length + i + 1}`).join(", ");
  await queryPooler(
    `UPDATE testimonials SET ${setClauses} WHERE id IN (${placeholders})`,
    [...values, ...parsedIds],
  );
  updatePublicContent([CACHE_TAGS.testimonials]);
  revalidatePath("/admin/testimonials");
  return { success: true };
}

export async function duplicateTestimonial(id: string) {
  await requireAdmin();

  const parsedId = uuidSchema.parse(id);
  const [source] = await queryPooler<TestimonialRow>(
    `SELECT * FROM testimonials WHERE id = $1`,
    [parsedId],
  );
  if (!source) throw new Error("Testimonial not found");

  const { id: _id, created_at: _createdAt, ...clone } = source;
  void _id;
  void _createdAt;
  const insertData = { ...clone, nama: `${source.nama} Copy`, tampil: false, featured: false };
  const columns = Object.keys(insertData);
  const values = Object.values(insertData);
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
  const [testimonial] = await queryPooler<TestimonialRow>(
    `INSERT INTO testimonials (${columns.join(", ")}) VALUES (${placeholders}) RETURNING *`,
    values,
  );
  updatePublicContent([CACHE_TAGS.testimonials]);
  revalidatePath("/admin/testimonials");
  return testimonial;
}

export async function deleteTestimonial(id: string) {
  await requireAdmin();

  const parsed = uuidSchema.parse(id);
  await queryPooler(`DELETE FROM testimonials WHERE id = $1`, [parsed]);
  updatePublicContent([CACHE_TAGS.testimonials]);
  revalidatePath("/admin/testimonials");
  return { success: true };
}

export async function bulkDeleteTestimonials(ids: string[]) {
  await requireAdmin();

  const parsedIds = uuidArraySchema.parse(ids);
  const placeholders = parsedIds.map((_, i) => `$${i + 1}`).join(", ");
  await queryPooler(`DELETE FROM testimonials WHERE id IN (${placeholders})`, parsedIds);
  updatePublicContent([CACHE_TAGS.testimonials]);
  revalidatePath("/admin/testimonials");
  return { success: true };
}
