"use server";

import { updatePublicContent, CACHE_TAGS } from "@/lib/cache/tags";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/rbac";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugSchema } from "@/lib/security/server-action";
import { slugify } from "@/lib/utils/slug";

const galleryPayloadSchema = z.object({
  judul: z.string().min(1).max(200).trim(),
  slug: slugSchema.optional(),
  deskripsi: z.string().max(1000).optional().or(z.literal("")),
  fileUrl: z.string().url().max(500),
  thumbnailUrl: z.string().url().max(500).optional().or(z.literal("")),
  imageUrl: z.string().url().max(500).optional().or(z.literal("")),
  tipe: z.enum(["foto", "video"]),
  kategori: z.string().max(100).optional().or(z.literal("")),
  urutan: z.number().int().min(0).optional(),
});
const createGallerySchema = galleryPayloadSchema;
const updateGallerySchema = galleryPayloadSchema.partial().refine((value) => Object.keys(value).length > 0, "At least one field is required");

const uuidSchema = z.string().uuid();

async function createUniqueGallerySlug(baseValue: string, excludeId?: string) {
  const baseSlug = slugify(baseValue);
  let candidate = baseSlug;
  let suffix = 2;
  const supabase = createAdminClient();

  while (suffix <= 100) {
    const { data } = await supabase
      .from("gallery")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data || data.id === excludeId) return candidate;
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return `${baseSlug}-${Date.now().toString(36)}`;
}

export async function getGallery(filters?: { tipe?: string; kategori?: string }) {
  const supabase = createAdminClient();
  let query = supabase.from("gallery").select("*").order("urutan").limit(200);

  if (filters?.tipe) query = query.eq("tipe", filters.tipe);
  if (filters?.kategori) query = query.eq("kategori", filters.kategori);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
}

export async function getGalleryItem(id: string) {
  await requireAdmin();

  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) {
    throw new Error("Invalid gallery item ID: must be a valid UUID");
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("gallery")
    .select("*")
    .eq("id", parsed.data)
    .single();
  if (error) throw new Error("Gallery item not found");
  return data;
}

export async function getGalleryItemBySlug(slug: string) {
  await requireAdmin();

  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) {
    throw new Error("Invalid gallery item slug");
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("gallery")
    .select("*")
    .eq("slug", parsed.data)
    .single();
  if (error) throw new Error("Gallery item not found");
  return data;
}

export async function createGalleryItem(data: Record<string, unknown>) {
  await requireAdmin();

  const parsed = createGallerySchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Invalid gallery item data: " + parsed.error.issues[0].message);
  }

  const { imageUrl, fileUrl, thumbnailUrl, ...galleryData } = parsed.data;
  const slug = await createUniqueGallerySlug(parsed.data.slug || parsed.data.judul);

  const insertData: Record<string, unknown> = {
    judul: galleryData.judul,
    slug,
    deskripsi: galleryData.deskripsi || null,
    file_url: fileUrl || imageUrl,
    thumbnail_url: thumbnailUrl || fileUrl || imageUrl || null,
    tipe: galleryData.tipe,
    kategori: parsed.data.kategori || null,
  };
  if (galleryData.urutan !== undefined) insertData.urutan = galleryData.urutan;

  const supabase = createAdminClient();
  const { data: item, error } = await supabase
    .from("gallery")
    .insert(insertData)
    .select()
    .single();
  if (error) throw new Error(error.message);
  updatePublicContent([CACHE_TAGS.gallery]);
  return item;
}

export async function updateGalleryItem(id: string, data: Record<string, unknown>) {
  await requireAdmin();

  const parsedId = uuidSchema.safeParse(id);
  if (!parsedId.success) {
    throw new Error("Invalid gallery item ID: must be a valid UUID");
  }

  return updateGalleryItemById(parsedId.data, data);
}

export async function updateGalleryItemBySlug(currentSlug: string, data: Record<string, unknown>) {
  await requireAdmin();

  const parsedSlug = slugSchema.safeParse(currentSlug);
  if (!parsedSlug.success) {
    throw new Error("Invalid gallery item slug");
  }

  const supabase = createAdminClient();
  const { data: existing, error: lookupError } = await supabase
    .from("gallery")
    .select("id")
    .eq("slug", parsedSlug.data)
    .maybeSingle();
  if (lookupError || !existing) throw new Error("Gallery item not found");

  return updateGalleryItemById(existing.id, data);
}

async function updateGalleryItemById(id: string, data: Record<string, unknown>) {
  const parsed = updateGallerySchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Invalid gallery item data: " + parsed.error.issues[0].message);
  }

  const { imageUrl, fileUrl, thumbnailUrl, ...galleryData } = parsed.data;
  const slug = parsed.data.slug || parsed.data.judul
    ? await createUniqueGallerySlug(parsed.data.slug || parsed.data.judul || "gallery-media", id)
    : undefined;

  const updateData: Record<string, unknown> = {};
  if (galleryData.judul !== undefined) updateData.judul = galleryData.judul;
  if (slug !== undefined) updateData.slug = slug;
  if (galleryData.deskripsi !== undefined) updateData.deskripsi = galleryData.deskripsi || null;
  if (galleryData.tipe !== undefined) updateData.tipe = galleryData.tipe;
  if (galleryData.urutan !== undefined) updateData.urutan = galleryData.urutan;
  if (parsed.data.kategori !== undefined) updateData.kategori = parsed.data.kategori || null;
  if (fileUrl || imageUrl) updateData.file_url = fileUrl || imageUrl;
  if (thumbnailUrl !== undefined || fileUrl || imageUrl) updateData.thumbnail_url = thumbnailUrl || fileUrl || imageUrl || null;

  const supabase = createAdminClient();

  if (Object.keys(updateData).length === 0) {
    const { data: row, error } = await supabase
      .from("gallery")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw new Error("Gallery item not found");
    return row;
  }

  const { data: item, error } = await supabase
    .from("gallery")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();
  if (error || !item) throw new Error("Gallery item not found");
  updatePublicContent([CACHE_TAGS.gallery]);
  return item;
}

export async function deleteGalleryItem(id: string) {
  await requireAdmin();

  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) {
    throw new Error("Invalid gallery item ID: must be a valid UUID");
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("gallery")
    .delete()
    .eq("id", parsed.data);
  if (error) throw new Error(error.message);
  updatePublicContent([CACHE_TAGS.gallery]);
  return { success: true };
}

export async function getGalleryStats() {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: all, error } = await supabase
    .from("gallery")
    .select("tipe");
  if (error) throw new Error(error.message);

  const items = all || [];
  return {
    total: items.length,
    totalSize: 0,
    images: items.filter((r) => r.tipe === "foto").length,
    videos: items.filter((r) => r.tipe === "video").length,
  };
}

export async function bulkDeleteGalleryItems(ids: string[]) {
  await requireAdmin();

  for (const id of ids) {
    const parsed = uuidSchema.safeParse(id);
    if (!parsed.success) {
      throw new Error("Invalid gallery item ID: must be a valid UUID");
    }
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("gallery")
    .delete()
    .in("id", ids);
  if (error) throw new Error(error.message);
  updatePublicContent([CACHE_TAGS.gallery]);
  return { success: true };
}

export interface OrphanFile {
  bucket: string;
  name: string;
  size: number;
  created_at: string;
}

export async function scanOrphanStorageFiles(): Promise<OrphanFile[]> {
  await requireAdmin();
  const supabase = createAdminClient();

  // 1. Fetch storage files from buckets
  const [blogList, shortlinksList] = await Promise.all([
    supabase.storage.from("blog").list("", { limit: 1000 }),
    supabase.storage.from("shortlinks").list("", { limit: 1000 }),
  ]);

  if (blogList.error) throw new Error(`Failed to list blog bucket: ${blogList.error.message}`);
  if (shortlinksList.error) throw new Error(`Failed to list shortlinks bucket: ${shortlinksList.error.message}`);

  const blogFiles = blogList.data || [];
  const shortlinkFiles = shortlinksList.data || [];

  // 2. Fetch database URLs referencing assets
  const [blogArticles, galleryItems, shortlinks] = await Promise.all([
    supabase.from("blog_artikel").select("thumbnail_url"),
    supabase.from("gallery").select("file_url, thumbnail_url"),
    supabase.from("shortlinks").select("qr_code_url"),
  ]);

  const activeFilenames = new Set<string>();

  const extractFilename = (url: string | null) => {
    if (!url) return null;
    try {
      const decoded = decodeURIComponent(url);
      const parts = decoded.split("/");
      return parts[parts.length - 1] || null;
    } catch {
      return null;
    }
  };

  // Add all referenced filenames to set
  blogArticles.data?.forEach((row) => {
    const fn = extractFilename(row.thumbnail_url);
    if (fn) activeFilenames.add(fn);
  });

  galleryItems.data?.forEach((row) => {
    const fn1 = extractFilename(row.file_url);
    const fn2 = extractFilename(row.thumbnail_url);
    if (fn1) activeFilenames.add(fn1);
    if (fn2) activeFilenames.add(fn2);
  });

  shortlinks.data?.forEach((row) => {
    const fn = extractFilename(row.qr_code_url);
    if (fn) activeFilenames.add(fn);
  });

  const orphans: OrphanFile[] = [];

  // 3. Scan blog bucket
  blogFiles.forEach((file) => {
    if (file.name === ".emptyFolderPlaceholder") return;
    if (!activeFilenames.has(file.name)) {
      orphans.push({
        bucket: "blog",
        name: file.name,
        size: file.metadata?.size || 0,
        created_at: file.created_at || new Date().toISOString(),
      });
    }
  });

  // 4. Scan shortlinks bucket
  shortlinkFiles.forEach((file) => {
    if (file.name === ".emptyFolderPlaceholder") return;
    if (!activeFilenames.has(file.name)) {
      orphans.push({
        bucket: "shortlinks",
        name: file.name,
        size: file.metadata?.size || 0,
        created_at: file.created_at || new Date().toISOString(),
      });
    }
  });

  return orphans;
}

export async function purgeOrphanStorageFiles(files: { bucket: string; name: string }[]) {
  await requireAdmin();
  const supabase = createAdminClient();

  const blogFilesToPurge = files.filter(f => f.bucket === "blog").map(f => f.name);
  const shortlinkFilesToPurge = files.filter(f => f.bucket === "shortlinks").map(f => f.name);

  let deletedCount = 0;

  if (blogFilesToPurge.length > 0) {
    const { data, error } = await supabase.storage.from("blog").remove(blogFilesToPurge);
    if (error) throw new Error(`Failed to purge blog files: ${error.message}`);
    deletedCount += data?.length || 0;
  }

  if (shortlinkFilesToPurge.length > 0) {
    const { data, error } = await supabase.storage.from("shortlinks").remove(shortlinkFilesToPurge);
    if (error) throw new Error(`Failed to purge shortlinks files: ${error.message}`);
    deletedCount += data?.length || 0;
  }

  return { success: true, purgedCount: deletedCount };
}
