"use client";

import { useState } from "react";
import Link from "next/link";
import { deleteAnnouncement, type Announcement } from "@/actions/announcements";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ConfirmActionDialog } from "@/components/admin/ConfirmActionDialog";
import { AlertTriangle, Calendar, Clock, Edit, Trash2 } from "@/lib/icons";

interface AnnouncementsClientProps {
  initialAnnouncements: Announcement[];
}

export function AnnouncementsClient({ initialAnnouncements }: AnnouncementsClientProps) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setAnnouncementToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!announcementToDelete) return;
    try {
      await deleteAnnouncement(announcementToDelete);
      toast({ title: "Announcement deleted successfully!" });
      setAnnouncements((prev) => prev.filter((item) => item.id !== announcementToDelete));
      setDeleteDialogOpen(false);
    } catch (err) {
      toast({ 
        title: "Error", 
        description: err instanceof Error ? err.message : "Failed to delete announcement", 
        variant: "destructive" 
      });
    }
  };

  const getStatusBadge = (item: Announcement) => {
    if (!item.is_active) {
      return (
        <span className="border border-border/45 bg-secondary/30 text-muted-foreground px-2 py-0.5 text-[9px] uppercase font-bold font-mono">
          DRAFT
        </span>
      );
    }

    const now = new Date();
    const start = item.starts_at ? new Date(item.starts_at) : null;
    const end = item.ends_at ? new Date(item.ends_at) : null;

    if (end && end < now) {
      return (
        <span className="border border-red-500/20 bg-red-500/10 text-red-400 px-2 py-0.5 text-[9px] uppercase font-bold font-mono">
          EXPIRED
        </span>
      );
    }

    if (start && start > now) {
      return (
        <span className="border border-amber-500/20 bg-amber-500/10 text-amber-400 px-2 py-0.5 text-[9px] uppercase font-bold font-mono">
          SCHEDULED
        </span>
      );
    }

    return (
      <span className="border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-[9px] uppercase font-bold font-mono">
        ACTIVE
      </span>
    );
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "info": return "border-cyan-500/20 bg-cyan-500/10 text-cyan-400";
      case "warning": return "border-amber-500/20 bg-amber-500/10 text-amber-400";
      case "success": return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
      case "danger": return "border-red-500/20 bg-red-500/10 text-red-400";
      case "primary": return "border-primary/20 bg-primary/5 text-primary";
      default: return "border-border/40 bg-secondary/30 text-muted-foreground";
    }
  };

  return (
    <Card className="rounded-none border-primary/25 bg-card/90">
      <CardHeader className="border-b border-border/40">
        <CardTitle className="font-orbitron text-sm uppercase tracking-wider text-primary">
          ANNOUNCEMENT_REGISTRY
        </CardTitle>
        <CardDescription className="font-mono text-[10px] text-muted-foreground">
          List of all announcements. Active schedules are rendered on the public pages matching the route target
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {announcements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <AlertTriangle className="h-8 w-8 text-amber-400 animate-bounce" />
            <p className="font-mono text-xs text-amber-400 uppercase font-semibold">No announcements found</p>
            <p className="font-mono text-[10px] text-muted-foreground">Click NEW_ANNOUNCEMENT to create your first announcement.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-border/40 text-muted-foreground uppercase text-[10px]">
                  <th className="pb-3">TITLE</th>
                  <th className="pb-3">PLACEMENT</th>
                  <th className="pb-3">TYPE</th>
                  <th className="pb-3">STATUS</th>
                  <th className="pb-3">ROUTING</th>
                  <th className="pb-3">TIMELINE</th>
                  <th className="pb-3 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {announcements.map((item) => (
                  <tr key={item.id} className="border-b border-border/20 hover:bg-secondary/20 transition-colors">
                    <td className="py-4 font-semibold text-foreground max-w-xs truncate">{item.title}</td>
                    <td className="py-4 uppercase text-[10px]">
                      <span className="inline-block border border-border/50 bg-secondary/30 px-1.5 py-0.5">
                        {item.placement}
                      </span>
                    </td>
                    <td className="py-4 uppercase text-[10px]">
                      <span className={`inline-block border px-1.5 py-0.5 ${getBadgeColor(item.type)}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="py-4">{getStatusBadge(item)}</td>
                    <td className="py-4">
                      <code className="text-primary font-mono text-xs">{item.target_page}</code>
                    </td>
                    <td className="py-4 text-[10px] text-muted-foreground space-y-0.5">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Start: {item.starts_at ? new Date(item.starts_at).toLocaleString() : "Immediate"}</span>
                      </div>
                      {item.ends_at && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-red-400" />
                          <span className="text-red-400">Ends: {new Date(item.ends_at).toLocaleString()}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/announcements/${item.id}/edit`}>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-secondary/40">
                            <Edit className="h-3.5 w-3.5 text-primary" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(item.id)}
                          className="h-7 w-7 p-0 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-400" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      <ConfirmActionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="DELETE_ANNOUNCEMENT"
        description="Are you sure you want to permanently delete this announcement?"
        confirmLabel="DELETE"
        variant="destructive"
        isPending={false}
        onConfirm={handleDelete}
      />
    </Card>
  );
}
