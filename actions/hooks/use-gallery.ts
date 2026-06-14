"use client";

import { useQuery, useServerAction } from "./_base";
import {
  getGallery,
  createGalleryItem,
  deleteGalleryItem,
} from "@/actions/gallery";

export function useGetGalleryItems(filters?: { tipe?: string; kategori?: string }) {
  return useQuery(getGallery, filters);
}
export function useCreateGalleryItem() { return useServerAction(createGalleryItem); }
export function useDeleteGalleryItem() { return useServerAction(deleteGalleryItem); }
