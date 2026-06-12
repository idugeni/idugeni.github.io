import { Suspense } from "react";
import { PublicLayout } from "@/components/layout/public-layout";
import { GalleryClient } from "@/components/pages/gallery/gallery-client";
import { getGalleryIndexData } from "@/lib/data/public-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Koleksi visual dari workspace, events, achievements, dan momen di balik layar pengembangan proyek.",
};

async function GalleryContent() {
  const { items, error } = await getGalleryIndexData();

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Failed to load gallery.</p>
      </div>
    );
  }

  return <GalleryClient items={items} />;
}

function GalleryFallback() {
  return <div className="min-h-[50vh]" />;
}

export default function GalleryPage() {
  return (
    <PublicLayout>
      <Suspense fallback={<GalleryFallback />}>
        <GalleryContent />
      </Suspense>
    </PublicLayout>
  );
}
