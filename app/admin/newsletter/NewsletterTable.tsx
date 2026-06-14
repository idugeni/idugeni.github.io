"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Mail, UserCheck, XCircle } from "@/lib/icons";
import type { Database } from "@/lib/supabase/types";
import { AdminTableActionButton } from "@/components/admin/AdminTableActionButton";
import { StatusPill } from "@/components/admin/StatusPill";

export type AdminNewsletterSubscriber = Database["public"]["Tables"]["newsletter_subscribers"]["Row"];

interface Props {
  subscribers: AdminNewsletterSubscriber[];
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectOne: (id: string, checked: boolean) => void;
  onPreview: (sub: AdminNewsletterSubscriber) => void;
  onToggleStatus: (id: string, aktif: boolean) => void;
  formatDate: (value: string | null | undefined) => string;
}

export function NewsletterTable({
  subscribers,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onPreview,
  onToggleStatus,
  formatDate,
}: Props) {
  const allSelected = subscribers.length > 0 && selectedIds.length === subscribers.length;

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border/50 hover:bg-transparent">
            <TableHead className="w-12">
              <Checkbox checked={allSelected} onCheckedChange={onSelectAll} aria-label="Select all subscribers" className="rounded-none" />
            </TableHead>
            <TableHead className="font-mono text-primary">SUBSCRIBER</TableHead>
            <TableHead className="font-mono text-primary">DATES</TableHead>
            <TableHead className="font-mono text-primary">STATUS</TableHead>
            <TableHead className="font-mono text-primary text-right">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscribers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-8 text-center font-mono text-muted-foreground">
                NO_SUBSCRIBERS_FOUND
              </TableCell>
            </TableRow>
          ) : (
            subscribers.map((sub) => (
              <TableRow key={sub.id} className="border-border/50 hover:bg-secondary/40">
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(sub.id)}
                    onCheckedChange={(checked) => onSelectOne(sub.id, Boolean(checked))}
                    aria-label={`Select ${sub.email}`}
                    className="rounded-none"
                  />
                </TableCell>
                
                <TableCell className="font-mono">
                  <div className="font-medium text-foreground">{sub.email}</div>
                  <div className="text-xs text-muted-foreground">{sub.nama || "NO_NAME"}</div>
                </TableCell>
                
                <TableCell className="font-mono text-xs text-muted-foreground">
                  <div>Sub: {formatDate(sub.subscribed_at)}</div>
                  <div>Unsub: {formatDate(sub.unsubscribed_at)}</div>
                </TableCell>
                
                <TableCell>
                  <div className="inline-block py-1">
                    <StatusPill tone={sub.aktif ? "success" : "danger"}>
                      {sub.aktif ? "ACTIVE" : "UNSUBSCRIBED"}
                    </StatusPill>
                  </div>
                </TableCell>
                
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1.5">
                    <AdminTableActionButton label={`Preview ${sub.email}`} icon={Eye} intent="view" onClick={() => onPreview(sub)} />
                    <AdminTableActionButton label={`Email ${sub.email}`} icon={Mail} intent="mail" href={`mailto:${sub.email}`} />
                    <AdminTableActionButton
                      label={sub.aktif ? `Deactivate ${sub.email}` : `Activate ${sub.email}`}
                      icon={sub.aktif ? XCircle : UserCheck}
                      intent="status"
                      onClick={() => onToggleStatus(sub.id, !sub.aktif)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
