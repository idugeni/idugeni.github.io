import type { Metadata } from "next";

/**
 * Helper untuk validasi struktur dan kelengkapan metadata.
 * Akan melempar error jika ada field penting yang kosong atau salah tipe.
 * @param meta Metadata yang akan divalidasi
 * @returns Metadata yang sudah tervalidasi
 */
export function validateMetadata(meta: Metadata): Metadata {
  if (!meta.title || typeof meta.title !== "string") {
    throw new Error("Metadata: 'title' wajib diisi dan harus berupa string.");
  }
  if (!meta.description || typeof meta.description !== "string") {
    throw new Error("Metadata: 'description' wajib diisi dan harus berupa string.");
  }
  if (!meta.openGraph || typeof meta.openGraph !== "object") {
    throw new Error("Metadata: 'openGraph' wajib diisi dan harus berupa object.");
  }
  if (!meta.twitter || typeof meta.twitter !== "object") {
    throw new Error("Metadata: 'twitter' wajib diisi dan harus berupa object.");
  }
  // Validasi robots (opsional, tergantung kebutuhan)
  if (!meta.robots || typeof meta.robots !== "object") {
    throw new Error("Metadata: 'robots' wajib diisi dan harus berupa object.");
  }
  // Validasi keywords (opsional)
  if (!meta.keywords || typeof meta.keywords !== "string") {
    throw new Error("Metadata: 'keywords' wajib diisi dan harus berupa string.");
  }
  // Tambah validasi lain sesuai kebutuhan
  return meta;
}
