"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  bulkDeleteContactMessages,
  bulkUpdateContactMessages,
  markMessageRead,
  markMessageReplied,
  retryContactMessageNotification,
} from "@/actions/contact";
import { MessageBulkActionsBar } from "./MessageBulkActionsBar";
import { MessageFilters, type MessageFiltersState } from "./MessageFilters";
import { MessagePreviewModal } from "./MessagePreviewModal";
import { MessageStatCards } from "./MessageStatCards";
import { MessageTable, type AdminContactMessage } from "./MessageTable";

interface MessageListClientProps {
  initialMessages: AdminContactMessage[];
  stats: {
    total: number;
    unread: number;
    unreplied: number;
    resendFailed: number;
  };
  filters: MessageFiltersState;
  services: string[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

function pageHref(page: number, filters: MessageFiltersState) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/admin/messages?${query}` : "/admin/messages";
}

export function MessageListClient({ initialMessages, stats, filters, services, pagination }: MessageListClientProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [previewMessage, setPreviewMessage] = useState<AdminContactMessage | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? initialMessages.map((message) => message.id) : []);
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds((current) => checked ? [...current, id] : current.filter((selectedId) => selectedId !== id));
  };

  const refreshAfter = () => {
    setSelectedIds([]);
    router.refresh();
  };

  const runAction = async (successMessage: string, action: () => Promise<unknown>) => {
    try {
      await action();
      toast.success(successMessage);
      refreshAfter();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
    }
  };

  const canGoPrevious = pagination.page > 1;
  const canGoNext = pagination.page < pagination.totalPages;

  return (
    <div className="space-y-6">
      <MessageStatCards stats={stats} />
      <MessageFilters filters={filters} services={services} />
      <MessageBulkActionsBar
        selectedCount={selectedIds.length}
        onBulkRead={() => runAction("Marked selected messages as read", () => bulkUpdateContactMessages(selectedIds, { dibaca: true }))}
        onBulkUnread={() => runAction("Marked selected messages as unread", () => bulkUpdateContactMessages(selectedIds, { dibaca: false }))}
        onBulkReplied={() => runAction("Marked selected messages as replied", () => bulkUpdateContactMessages(selectedIds, { dibalas: true }))}
        onBulkUnreplied={() => runAction("Marked selected messages as unreplied", () => bulkUpdateContactMessages(selectedIds, { dibalas: false }))}
        onBulkDelete={() => runAction("Deleted selected messages", () => bulkDeleteContactMessages(selectedIds))}
        onClearSelection={() => setSelectedIds([])}
      />

      <Card className="rounded-none border-border/50 bg-card/80">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle className="font-orbitron">INCOMING_TRANSMISSIONS ({pagination.totalItems})</CardTitle>
          <p className="font-mono text-xs text-muted-foreground">
            PAGE {pagination.page}/{pagination.totalPages} · SHOWING {initialMessages.length} OF {pagination.totalItems}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <MessageTable
            messages={initialMessages}
            selectedIds={selectedIds}
            onSelectAll={handleSelectAll}
            onSelectOne={handleSelectOne}
            onPreview={(message) => {
              setPreviewMessage(message);
              setPreviewOpen(true);
            }}
            onMarkRead={(id) => runAction("Message marked as read", () => markMessageRead(id))}
            onMarkReplied={(id) => runAction("Message marked as replied", () => markMessageReplied(id))}
            onRetry={(id) => runAction("Resend notification retried", () => retryContactMessageNotification(id))}
          />

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-4">
            <Button asChild variant="outline" className="rounded-none font-mono" disabled={!canGoPrevious}>
              <Link href={canGoPrevious ? pageHref(pagination.page - 1, filters) : pageHref(1, filters)} prefetch={false}>PREVIOUS</Link>
            </Button>
            <span className="font-mono text-xs text-muted-foreground">Page {pagination.page} of {pagination.totalPages}</span>
            <Button asChild variant="outline" className="rounded-none font-mono" disabled={!canGoNext}>
              <Link href={canGoNext ? pageHref(pagination.page + 1, filters) : pageHref(pagination.totalPages, filters)} prefetch={false}>NEXT</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <MessagePreviewModal message={previewMessage} open={previewOpen} onOpenChange={setPreviewOpen} />
    </div>
  );
}
