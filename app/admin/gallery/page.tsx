import type { Metadata } from "next";
import { getGallery, getGalleryStats } from "@/actions/gallery";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "@/lib/icons";
import Link from "next/link";
import { GalleryListClient } from "./GalleryListClient";

export const metadata: Metadata = { title: "Gallery" };

export default async function AdminGallery() {
  // Fetch gallery items
  const items = await getGallery();
  
  // Fetch unique aspect ratios
  const aspectRatios = Array.from(new Set(items?.map(item => item.aspect_ratio).filter(Boolean) as string[]));
  
  // Fetch statistics
  const stats = await getGalleryStats();
  
  // Transform items to match expected structure
  const transformedItems = items?.map((item) => ({
    id: item.id,
    slug: item.slug,
    judul: item.judul,
    deskripsi: item.deskripsi,
    fileUrl: item.file_url,
    thumbnailUrl: item.thumbnail_url,
    fileType: item.file_type,
    fileSize: item.file_size,
    aspectRatio: item.aspect_ratio,
    width: item.width,
    height: item.height,
    created_at: item.created_at,
  })) || [];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="MEDIA_CONTROL_CENTER"
        title="Gallery"
        subtitle="Manage media collection, image and video assets, aspect ratios, and publishing-ready gallery items."
        actions={
          <Button asChild className="rounded-none bg-primary font-mono text-primary-foreground hover:bg-primary/90">
            <Link href="/admin/gallery/new">
              <Plus className="mr-2 h-4 w-4" /> NEW_MEDIA
            </Link>
          </Button>
        }
      />

      <GalleryListClient
        initialItems={transformedItems}
        aspectRatios={aspectRatios}
        stats={stats}
      />
    </div>
  );
}
