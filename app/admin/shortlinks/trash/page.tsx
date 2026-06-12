import { Suspense } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getTrashShortlinks } from "@/actions/shortlinks";
import { Loader2Icon } from "@/lib/icons";
import { TrashListClient } from "./TrashListClient";

async function TrashContent() {
  let shortlinks = null;
  let error: string | null = null;

  try {
    shortlinks = await getTrashShortlinks();
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load trash data";
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
        eyebrow="SHORTLINK_TRASH_BIN"
        title="Trash"
        subtitle="Soft-deleted shortlinks. Restore or permanently delete items."
      />
      <TrashListClient shortlinks={shortlinks!} />
    </div>
  );
}

function TrashLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
      <p className="font-mono text-xs text-muted-foreground">Loading trash...</p>
    </div>
  );
}

export default function AdminShortlinksTrash() {
  return (
    <Suspense fallback={<TrashLoading />}>
      <TrashContent />
    </Suspense>
  );
}
