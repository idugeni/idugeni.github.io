"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, CheckCircle, XCircle } from "@/lib/icons";
import { ConfirmActionDialog } from "@/components/admin/ConfirmActionDialog";

interface ServiceBulkActionsBarProps { selectedCount: number; onBulkDelete: () => void; onBulkSetActive: () => void; onBulkSetInactive: () => void; onClearSelection: () => void; }
type PendingAction = { title: string; description: string; label: string; destructive?: boolean; action: () => void } | null;

export function ServiceBulkActionsBar({ selectedCount, onBulkDelete, onBulkSetActive, onBulkSetInactive, onClearSelection }: ServiceBulkActionsBarProps) {
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  if (selectedCount === 0) return null;
  const confirm = () => { pendingAction?.action(); setPendingAction(null); };
  return <><div className="flex flex-col gap-3 rounded-none border border-border/50 bg-secondary/50 p-4 md:flex-row md:items-center md:justify-between"><div className="flex items-center gap-4"><span className="font-mono text-sm">{selectedCount} SERVICE{selectedCount > 1 ? "S" : ""} SELECTED</span><Button variant="ghost" size="sm" onClick={onClearSelection} className="font-mono text-xs">CLEAR</Button></div><div className="flex flex-wrap items-center gap-2"><Button variant="outline" size="sm" onClick={() => setPendingAction({ title: "ACTIVATE_SERVICES", description: `Activate ${selectedCount} selected service(s) on public listings?`, label: "ACTIVATE", action: onBulkSetActive })} className="rounded-none border-border/50 font-mono text-xs"><CheckCircle className="mr-2 h-4 w-4" /> ACTIVATE</Button><Button variant="outline" size="sm" onClick={() => setPendingAction({ title: "DEACTIVATE_SERVICES", description: `Deactivate ${selectedCount} selected service(s) from public listings?`, label: "DEACTIVATE", action: onBulkSetInactive })} className="rounded-none border-border/50 font-mono text-xs"><XCircle className="mr-2 h-4 w-4" /> DEACTIVATE</Button><Button variant="destructive" size="sm" onClick={() => setPendingAction({ title: "DELETE_SERVICES", description: `Delete ${selectedCount} selected service(s)? This action cannot be undone.`, label: "DELETE", destructive: true, action: onBulkDelete })} className="rounded-none font-mono text-xs"><Trash2 className="mr-2 h-4 w-4" /> DELETE</Button></div></div><ConfirmActionDialog open={!!pendingAction} onOpenChange={(open) => !open && setPendingAction(null)} title={pendingAction?.title ?? "CONFIRM_ACTION"} description={pendingAction?.description ?? "Confirm this action."} confirmLabel={pendingAction?.label ?? "CONFIRM"} variant={pendingAction?.destructive ? "destructive" : "default"} onConfirm={confirm} /></>;
}
