import { Suspense } from "react";
import { connection } from "next/server";
import { AdminRuntimeFallback } from "@/components/admin/AdminRuntimeFallback";
import AdminGalleryNew from "./gallery-new-client";

async function GalleryNewRuntimeContent() {
  await connection();

  return <AdminGalleryNew />;
}

export default function AdminGalleryNewPage() {
  return (
    <Suspense fallback={<AdminRuntimeFallback label="LOADING_GALLERY_CREATE" />}>
      <GalleryNewRuntimeContent />
    </Suspense>
  );
}
