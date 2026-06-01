import { PublicLayout } from "@/components/layout/public-layout";
import { GalleryClient } from "@/components/pages/gallery/gallery-client";
import { getGalleryIndexData } from "@/lib/data/public-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Koleksi visual dari workspace, events, achievements, dan momen di balik layar pengembangan proyek.",
};

export default async function GalleryPage() {
  const { items, error } = await getGalleryIndexData();

  if (error) {
    return (
      <PublicLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Failed to load gallery.</p>
        </div>
      </PublicLayout>
    );
  }


  return (
    <PublicLayout>
      <GalleryClient items={items} />
    </PublicLayout>
  );
}
