"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Shortlink } from "@/actions/shortlinks";
import { restoreShortlink, permanentDeleteShortlink } from "@/actions/shortlinks";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Undo } from "@/lib/icons";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminTableActionButton } from "@/components/admin/AdminTableActionButton";
import { toast } from "sonner";
import { ConfirmActionDialog } from "@/components/admin/ConfirmActionDialog";

export function TrashListClient({ shortlinks }: { shortlinks: Shortlink[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shortlinkToDelete, setShortlinkToDelete] = useState<string | null>(null);

  const handleRestore = async (id: string) => {
    setLoading(id);
    try {
      await restoreShortlink(id);
      toast.success("Shortlink restored successfully");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to restore");
    } finally {
      setLoading(null);
    }
  };

  const handlePermanentDeleteClick = (id: string) => {
    setShortlinkToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handlePermanentDelete = async () => {
    if (!shortlinkToDelete) return;
    setLoading(shortlinkToDelete);
    try {
      await permanentDeleteShortlink(shortlinkToDelete);
      toast.success("Shortlink permanently deleted");
      router.refresh();
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete");
    } finally {
      setLoading(null);
    }
  };

  if (shortlinks.length === 0) {
    return (
      <Card className="admin-panel">
        <CardContent className="py-12 text-center">
          <Trash2 className="mx-auto mb-3 h-8 w-8 text-muted-foreground animate-pulse" />
          <p className="font-mono text-sm text-muted-foreground">Trash is empty</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="admin-panel">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table className="w-full table-fixed">
            <TableHeader>
              <TableRow className="border-b border-border/50 bg-secondary/30 hover:bg-transparent">
                <TableHead className="w-48 font-mono text-xs uppercase tracking-wider text-primary">Code</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider text-primary">Destination</TableHead>
                <TableHead className="w-56 font-mono text-xs uppercase tracking-wider text-primary">Deleted At</TableHead>
                <TableHead className="w-32 text-right font-mono text-xs uppercase tracking-wider text-primary">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shortlinks.map((s) => (
                <TableRow key={s.id} className="border-border/50 hover:bg-secondary/20">
                  <TableCell className="py-3">
                    <div className="space-y-1">
                      <code className="font-mono text-sm font-medium text-primary">{s.code}</code>
                      {s.title && <p className="truncate text-xs text-muted-foreground">{s.title}</p>}
                    </div>
                  </TableCell>
                  
                  <TableCell className="py-3">
                    <span className="block max-w-xs truncate text-sm text-muted-foreground" title={s.destination_url}>
                      {s.destination_url}
                    </span>
                  </TableCell>
                  
                  <TableCell className="py-3 font-mono text-xs text-muted-foreground">
                    {s.deleted_at ? new Date(s.deleted_at).toLocaleString() : "—"}
                  </TableCell>
                  
                  <TableCell className="py-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      <AdminTableActionButton
                        label="Restore shortlink"
                        icon={Undo}
                        intent="status"
                        onClick={() => handleRestore(s.id)}
                        disabled={loading === s.id}
                      />
                      <AdminTableActionButton
                        label="Delete shortlink permanently"
                        icon={Trash2}
                        intent="delete"
                        onClick={() => handlePermanentDeleteClick(s.id)}
                        disabled={loading === s.id}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <ConfirmActionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="PERMANENT_DELETE"
        description="Permanently delete this shortlink? This cannot be undone."
        confirmLabel="DELETE_FOREVER"
        variant="destructive"
        isPending={loading === shortlinkToDelete}
        onConfirm={handlePermanentDelete}
      />
    </Card>
  );
}
