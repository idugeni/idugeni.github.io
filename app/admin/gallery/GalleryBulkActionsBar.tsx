"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "@/lib/icons";
import { ConfirmActionDialog } from "@/components/admin/ConfirmActionDialog";

interface GalleryBulkActionsBarProps { selectedCount: number; onBulkDelete: () => void; onClearSelection: () => void; }

export function GalleryBulkActionsBar({ selectedCount, onBulkDelete, onClearSelection }: GalleryBulkActionsBarProps) {
  const [open, setOpen] = useState(false);
  if (selectedCount === 0) return null;
  const handleDelete = () => { onBulkDelete(); setOpen(false); };
  return <><div className="flex items-center justify-between p-4 bg-secondary/50 border border-border/50 rounded-none"><div className="flex items-center gap-4"><span className="font-mono text-sm">{selectedCount} ITEM{selectedCount > 1 ? "S" : ""} SELECTED</span><Button variant="ghost" size="sm" onClick={onClearSelection} className="font-mono text-xs">CLEAR</Button></div><div className="flex items-center gap-2"><Button variant="destructive" size="sm" onClick={() => setOpen(true)} className="font-mono text-xs rounded-none"><Trash2 className="w-4 h-4 mr-2" />DELETE</Button></div></div><ConfirmActionDialog open={open} onOpenChange={setOpen} title="DELETE_GALLERY_ITEMS" description={`Delete ${selectedCount} selected gallery item(s)? This action cannot be undone.`} confirmLabel="DELETE" variant="destructive" onConfirm={handleDelete} /></>;
}
