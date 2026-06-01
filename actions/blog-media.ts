"use server";

import { requireAdmin } from "@/lib/auth/rbac";
import { createServiceClient } from "@/lib/supabase/service";
import { z } from "zod";

const MEDIA_BUCKET = "media";
const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
]);

const slugSchema = z.string().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const mediaKindSchema = z.enum(["image", "video"]);

function safeFileName(name: string) {
  const fallback = "media";
  const normalized = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
  return normalized || fallback;
}

function extensionFor(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension && ["jpg", "jpeg", "png", "gif", "webp", "svg", "mp4", "webm"].includes(extension)) return extension;
  return file.type.split("/")[1] || "bin";
}

async function uploadToMediaBucket(file: File, pathPrefix: string) {
  await requireAdmin();

  if (!allowedMimeTypes.has(file.type)) {
    throw new Error("Unsupported media type. Use JPG, PNG, GIF, WEBP, SVG, MP4, or WEBM.");
  }

  const supabase = createServiceClient();
  const fileName = safeFileName(file.name.replace(/\.[^.]+$/, ""));
  const extension = extensionFor(file);
  const path = `${pathPrefix}/${Date.now()}-${fileName}.${extension}`;

  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path, bucket: MEDIA_BUCKET, fileType: file.type, fileSize: file.size };
}

function getRequiredFile(formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("Media file is required");
  return file;
}

export async function uploadBlogThumbnail(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) throw new Error("Invalid blog thumbnail slug");
  return uploadToMediaBucket(getRequiredFile(formData), `blog/thumbnails/${parsed.data}`);
}

export async function uploadProjectThumbnail(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) throw new Error("Invalid project thumbnail slug");
  return uploadToMediaBucket(getRequiredFile(formData), `projects/thumbnails/${parsed.data}`);
}

export async function uploadGalleryMedia(formData: FormData) {
  const slug = String(formData.get("slug") || "gallery");
  const kind = String(formData.get("kind") || "image");
  const parsedSlug = slugSchema.safeParse(slug);
  const parsedKind = mediaKindSchema.safeParse(kind);
  if (!parsedSlug.success) throw new Error("Invalid gallery media slug");
  if (!parsedKind.success) throw new Error("Invalid gallery media type");
  const folder = parsedKind.data === "video" ? "gallery/videos" : "gallery/images";
  return uploadToMediaBucket(getRequiredFile(formData), `${folder}/${parsedSlug.data}`);
}
