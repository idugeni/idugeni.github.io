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
        <div className="space-y-4">
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
          {message.attachments && Array.isArray(message.attachments) && message.attachments.length > 0 && (
            <div className="space-y-3 rounded-none border border-border/50 p-4">
              <h3 className="font-mono text-xs text-primary flex items-center gap-2">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                ATTACHMENTS ({message.attachments.length})
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {message.attachments.map((att, idx) => (
                  <a
                    key={idx}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-none border border-border/40 bg-secondary/20 p-3 hover:bg-secondary/40 transition-colors group"
                  >
                    {att.type.startsWith("image/") ? (
                      <img src={att.url} alt={att.filename} className="h-12 w-12 object-cover border border-border/50" />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center bg-primary/10 border border-primary/30 text-primary">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">{att.filename}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">{(att.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <svg className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  </a>
                ))}
              </div>
            </div>
          )}
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
