"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "@/lib/icons";
import { deleteGalleryItem } from "@/actions/gallery";
import { useToast } from "@/hooks/use-toast";
import { ConfirmActionDialog } from "@/components/admin/ConfirmActionDialog";
import { AdminTableActionButton } from "@/components/admin/AdminTableActionButton";

interface DeleteGalleryItemButtonProps { itemId: string; itemTitle: string; }
export function DeleteGalleryItemButton({ itemId, itemTitle }: DeleteGalleryItemButtonProps) {
  const router = useRouter(); const { toast } = useToast(); const [open, setOpen] = useState(false); const [isPending, setIsPending] = useState(false);
  const handleDelete = async () => { setIsPending(true); try { await deleteGalleryItem(itemId); toast({ title: "Gallery item deleted successfully" }); router.refresh(); setOpen(false); } catch (error) { toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to delete gallery item", variant: "destructive" }); } finally { setIsPending(false); } };
  return <><AdminTableActionButton label={`Delete ${itemTitle}`} icon={Trash2} intent="delete" onClick={() => setOpen(true)} /><ConfirmActionDialog open={open} onOpenChange={setOpen} title="DELETE_GALLERY_ITEM" description={`Delete gallery item \"${itemTitle}\"? This action cannot be undone.`} confirmLabel="DELETE" variant="destructive" isPending={isPending} onConfirm={handleDelete} /></>;
}
