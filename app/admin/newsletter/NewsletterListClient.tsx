"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format, isValid } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { bulkDeleteNewsletterSubscribers, bulkUpdateNewsletterSubscribers, updateNewsletterSubscriberStatus } from "@/actions/newsletter";
import { NewsletterBulkActionsBar } from "./NewsletterBulkActionsBar";
import { NewsletterFilters, type NewsletterFiltersState } from "./NewsletterFilters";
import { NewsletterPreviewModal } from "./NewsletterPreviewModal";
import { NewsletterStatCards } from "./NewsletterStatCards";
import { NewsletterTable, type AdminNewsletterSubscriber } from "./NewsletterTable";

interface Props { initialSubscribers: AdminNewsletterSubscriber[]; stats: { total: number; active: number; inactive: number; recent: number }; filters: NewsletterFiltersState; pagination: { page: number; pageSize: number; totalItems: number; totalPages: number } }
function formatDate(value: string | null | undefined) { if (!value) return "-"; const date = new Date(value); return isValid(date) ? format(date, "dd MMM yy") : "-"; }
function pageHref(page: number, filters: NewsletterFiltersState) { const params = new URLSearchParams(); if (filters.q) params.set("q", filters.q); if (filters.status) params.set("status", filters.status); if (filters.sort) params.set("sort", filters.sort); if (filters.order) params.set("order", filters.order); if (page > 1) params.set("page", String(page)); const query = params.toString(); return query ? `/admin/newsletter?${query}` : "/admin/newsletter"; }
export function NewsletterListClient({ initialSubscribers, stats, filters, pagination }: Props) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [preview, setPreview] = useState<AdminNewsletterSubscriber | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const run = async (message: string, action: () => Promise<unknown>) => { try { await action(); toast.success(message); setSelectedIds([]); router.refresh(); } catch (error) { toast.error(error instanceof Error ? error.message : "Action failed"); } };
  const canGoPrevious = pagination.page > 1;
  const canGoNext = pagination.page < pagination.totalPages;
  return <div className="space-y-6"><NewsletterStatCards stats={stats} /><NewsletterFilters filters={filters} /><NewsletterBulkActionsBar selectedCount={selectedIds.length} onActivate={() => run("Subscribers activated", () => bulkUpdateNewsletterSubscribers(selectedIds, { aktif: true }))} onDeactivate={() => run("Subscribers deactivated", () => bulkUpdateNewsletterSubscribers(selectedIds, { aktif: false }))} onDelete={() => run("Subscribers deleted", () => bulkDeleteNewsletterSubscribers(selectedIds))} onClearSelection={() => setSelectedIds([])} /><Card className="rounded-none border-border/50 bg-card/80"><CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between"><CardTitle className="font-orbitron">SUBSCRIBER_DATABASE ({pagination.totalItems})</CardTitle><p className="font-mono text-xs text-muted-foreground">PAGE {pagination.page}/{pagination.totalPages} · SHOWING {initialSubscribers.length} OF {pagination.totalItems}</p></CardHeader><CardContent className="space-y-4"><NewsletterTable subscribers={initialSubscribers} selectedIds={selectedIds} onSelectAll={(checked) => setSelectedIds(checked ? initialSubscribers.map((sub) => sub.id) : [])} onSelectOne={(id, checked) => setSelectedIds((current) => checked ? [...current, id] : current.filter((selectedId) => selectedId !== id))} onPreview={(sub) => { setPreview(sub); setPreviewOpen(true); }} onToggleStatus={(id, aktif) => run(aktif ? "Subscriber activated" : "Subscriber deactivated", () => updateNewsletterSubscriberStatus(id, aktif))} formatDate={formatDate} /><div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-4"><Button asChild variant="outline" className="rounded-none font-mono" disabled={!canGoPrevious}><Link href={canGoPrevious ? pageHref(pagination.page - 1, filters) : pageHref(1, filters)} prefetch={false}>PREVIOUS</Link></Button><span className="font-mono text-xs text-muted-foreground">Page {pagination.page} of {pagination.totalPages}</span><Button asChild variant="outline" className="rounded-none font-mono" disabled={!canGoNext}><Link href={canGoNext ? pageHref(pagination.page + 1, filters) : pageHref(pagination.totalPages, filters)} prefetch={false}>NEXT</Link></Button></div></CardContent></Card><NewsletterPreviewModal subscriber={preview} open={previewOpen} onOpenChange={setPreviewOpen} formatDate={formatDate} /></div>;
}
