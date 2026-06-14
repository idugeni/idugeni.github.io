import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { AdminRuntimeFallback } from "@/components/admin/AdminRuntimeFallback";
import StorageCleanupPage from "./gallery-cleanup-client";

export const metadata: Metadata = { title: "Gallery Cleanup" };

async function GalleryCleanupRuntimeContent() {
  await connection();

  return <StorageCleanupPage />;
}

export default function GalleryCleanupRoute() {
  return (
    <Suspense fallback={<AdminRuntimeFallback label="LOADING_STORAGE_MANAGER" />}>
      <GalleryCleanupRuntimeContent />
    </Suspense>
  );
}
