"use server";

import { revalidatePath } from "next/cache";
import { updatePublicContent, CACHE_TAGS } from "@/lib/cache/tags";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
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
  const supabase = createAdminClient();
  let query = supabase
    .from("testimonials")
    .select("*")
    .eq("tampil", true)
    .order("created_at", { ascending: false });

  if (filters?.featured) query = query.eq("featured", true);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
}

export async function getAllTestimonials() {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return data || [];
}

export async function getAdminTestimonialsPage(rawFilters: unknown) {
  await requireAdmin();

  const filtersParsed = adminTestimonialsFilterSchema.safeParse(rawFilters ?? {});
  if (!filtersParsed.success) throw new Error("Invalid input");
  const filters = filtersParsed.data;

  const supabase = createAdminClient();
  let query = supabase
    .from("testimonials")
    .select("*", { count: "exact" });

  if (filters.q) {
    const escaped = filters.q.replace(/[%_]/g, '\\$&');
    query = query.or(
      `nama.ilike.%${escaped}%,jabatan.ilike.%${escaped}%,perusahaan.ilike.%${escaped}%,isi.ilike.%${escaped}%`
    );
  }
  if (filters.visibility === "visible") query = query.eq("tampil", true);
  if (filters.visibility === "hidden") query = query.eq("tampil", false);
  if (filters.featured === "true") query = query.eq("featured", true);
  if (filters.featured === "false") query = query.eq("featured", false);
  if (filters.rating) query = query.eq("rating", filters.rating);

  const sortCol = getTestimonialSortColumn(filters.sort);
  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;

  const { data, count, error } = await query
    .order(sortCol, { ascending: filters.order === "asc" })
    .range(from, to);

  if (error) throw new Error(error.message);

  const totalItems = count ?? 0;
  return {
    testimonials: data || [],
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
  const supabase = createAdminClient();

  const { data: all, error } = await supabase
    .from("testimonials")
    .select("tampil, featured, rating");
  if (error) throw new Error(error.message);

  const items = all || [];
  const total = items.length;
  const avgRating = total > 0
    ? Math.round((items.reduce((sum, r) => sum + (r.rating || 0), 0) / total) * 10) / 10
    : 0;

  return {
    total,
    visible: items.filter((r) => r.tampil).length,
    hidden: items.filter((r) => !r.tampil).length,
    featured: items.filter((r) => r.featured).length,
    averageRating: avgRating,
  };
}

export async function createTestimonial(data: Record<string, unknown>) {
  await requireAdmin();

  const parsed = testimonialInputSchema.safeParse(data);
  if (!parsed.success) throw new Error("Invalid input");

  const payload = normalizeTestimonialPayload(parsed.data);
  const supabase = createAdminClient();
  const { data: testimonial, error } = await supabase
    .from("testimonials")
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(error.message);
  updatePublicContent([CACHE_TAGS.testimonials]);
  revalidatePath("/admin/testimonials");
  return testimonial;
}

export async function updateTestimonial(id: string, data: Record<string, unknown>) {
  await requireAdmin();

  const parsedIdResult = uuidSchema.safeParse(id);
  if (!parsedIdResult.success) throw new Error("Invalid input");
  const parsedId = parsedIdResult.data;
  const parsed = testimonialUpdateSchema.safeParse(data);
  if (!parsed.success) throw new Error("Invalid input");

  const payload = normalizeTestimonialPayload(parsed.data);
  const supabase = createAdminClient();
  const { data: testimonial, error } = await supabase
    .from("testimonials")
    .update(payload)
    .eq("id", parsedId)
    .select()
    .single();
  if (error || !testimonial) throw new Error("Testimonial not found");
  updatePublicContent([CACHE_TAGS.testimonials]);
  revalidatePath("/admin/testimonials");
  return testimonial;
}

export async function bulkUpdateTestimonials(ids: string[], patch: { tampil?: boolean; featured?: boolean }) {
  await requireAdmin();

  const parsedIdsResult = uuidArraySchema.safeParse(ids);
  if (!parsedIdsResult.success) throw new Error("Invalid input");
  const parsedIds = parsedIdsResult.data;
  const parsedPatchResult = bulkTestimonialPatchSchema.safeParse(patch);
  if (!parsedPatchResult.success) throw new Error("Invalid input");
  const parsedPatch = parsedPatchResult.data;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("testimonials")
    .update(parsedPatch)
    .in("id", parsedIds);
  if (error) throw new Error(error.message);
  updatePublicContent([CACHE_TAGS.testimonials]);
  revalidatePath("/admin/testimonials");
  return { success: true };
}

export async function duplicateTestimonial(id: string) {
  await requireAdmin();

  const parsedIdResult = uuidSchema.safeParse(id);
  if (!parsedIdResult.success) throw new Error("Invalid input");
  const parsedId = parsedIdResult.data;

  const supabase = createAdminClient();
  const { data: source, error: fetchError } = await supabase
    .from("testimonials")
    .select("*")
    .eq("id", parsedId)
    .single();
  if (fetchError || !source) throw new Error("Testimonial not found");

  const { id: _id, created_at: _createdAt, ...clone } = source;
  void _id;
  void _createdAt;
  const insertData = { ...clone, nama: `${source.nama} Copy`, tampil: false, featured: false };

  const { data: testimonial, error: insertError } = await supabase
    .from("testimonials")
    .insert(insertData)
    .select()
    .single();
  if (insertError) throw new Error(insertError.message);
  updatePublicContent([CACHE_TAGS.testimonials]);
  revalidatePath("/admin/testimonials");
  return testimonial;
}

export async function deleteTestimonial(id: string) {
  await requireAdmin();

  const parsedResult = uuidSchema.safeParse(id);
  if (!parsedResult.success) throw new Error("Invalid input");
  const parsed = parsedResult.data;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("testimonials")
    .delete()
    .eq("id", parsed);
  if (error) throw new Error(error.message);
  updatePublicContent([CACHE_TAGS.testimonials]);
  revalidatePath("/admin/testimonials");
  return { success: true };
}

export async function bulkDeleteTestimonials(ids: string[]) {
  await requireAdmin();

  const parsedIdsResult = uuidArraySchema.safeParse(ids);
  if (!parsedIdsResult.success) throw new Error("Invalid input");
  const parsedIds = parsedIdsResult.data;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("testimonials")
    .delete()
    .in("id", parsedIds);
  if (error) throw new Error(error.message);
  updatePublicContent([CACHE_TAGS.testimonials]);
  revalidatePath("/admin/testimonials");
  return { success: true };
}
