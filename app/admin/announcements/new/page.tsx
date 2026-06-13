import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { AdminRuntimeFallback } from "@/components/admin/AdminRuntimeFallback";
import { AnnouncementForm } from "../AnnouncementForm";

export const metadata: Metadata = { title: "New Announcement" };

async function NewAnnouncementRuntimeContent() {
  await connection();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-orbitron text-2xl font-bold uppercase tracking-wider text-primary">
          CREATE_ANNOUNCEMENT
        </h1>
        <p className="text-sm text-muted-foreground font-mono">
          Broadcast a new message to specific paths or placement systems
        </p>
      </div>
      <AnnouncementForm mode="create" />
    </div>
  );
}

export default function NewAnnouncementPage() {
  return (
    <Suspense fallback={<AdminRuntimeFallback label="LOADING_ANNOUNCEMENT_CREATE" />}>
      <NewAnnouncementRuntimeContent />
    </Suspense>
  );
}
