import type { Metadata } from "next";
import { Suspense } from "react";
import { getAdminAnnouncements, type Announcement } from "@/actions/announcements";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AnnouncementsClient } from "./AnnouncementsClient";
import { Button } from "@/components/ui/button";
import { Plus, Loader2Icon } from "@/lib/icons";
import Link from "next/link";

export const metadata: Metadata = { title: "Announcements" };

/**
 * Admin Announcements Page (Server Component)
 * 
 * Architecture:
 * - Server Component: Fetches data server-side with requireAdmin auth
 * - Suspense: Streams data progressively
 * - AnnouncementsClient: Islands pattern for interactivity
 * 
 * Benefits:
 * - No useEffect infinite loops
 * - Auth enforced at request time
 * - Server-side caching
 * - Zero hydration mismatches
 */

async function AnnouncementsContent() {
  let announcements: Announcement[] = [];
  let error: string | null = null;

  try {
    announcements = await getAdminAnnouncements();
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load announcements";
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-orbitron text-2xl font-bold uppercase tracking-wider text-primary">
            ANNOUNCEMENTS
          </h1>
          <p className="text-sm text-muted-foreground font-mono">
            Manage global notifications, banners, popup modals, and cards
          </p>
        </div>
        <div>
          <Link href="/admin/announcements/new" prefetch={false}>
            <Button className="rounded-none font-mono text-xs text-primary-foreground">
              <Plus className="mr-2 h-4 w-4" />
              NEW_ANNOUNCEMENT
            </Button>
          </Link>
        </div>
      </div>

      {error ? (
        <div className="rounded-none border border-red-500/30 bg-red-500/10 p-6">
          <p className="text-red-400 font-mono text-sm">{error}</p>
        </div>
      ) : (
        <AnnouncementsClient initialAnnouncements={announcements} />
      )}
    </div>
  );
}

function AnnouncementsLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
      <p className="font-mono text-xs text-muted-foreground">Retrieving announcements...</p>
    </div>
  );
}

export default function AdminAnnouncementsPage() {
  return (
    <Suspense fallback={<AnnouncementsLoading />}>
      <AnnouncementsContent />
    </Suspense>
  );
}
