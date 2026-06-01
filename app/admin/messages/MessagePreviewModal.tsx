"use client";

import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { AdminContactMessage } from "./MessageTable";

interface MessagePreviewModalProps {
  message: AdminContactMessage | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function statusVariant(status: string) {
  if (status === "sent") return "default";
  if (status === "failed") return "destructive";
  return "secondary";
}

export function MessagePreviewModal({ message, open, onOpenChange }: MessagePreviewModalProps) {
  if (!message) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl rounded-none border-border/60 bg-background">
        <DialogHeader>
          <DialogTitle className="font-orbitron text-primary">TRANSMISSION_DETAIL</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3 rounded-none border border-border/50 p-4">
            <h3 className="font-mono text-xs text-primary">SENDER</h3>
            <div className="font-mono text-sm">{message.nama}</div>
            <div className="font-mono text-xs text-muted-foreground">{message.email}</div>
            <div className="font-mono text-xs text-muted-foreground">WA: {message.no_wa || "-"}</div>
            <div className="font-mono text-xs text-muted-foreground">Layanan: {message.layanan || "-"}</div>
          </div>
          <div className="space-y-3 rounded-none border border-border/50 p-4">
            <h3 className="font-mono text-xs text-primary">STATUS</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant={message.dibaca ? "secondary" : "default"}>{message.dibaca ? "READ" : "UNREAD"}</Badge>
              <Badge variant={message.dibalas ? "default" : "secondary"}>{message.dibalas ? "REPLIED" : "UNREPLIED"}</Badge>
              <Badge variant={statusVariant(message.resend_admin_status)}>ADMIN: {message.resend_admin_status}</Badge>
              <Badge variant={statusVariant(message.resend_auto_reply_status)}>AUTO: {message.resend_auto_reply_status}</Badge>
            </div>
          </div>
        </div>
        <div className="space-y-2 rounded-none border border-border/50 p-4">
          <h3 className="font-mono text-xs text-primary">SUBJECT</h3>
          <p className="font-mono text-sm">{message.subjek}</p>
        </div>
        <div className="space-y-2 rounded-none border border-border/50 p-4">
          <h3 className="font-mono text-xs text-primary">MESSAGE</h3>
          <p className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-muted-foreground">{message.pesan}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 rounded-none border border-border/50 p-4 font-mono text-xs text-muted-foreground">
            <h3 className="text-primary">RESEND_ADMIN</h3>
            <div>ID: {message.resend_admin_email_id || "-"}</div>
            <div>Sent: {message.resend_sent_at || "-"}</div>
            <div>Error: {message.resend_admin_error || "-"}</div>
          </div>
          <div className="space-y-2 rounded-none border border-border/50 p-4 font-mono text-xs text-muted-foreground">
            <h3 className="text-primary">AUTO_REPLY</h3>
            <div>ID: {message.resend_auto_reply_email_id || "-"}</div>
            <div>Error: {message.resend_auto_reply_error || "-"}</div>
            <div>Replied at: {message.replied_at || "-"}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
