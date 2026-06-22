import "server-only";

import { createAdminClient } from "./admin";
import type { Database } from "./types";

function getStorageClient() {
  return createAdminClient();
}

export interface AttachmentMetadata {
  url: string;
  filename: string;
  size: number;
  type: string;
}

export interface UploadResult {
  success: boolean;
  data?: AttachmentMetadata;
  error?: string;
}

/**
 * Uploads a file to Supabase Storage in the contact-attachments bucket
 */
export async function uploadContactAttachment(
  file: Buffer | Blob,
  filename: string
): Promise<UploadResult> {
  const supabase = getStorageClient();
  const bucket = "contact-attachments";

  const timestamp = Date.now();
  const ext = filename.split(".").pop() || "bin";
  const uniqueName = `contact_${timestamp}_${Math.random().toString(36).slice(2)}.${ext}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(uniqueName, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: undefined,
    });

  if (error) {
    console.error("Failed to upload attachment:", error);
    return {
      success: false,
      error: `Upload failed: ${error.message}`,
    };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return {
    success: true,
    data: {
      url: publicUrl,
      filename: filename,
      size: file instanceof Blob ? file.size : file.length,
      type: ext,
    },
  };
}

/**
 * Generates a signed URL for downloading a private attachment
 */
export async function getAttachmentSignedUrl(
  path: string,
  expiresIn: number = 3600
): Promise<string | null> {
  const supabase = getStorageClient();
  const bucket = "contact-attachments";

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) {
    console.error("Failed to create signed URL:", error);
    return null;
  }

  return data.signedUrl;
}

/**
 * Deletes an attachment from Supabase Storage
 */
export async function deleteAttachments(paths: string[]): Promise<boolean> {
  if (paths.length === 0) return true;

  const supabase = getStorageClient();
  const bucket = "contact-attachments";

  const { error } = await supabase.storage.from(bucket).remove(paths);

  if (error) {
    console.error("Failed to delete attachments:", error);
    return false;
  }

  return true;
}

/**
 * Extracts storage path from a full Supabase Storage URL
 */
export function extractStoragePath(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    const match = pathname.match(/\/storage\/v1\/object\/public\/contact-attachments\/(.+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Validates file upload against size and type restrictions
 */
export function validateAttachment(
  file: { size: number; type: string; name: string },
  maxSizeMB: number = 10,
  allowedTypes: string[] = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ]
): { valid: boolean; error?: string } {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type "${file.type}" is not allowed`,
    };
  }

  return { valid: true };
}
