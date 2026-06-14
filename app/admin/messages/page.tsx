import type { Metadata } from "next";
import { Suspense } from "react";
import {
  getAdminContactMessagesPage,
  getContactMessageServices,
  getContactMessageStats,
} from "@/actions/contact";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Loader2Icon } from "@/lib/icons";
import { MessageListClient } from "./MessageListClient";

export const metadata: Metadata = { title: "Messages" };

type AdminMessagesSearchParams = Promise<{
  q?: string;
  read?: "read" | "unread" | "all";
  replied?: "replied" | "unreplied" | "all";
  resend?: "pending" | "sent" | "skipped" | "failed" | "all";
  service?: string;
  sort?: "date" | "sender" | "subject" | "resend";
  order?: "asc" | "desc";
  page?: string;
}>;

function normalizeSearchParams(searchParams: Awaited<AdminMessagesSearchParams>) {
  return {
    q: searchParams.q || undefined,
    read: searchParams.read === "all" ? undefined : searchParams.read,
    replied: searchParams.replied === "all" ? undefined : searchParams.replied,
    resend: searchParams.resend === "all" ? undefined : searchParams.resend,
    service: searchParams.service === "all" ? undefined : searchParams.service,
    sort: searchParams.sort || "date",
    order: searchParams.order || "desc",
    page: searchParams.page ? Number(searchParams.page) : 1,
    pageSize: 10,
  };
}

async function MessagesContent({ searchParams }: { searchParams: AdminMessagesSearchParams }) {
  let pageData = null;
  let stats = null;
  let services: string[] = [];
  let error: string | null = null;

  try {
    const filters = normalizeSearchParams(await searchParams);
    const [pd, st, sv] = await Promise.all([
      getAdminContactMessagesPage(filters),
      getContactMessageStats(),
      getContactMessageServices(),
    ]);
    pageData = pd;
    stats = st;
    services = sv;
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load messages data";
  }

  if (error) {
    return (
      <div className="rounded-none border border-red-500/30 bg-red-500/10 p-6">
        <p className="font-mono text-sm text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="CONTACT_CONTROL_CENTER"
        title="Messages"
        subtitle="Supabase-backed transmissions with persisted Resend delivery telemetry, retry controls, and response workflow tracking."
      />

      <MessageListClient
        initialMessages={pageData!.messages}
        stats={stats!}
        filters={pageData!.filters}
        services={services}
        pagination={pageData!.pagination}
      />
    </div>
  );
}

function MessagesLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
      <p className="font-mono text-xs text-muted-foreground">Loading messages...</p>
    </div>
  );
}

export default function AdminMessages({ searchParams }: { searchParams: AdminMessagesSearchParams }) {
  return (
    <Suspense fallback={<MessagesLoading />}>
      <MessagesContent searchParams={searchParams} />
    </Suspense>
  );
}
