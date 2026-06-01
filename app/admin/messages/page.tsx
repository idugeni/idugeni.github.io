import {
  getAdminContactMessagesPage,
  getContactMessageServices,
  getContactMessageStats,
} from "@/actions/contact";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MessageListClient } from "./MessageListClient";

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

export default async function AdminMessages({ searchParams }: { searchParams: AdminMessagesSearchParams }) {
  const filters = normalizeSearchParams(await searchParams);
  const [pageData, stats, services] = await Promise.all([
    getAdminContactMessagesPage(filters),
    getContactMessageStats(),
    getContactMessageServices(),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="CONTACT_CONTROL_CENTER"
        title="Messages"
        subtitle="Supabase-backed transmissions with persisted Resend delivery telemetry, retry controls, and response workflow tracking."
      />

      <MessageListClient
        initialMessages={pageData.messages}
        stats={stats}
        filters={pageData.filters}
        services={services}
        pagination={pageData.pagination}
      />
    </div>
  );
}
