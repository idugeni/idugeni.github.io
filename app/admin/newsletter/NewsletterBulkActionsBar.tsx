"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserCheck, XCircle, Trash2 } from "@/lib/icons";
import { ConfirmActionDialog } from "@/components/admin/ConfirmActionDialog";

type PendingAction = { key: string; title: string; description: string; label: string; destructive?: boolean; action: () => Promise<void> } | null;

export function NewsletterBulkActionsBar({ selectedCount, onActivate, onDeactivate, onDelete, onClearSelection }: { selectedCount: number; onActivate: () => Promise<void>; onDeactivate: () => Promise<void>; onDelete: () => Promise<void>; onClearSelection: () => void }) {
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [isPending, setIsPending] = useState(false);
  if (!selectedCount) return null;
  const confirm = async () => { if (!pendingAction) return; setIsPending(true); try { await pendingAction.action(); setPendingAction(null); } finally { setIsPending(false); } };
  return <><div className="flex flex-wrap items-center justify-between gap-3 border border-primary/30 bg-primary/5 p-3"><span className="font-mono text-xs text-primary">{selectedCount} SUBSCRIBER(S)_SELECTED</span><div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" className="rounded-none font-mono" onClick={() => setPendingAction({ key: "activate", title: "ACTIVATE_SUBSCRIBERS", description: `Activate ${selectedCount} selected subscriber(s)?`, label: "ACTIVATE", action: onActivate })}><UserCheck className="mr-2 h-4 w-4" />ACTIVATE</Button><Button variant="outline" size="sm" className="rounded-none font-mono" onClick={() => setPendingAction({ key: "deactivate", title: "DEACTIVATE_SUBSCRIBERS", description: `Deactivate ${selectedCount} selected subscriber(s)?`, label: "DEACTIVATE", action: onDeactivate })}><XCircle className="mr-2 h-4 w-4" />DEACTIVATE</Button><Button variant="destructive" size="sm" className="rounded-none font-mono" onClick={() => setPendingAction({ key: "delete", title: "DELETE_SUBSCRIBERS", description: `Delete ${selectedCount} selected subscriber(s)? This action cannot be undone.`, label: "DELETE", destructive: true, action: onDelete })}><Trash2 className="mr-2 h-4 w-4" />DELETE</Button><Button variant="ghost" size="sm" className="rounded-none font-mono" onClick={onClearSelection}>CLEAR</Button></div></div><ConfirmActionDialog open={!!pendingAction} onOpenChange={(open) => !open && setPendingAction(null)} title={pendingAction?.title ?? "CONFIRM_ACTION"} description={pendingAction?.description ?? "Confirm this action."} confirmLabel={pendingAction?.label ?? "CONFIRM"} variant={pendingAction?.destructive ? "destructive" : "default"} isPending={isPending} onConfirm={confirm} /></>;
}
