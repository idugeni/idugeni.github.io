import type { Metadata } from "next";
import { Suspense } from "react";
import { getAdminShortlinks, getShortlinkStats } from "@/actions/shortlinks";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Loader2Icon } from "@/lib/icons";
import Link from "next/link";
import { ShortlinkListClient } from "./ShortlinkListClient";

export const metadata: Metadata = { title: "Shortlinks" };

type SearchParams = Promise<{
  page?: string;
  search?: string;
  displayMode?: "direct" | "safelink" | "splash" | "warning";
}>;

async function ShortlinksContent({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  let pageData = null;
  let stats = null;
  let error: string | null = null;

  try {
    const page = params.page ? parseInt(params.page, 10) : 1;

    const [pd, st] = await Promise.all([
      getAdminShortlinks({
        page,
        pageSize: 20,
        search: params.search,
        displayMode: params.displayMode,
      }),
      getShortlinkStats(),
    ]);
    pageData = pd;
    stats = st;
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load shortlinks data";
  }

  if (error) {
    return (
      <div className="rounded-none border border-red-500/30 bg-red-500/10 p-6">
        <p className="font-mono text-sm text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="SHORTLINK_CONTROL_CENTER"
        title="Shortlinks"
        subtitle="Manage short URLs with QR codes, multiple display modes, password protection, and comprehensive analytics tracking."
        actions={
          <>
            {stats!.trashed > 0 && (
              <Button asChild variant="outline" className="rounded-none font-mono">
                <Link href="/admin/shortlinks/trash">
                  <Trash2 className="mr-2 h-4 w-4" /> TRASH ({stats!.trashed})
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
        initialShortlinks={pageData!.shortlinks}
        stats={stats!}
        pagination={pageData!.pagination}
        filters={{
          search: params.search,
          displayMode: params.displayMode,
        }}
      />
    </div>
  );
}

function ShortlinksLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
      <p className="font-mono text-xs text-muted-foreground">Loading shortlinks...</p>
    </div>
  );
}

export default function AdminShortlinks({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<ShortlinksLoading />}>
      <ShortlinksContent searchParams={searchParams} />
    </Suspense>
  );
}
