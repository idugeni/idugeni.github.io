"use server";

import { updatePublicContent, CACHE_TAGS } from "@/lib/cache/tags";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { toSnakeCase } from "@/lib/utils/case";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200) || "gallery-media";
}

const slugSchema = z.string().min(1).max(220).transform(slugify).pipe(z.string().min(1).max(200));

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
  const supabase = await createClient();
  const baseSlug = slugify(baseValue);
  let candidate = baseSlug;
  let suffix = 2;

  while (suffix <= 100) {
    let query = supabase.from("gallery").select("id").eq("slug", candidate).maybeSingle();
    const { data, error } = await query;
    if (error) throw error;
    if (!data || data.id === excludeId) return candidate;
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return `${baseSlug}-${Date.now().toString(36)}`;
}

export async function getGallery(filters?: { tipe?: string; kategori?: string }) {
  const supabase = await createClient();
  let query = supabase.from("gallery").select("*").order("urutan");
  if (filters?.tipe) query = query.eq("tipe", filters.tipe);
  if (filters?.kategori) query = query.eq("kategori", filters.kategori);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getGalleryItem(id: string) {
  await requireAdmin();

  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) {
    throw new Error("Invalid gallery item ID: must be a valid UUID");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.from("gallery").select("*").eq("id", parsed.data).single();
  if (error) throw error;
  return data;
}

export async function getGalleryItemBySlug(slug: string) {
  await requireAdmin();

  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) {
    throw new Error("Invalid gallery item slug");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.from("gallery").select("*").eq("slug", parsed.data).single();
  if (error) throw error;
  return data;
}

export async function createGalleryItem(data: Record<string, unknown>) {
  await requireAdmin();

  const parsed = createGallerySchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Invalid gallery item data: " + parsed.error.issues[0].message);
  }

  const supabase = await createClient();
  const { imageUrl, fileUrl, thumbnailUrl, ...galleryData } = parsed.data;
  const slug = await createUniqueGallerySlug(parsed.data.slug || parsed.data.judul);
  const payload = {
    ...galleryData,
    slug,
    fileUrl: fileUrl || imageUrl,
    thumbnailUrl: thumbnailUrl || fileUrl || imageUrl || null,
    kategori: parsed.data.kategori || null,
  };
  const { data: item, error } = await supabase.from("gallery").insert(toSnakeCase(payload)).select().single();
  if (error) throw error;
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

  const supabase = await createClient();
  const { data: existing, error: existingError } = await supabase.from("gallery").select("id").eq("slug", parsedSlug.data).single();
  if (existingError) throw existingError;

  return updateGalleryItemById(existing.id, data);
}

async function updateGalleryItemById(id: string, data: Record<string, unknown>) {
  const parsed = updateGallerySchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Invalid gallery item data: " + parsed.error.issues[0].message);
  }

  const { imageUrl, fileUrl, thumbnailUrl, ...galleryData } = parsed.data;
  const slug = parsed.data.slug || parsed.data.judul ? await createUniqueGallerySlug(parsed.data.slug || parsed.data.judul || "gallery-media", id) : undefined;
  const payload = {
    ...galleryData,
    ...(slug ? { slug } : {}),
    ...(fileUrl || imageUrl ? { fileUrl: fileUrl || imageUrl } : {}),
    ...(thumbnailUrl !== undefined || fileUrl || imageUrl ? { thumbnailUrl: thumbnailUrl || fileUrl || imageUrl || null } : {}),
    ...(parsed.data.kategori !== undefined ? { kategori: parsed.data.kategori || null } : {}),
    ...(parsed.data.deskripsi !== undefined ? { deskripsi: parsed.data.deskripsi || null } : {}),
  };

  const supabase = await createClient();
  const { data: item, error } = await supabase
    .from("gallery")
    .update(toSnakeCase(payload))
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  updatePublicContent([CACHE_TAGS.gallery]);
  return item;
}

export async function deleteGalleryItem(id: string) {
  await requireAdmin();

  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) {
    throw new Error("Invalid gallery item ID: must be a valid UUID");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("gallery").delete().eq("id", parsed.data);
  if (error) throw error;
  updatePublicContent([CACHE_TAGS.gallery]);
  return { success: true };
}

export async function getGalleryStats() {
  const supabase = await createClient();
  const { data: items } = await supabase.from("gallery").select("fileType, fileSize");
  
  const total = items?.length ?? 0;
  const totalSize = items?.reduce((sum, item) => sum + (item.fileSize || 0), 0) ?? 0;
  const images = items?.filter(item => item.fileSize && item.fileType?.startsWith("image/")).length ?? 0;
  const videos = items?.filter(item => item.fileSize && item.fileType?.startsWith("video/")).length ?? 0;
  
  return { total, totalSize, images, videos };
}

export async function bulkDeleteGalleryItems(ids: string[]) {
  await requireAdmin();
  
  for (const id of ids) {
    const parsed = uuidSchema.safeParse(id);
    if (!parsed.success) {
      throw new Error("Invalid gallery item ID: must be a valid UUID");
    }
  }
  
  const supabase = await createClient();
  const { error } = await supabase.from("gallery").delete().in("id", ids);
  if (error) throw error;
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
  const supabase = await createClient();

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
  const supabase = await createClient();

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
