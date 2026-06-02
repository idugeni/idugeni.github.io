import { Suspense } from "react";
import { getAdminAnnouncements, getAnnouncementStats, type Announcement } from "@/actions/announcements";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AnnouncementsClient } from "./AnnouncementsClient";
import { AdminLoadingSkeleton } from "@/components/admin/AdminLoadingSkeleton";
import { AdminErrorBoundary } from "@/components/admin/AdminErrorBoundary";

/**
 * Admin Announcements Page (Server Component)
 * 
 * Architecture:
 * - Server Component: Fetches data server-side, renders server-first
 * - Suspense Boundary: Streams data progressively to client
 * - AnnouncementsClient: Islands pattern for interactivity (delete, edit)
 * - Error Boundary: Graceful error handling at page level
 * 
 * Benefits:
 * - No useEffect loops or hydration mismatches
 * - Authentication enforced at request time (requireAdmin)
 * - Progressive rendering with streaming
 * - Server-side caching via revalidatePath
 * - Zero client-side initial fetch overhead
 */

async function AnnouncementsContent() {
  try {
    // Fetch data server-side with built-in auth check (requireAdmin)
    const [announcements, stats] = await Promise.all([
      getAdminAnnouncements(),
      getAnnouncementStats(),
    ]);

    return (
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="NOTIFICATION_CENTER"
          title="Announcements"
          subtitle="Manage global notifications, banners, and popup modals across all pages"
        />
        <AnnouncementsClient
          initialAnnouncements={announcements}
          stats={stats}
        />
      </div>
    );
  } catch (error) {
    throw error; // Propagate to error boundary
  }
}

export default function AdminAnnouncementsPage() {
  return (
    <AdminErrorBoundary>
      <Suspense fallback={<AdminLoadingSkeleton />}>
        <AnnouncementsContent />
      </Suspense>
    </AdminErrorBoundary>
  );
}
