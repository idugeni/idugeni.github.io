import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { AdminRuntimeFallback } from "@/components/admin/AdminRuntimeFallback";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ShortlinkForm } from "../ShortlinkForm";

export const metadata: Metadata = { title: "New Shortlink" };

async function NewShortlinkRuntimeContent() {
  await connection();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="CREATE_SHORTLINK"
        title="New Shortlink"
        subtitle="Create a new short URL with QR code and custom display mode."
      />

      <ShortlinkForm mode="create" />
    </div>
  );
}

export default function NewShortlink() {
  return (
    <Suspense fallback={<AdminRuntimeFallback label="LOADING_SHORTLINK_CREATE" />}>
      <NewShortlinkRuntimeContent />
    </Suspense>
  );
}
