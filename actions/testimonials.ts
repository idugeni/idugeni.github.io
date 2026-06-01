"use server";

import { revalidatePath } from "next/cache";
import { updatePublicContent, CACHE_TAGS } from "@/lib/cache/tags";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
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
  const supabase = await createClient();
  let query = supabase.from("testimonials").select("*").eq("tampil", true).order("created_at", { ascending: false });
  if (filters?.featured) query = query.eq("featured", true);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getAllTestimonials() {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getAdminTestimonialsPage(rawFilters: unknown) {
  await requireAdmin();

  const filters = adminTestimonialsFilterSchema.parse(rawFilters ?? {});
  const supabase = await createClient();
  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;

  let query = supabase.from("testimonials").select("*", { count: "exact" });
  if (filters.q) {
    const escaped = filters.q.replace(/[%_]/g, "\\$&");
    query = query.or(`nama.ilike.%${escaped}%,jabatan.ilike.%${escaped}%,perusahaan.ilike.%${escaped}%,isi.ilike.%${escaped}%`);
  }
  if (filters.visibility === "visible") query = query.eq("tampil", true);
  if (filters.visibility === "hidden") query = query.eq("tampil", false);
  if (filters.featured === "true") query = query.eq("featured", true);
  if (filters.featured === "false") query = query.eq("featured", false);
  if (filters.rating) query = query.eq("rating", filters.rating);

  const { data, error, count } = await query
    .order(getTestimonialSortColumn(filters.sort), { ascending: filters.order === "asc" })
    .range(from, to);

  if (error) throw error;
  return {
    testimonials: (data ?? []) as TestimonialRow[],
    filters,
    pagination: {
      page: filters.page,
      pageSize: filters.pageSize,
      totalItems: count ?? 0,
      totalPages: Math.max(1, Math.ceil((count ?? 0) / filters.pageSize)),
    },
  };
}

export async function getTestimonialStats() {
  await requireAdmin();

  const supabase = await createClient();
  const { data, error } = await supabase.from("testimonials").select("rating,featured,tampil");
  if (error) throw error;

  const rows = data ?? [];
  const ratingSum = rows.reduce((sum, row) => sum + row.rating, 0);
  return {
    total: rows.length,
    visible: rows.filter((row) => row.tampil).length,
    hidden: rows.filter((row) => !row.tampil).length,
    featured: rows.filter((row) => row.featured).length,
    averageRating: rows.length ? Number((ratingSum / rows.length).toFixed(1)) : 0,
  };
}

export async function createTestimonial(data: Record<string, unknown>) {
  await requireAdmin();

  const parsed = testimonialInputSchema.safeParse(data);
  if (!parsed.success) throw new Error("Invalid testimonial data: " + parsed.error.issues[0].message);

  const supabase = await createClient();
  const { data: testimonial, error } = await supabase
    .from("testimonials")
    .insert(normalizeTestimonialPayload(parsed.data))
    .select()
    .single();
  if (error) throw error;
  updatePublicContent([CACHE_TAGS.testimonials]);
  revalidatePath("/admin/testimonials");
  return testimonial;
}

export async function updateTestimonial(id: string, data: Record<string, unknown>) {
  await requireAdmin();

  const parsedId = uuidSchema.parse(id);
  const parsed = testimonialUpdateSchema.safeParse(data);
  if (!parsed.success) throw new Error("Invalid testimonial data: " + parsed.error.issues[0].message);

  const supabase = await createClient();
  const { data: testimonial, error } = await supabase
    .from("testimonials")
    .update(normalizeTestimonialPayload(parsed.data))
    .eq("id", parsedId)
    .select()
    .single();
  if (error) throw error;
  updatePublicContent([CACHE_TAGS.testimonials]);
  revalidatePath("/admin/testimonials");
  return testimonial;
}

export async function bulkUpdateTestimonials(ids: string[], patch: { tampil?: boolean; featured?: boolean }) {
  await requireAdmin();

  const parsedIds = uuidArraySchema.parse(ids);
  const parsedPatch = bulkTestimonialPatchSchema.parse(patch);
  const supabase = await createClient();
  const { error } = await supabase.from("testimonials").update(parsedPatch).in("id", parsedIds);
  if (error) throw error;
  updatePublicContent([CACHE_TAGS.testimonials]);
  revalidatePath("/admin/testimonials");
  return { success: true };
}

export async function duplicateTestimonial(id: string) {
  await requireAdmin();

  const parsedId = uuidSchema.parse(id);
  const supabase = await createClient();
  const { data: source, error } = await supabase.from("testimonials").select("*").eq("id", parsedId).single();
  if (error) throw error;

  const { id: _id, created_at: _createdAt, ...clone } = source;
  void _id;
  void _createdAt;
  const { data: testimonial, error: insertError } = await supabase
    .from("testimonials")
    .insert({ ...clone, nama: `${source.nama} Copy`, tampil: false, featured: false })
    .select()
    .single();
  if (insertError) throw insertError;
  updatePublicContent([CACHE_TAGS.testimonials]);
  revalidatePath("/admin/testimonials");
  return testimonial;
}

export async function deleteTestimonial(id: string) {
  await requireAdmin();

  const parsed = uuidSchema.parse(id);
  const supabase = await createClient();
  const { error } = await supabase.from("testimonials").delete().eq("id", parsed);
  if (error) throw error;
  updatePublicContent([CACHE_TAGS.testimonials]);
  revalidatePath("/admin/testimonials");
  return { success: true };
}

export async function bulkDeleteTestimonials(ids: string[]) {
  await requireAdmin();

  const parsedIds = uuidArraySchema.parse(ids);
  const supabase = await createClient();
  const { error } = await supabase.from("testimonials").delete().in("id", parsedIds);
  if (error) throw error;
  updatePublicContent([CACHE_TAGS.testimonials]);
  revalidatePath("/admin/testimonials");
  return { success: true };
}
