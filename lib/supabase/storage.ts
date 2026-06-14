import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Create a Supabase client with service role key for storage operations
// This bypasses RLS policies for admin operations
function getStorageClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables"
    );
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
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
 * @param file - The file to upload (from File API or Buffer)
 * @param filename - Original filename to preserve
 * @returns UploadResult with metadata or error
 */
export async function uploadContactAttachment(
  file: Buffer | Blob,
  filename: string
): Promise<UploadResult> {
  const supabase = getStorageClient();
  const bucket = "contact-attachments";

  // Generate unique filename to avoid conflicts
  const timestamp = Date.now();
  const ext = filename.split(".").pop() || "bin";
  const uniqueName = `contact_${timestamp}_${Math.random().toString(36).slice(2)}.${ext}`;

  // Upload to storage
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(uniqueName, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: undefined, // Let Supabase detect content type
    });

  if (error) {
    console.error("Failed to upload attachment:", error);
    return {
      success: false,
      error: `Upload failed: ${error.message}`,
    };
  }

  // Get public URL
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
 * @param path - Storage path of the file
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns Signed URL or null if failed
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
 * @param paths - Array of storage paths to delete
 * @returns Success status
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
 * @param url - Full public URL
 * @returns Storage path or null if invalid
 */
export function extractStoragePath(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // Extract path after /storage/v1/object/public/contact-attachments/
    const match = pathname.match(/\/storage\/v1\/object\/public\/contact-attachments\/(.+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Validates file upload against size and type restrictions
 * @param file - File to validate
 * @param maxSizeMB - Maximum file size in MB (default: 10)
 * @param allowedTypes - Array of allowed MIME types (default: common document types)
 * @returns Validation result
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
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type "${file.type}" is not allowed`,
    };
  }

  return { valid: true };
}
