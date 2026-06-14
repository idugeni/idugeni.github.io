"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Star } from "@/lib/icons";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmActionDialog } from "@/components/admin/ConfirmActionDialog";

interface ProjectBulkActionsBarProps { selectedCount: number; onBulkDelete: () => void; onBulkChangeStatus: (status: "ongoing" | "completed" | "archived") => void; onBulkSetFeatured: () => void; onBulkUnsetFeatured: () => void; onClearSelection: () => void; }
type ProjectStatus = "ongoing" | "completed" | "archived";
type PendingAction = { title: string; description: string; label: string; destructive?: boolean; action: () => void } | null;

export function ProjectBulkActionsBar({ selectedCount, onBulkDelete, onBulkChangeStatus, onBulkSetFeatured, onBulkUnsetFeatured, onClearSelection }: ProjectBulkActionsBarProps) {
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  if (selectedCount === 0) return null;
  const confirm = () => { pendingAction?.action(); setPendingAction(null); };
  const requestStatusChange = (status: ProjectStatus) => setPendingAction({ title: "CHANGE_PROJECT_STATUS", description: `Change ${selectedCount} selected project(s) to ${status.toUpperCase()}?`, label: "CHANGE_STATUS", action: () => onBulkChangeStatus(status) });
  return <><div className="flex items-center justify-between p-4 bg-secondary/50 border border-border/50 rounded-none"><div className="flex items-center gap-4"><span className="font-mono text-sm">{selectedCount} PROJECT{selectedCount > 1 ? "S" : ""} SELECTED</span><Button variant="ghost" size="sm" onClick={onClearSelection} className="font-mono text-xs">CLEAR</Button></div><div className="flex items-center gap-2"><Select onValueChange={(v) => requestStatusChange(v as ProjectStatus)}><SelectTrigger className="w-[140px] h-8 font-mono text-xs rounded-none border-border/50"><SelectValue placeholder="CHANGE_STATUS" /></SelectTrigger><SelectContent className="rounded-none border-border/50"><SelectItem value="ongoing" className="font-mono text-xs">ONGOING</SelectItem><SelectItem value="completed" className="font-mono text-xs">COMPLETED</SelectItem><SelectItem value="archived" className="font-mono text-xs">ARCHIVED</SelectItem></SelectContent></Select><Button variant="outline" size="sm" onClick={() => setPendingAction({ title: "FEATURE_PROJECTS", description: `Feature ${selectedCount} selected project(s)?`, label: "FEATURE", action: onBulkSetFeatured })} className="font-mono text-xs rounded-none border-border/50"><Star className="w-4 h-4 mr-2" />FEATURE</Button><Button variant="outline" size="sm" onClick={() => setPendingAction({ title: "UNFEATURE_PROJECTS", description: `Remove featured state from ${selectedCount} selected project(s)?`, label: "UNFEATURE", action: onBulkUnsetFeatured })} className="font-mono text-xs rounded-none border-border/50"><Star className="w-4 h-4 mr-2" />UNFEATURE</Button><Button variant="destructive" size="sm" onClick={() => setPendingAction({ title: "DELETE_PROJECTS", description: `Delete ${selectedCount} selected project(s)? This action cannot be undone.`, label: "DELETE", destructive: true, action: onBulkDelete })} className="font-mono text-xs rounded-none"><Trash2 className="w-4 h-4 mr-2" />DELETE</Button></div></div><ConfirmActionDialog open={!!pendingAction} onOpenChange={(open) => !open && setPendingAction(null)} title={pendingAction?.title ?? "CONFIRM_ACTION"} description={pendingAction?.description ?? "Confirm this action."} confirmLabel={pendingAction?.label ?? "CONFIRM"} variant={pendingAction?.destructive ? "destructive" : "default"} onConfirm={confirm} /></>;
}
