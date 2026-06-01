import { getAdminShortlinks, getShortlinkStats } from "@/actions/shortlinks";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "@/lib/icons";
import Link from "next/link";
import { ShortlinkListClient } from "./ShortlinkListClient";

type SearchParams = Promise<{
  page?: string;
  search?: string;
  displayMode?: "direct" | "safelink" | "splash" | "warning";
}>;

export default async function AdminShortlinks({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1;

  const [pageData, stats] = await Promise.all([
    getAdminShortlinks({
      page,
      pageSize: 20,
      search: params.search,
      displayMode: params.displayMode,
    }),
    getShortlinkStats(),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="SHORTLINK_CONTROL_CENTER"
        title="Shortlinks"
        subtitle="Manage short URLs with QR codes, multiple display modes, password protection, and comprehensive analytics tracking."
        actions={
          <>
            {stats.trashed > 0 && (
              <Button asChild variant="outline" className="rounded-none font-mono">
                <Link href="/admin/shortlinks/trash">
                  <Trash2 className="mr-2 h-4 w-4" /> TRASH ({stats.trashed})
                </Link>
              </Button>
            )}
            <Button asChild className="rounded-none bg-primary font-mono text-primary-foreground hover:bg-primary/90">
              <Link href="/admin/shortlinks/new">
                <Plus className="mr-2 h-4 w-4" /> NEW_SHORTLINK
              </Link>
            </Button>
          </>
        }
      />

      <ShortlinkListClient
        initialShortlinks={pageData.shortlinks}
        stats={stats}
        pagination={pageData.pagination}
        filters={{
          search: params.search,
          displayMode: params.displayMode,
        }}
      />
    </div>
  );
}
