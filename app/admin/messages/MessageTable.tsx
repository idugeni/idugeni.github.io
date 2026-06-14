"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Mail, MailCheck, MailOpen, Paperclip, Reply, Send, XCircle } from "@/lib/icons";
import type { Database } from "@/lib/supabase/types";
import { AdminTableActionButton } from "@/components/admin/AdminTableActionButton";
import { StatusPill } from "@/components/admin/StatusPill";

export type AdminContactMessage = Database["public"]["Tables"]["contact_messages"]["Row"];

interface MessageTableProps {
  messages: AdminContactMessage[];
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectOne: (id: string, checked: boolean) => void;
  onPreview: (message: AdminContactMessage) => void;
  onMarkRead: (id: string) => void;
  onMarkReplied: (id: string) => void;
  onRetry: (id: string) => void;
}

const getDeliveryTone = (status: AdminContactMessage["resend_admin_status"]) => {
  if (status === "sent") return "success";
  if (status === "failed") return "danger";
  return "muted";
};

export function MessageTable({
  messages,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onPreview,
  onMarkRead,
  onMarkReplied,
  onRetry,
}: MessageTableProps) {
  const allSelected = messages.length > 0 && selectedIds.length === messages.length;

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border/50 hover:bg-transparent">
            <TableHead className="w-12">
              <Checkbox checked={allSelected} onCheckedChange={onSelectAll} aria-label="Select all messages" className="rounded-none" />
            </TableHead>
            <TableHead className="font-mono text-primary">SENDER</TableHead>
            <TableHead className="font-mono text-primary">MESSAGE</TableHead>
            <TableHead className="font-mono text-primary">STATUS</TableHead>
            <TableHead className="font-mono text-primary">RESEND</TableHead>
            <TableHead className="font-mono text-primary text-right">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {messages.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center font-mono text-muted-foreground">
                NO_TRANSMISSIONS_FOUND
              </TableCell>
            </TableRow>
          ) : (
            messages.map((message) => (
              <TableRow key={message.id} className={`border-border/50 ${message.dibaca ? "opacity-70" : "bg-primary/5"}`}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(message.id)}
                    onCheckedChange={(checked) => onSelectOne(message.id, Boolean(checked))}
                    aria-label={`Select ${message.subjek}`}
                    className="rounded-none"
                  />
                </TableCell>
                
                <TableCell className="font-mono">
                  <div className="flex items-center gap-2 font-medium">
                    {!message.dibaca ? <Mail className="h-4 w-4 text-primary" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                    {message.nama}
                  </div>
                  <div className="text-xs text-muted-foreground">{message.email}</div>
                  <div className="text-xs text-muted-foreground">WA: {message.no_wa || "-"}</div>
                </TableCell>
                
                <TableCell className="max-w-[200px] sm:max-w-[300px] lg:max-w-[420px] font-mono">
                  <div className="font-medium text-foreground flex items-center gap-2">
                    {message.subjek}
                    {message.attachments && Array.isArray(message.attachments) && message.attachments.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-primary" title={`${message.attachments.length} attachment(s)`}>
                        <Paperclip className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-bold">{message.attachments.length}</span>
                      </span>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground leading-relaxed">{message.pesan}</p>
                  {message.layanan && (
                    <div className="mt-2 inline-block">
                      <span className="border border-border/50 bg-secondary px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                        {message.layanan}
                      </span>
                    </div>
                  )}
                </TableCell>
                
                <TableCell>
                  <div className="flex flex-col gap-1.5 py-1">
                    <div className="inline-block">
                      <StatusPill tone={message.dibaca ? "muted" : "info"}>
                        {message.dibaca ? "READ" : "UNREAD"}
                      </StatusPill>
                    </div>
                    <div className="inline-block">
                      <StatusPill tone={message.dibalas ? "success" : "warning"}>
                        {message.dibalas ? "REPLIED" : "UNREPLIED"}
                      </StatusPill>
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex flex-col gap-1.5 py-1">
                    <div className="inline-block">
                      <StatusPill tone={getDeliveryTone(message.resend_admin_status)}>
                        ADMIN_{message.resend_admin_status.toUpperCase()}
                      </StatusPill>
                    </div>
                    <div className="inline-block">
                      <StatusPill tone={getDeliveryTone(message.resend_auto_reply_status)}>
                        AUTO_{message.resend_auto_reply_status.toUpperCase()}
                      </StatusPill>
                    </div>
                    {message.resend_admin_email_id && (
                      <span className="font-mono text-[10px] text-muted-foreground">{message.resend_admin_email_id}</span>
                    )}
                  </div>
                </TableCell>
                
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1.5">
                    <AdminTableActionButton label={`Preview ${message.subjek}`} icon={Eye} intent="view" onClick={() => onPreview(message)} />
                    <AdminTableActionButton label={`Reply to ${message.nama}`} icon={Reply} intent="mail" href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(message.subjek)}`} />
                    {!message.dibaca && <AdminTableActionButton label="Mark as read" icon={MailOpen} intent="status" onClick={() => onMarkRead(message.id)} />}
                    {!message.dibalas && <AdminTableActionButton label="Mark as replied" icon={MailCheck} intent="status" onClick={() => onMarkReplied(message.id)} />}
                    {message.resend_admin_status !== "sent" && <AdminTableActionButton label="Retry Resend notification" icon={Send} intent="status" onClick={() => onRetry(message.id)} />}
                    {message.resend_admin_status === "failed" && <XCircle className="mt-2 h-4 w-4 text-danger inline shrink-0" />}
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
