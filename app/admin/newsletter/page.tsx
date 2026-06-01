import { getAdminNewsletterSubscribersPage, getNewsletterStats } from "@/actions/newsletter";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { NewsletterListClient } from "./NewsletterListClient";

type SearchParams = Promise<{
  q?: string;
  status?: "active" | "inactive" | "all";
  sort?: "date" | "email" | "name" | "status";
  order?: "asc" | "desc";
  page?: string;
}>;

function normalizeSearchParams(searchParams: Awaited<SearchParams>) {
  return {
    q: searchParams.q || undefined,
    status: searchParams.status === "all" ? undefined : searchParams.status,
    sort: searchParams.sort || "date",
    order: searchParams.order || "desc",
    page: searchParams.page ? Number(searchParams.page) : 1,
    pageSize: 10,
  };
}

export default async function AdminNewsletter({ searchParams }: { searchParams: SearchParams }) {
  const filters = normalizeSearchParams(await searchParams);
  const [pageData, stats] = await Promise.all([
    getAdminNewsletterSubscribersPage(filters),
    getNewsletterStats(),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="NEWSLETTER_CONTROL_CENTER"
        title="Newsletter"
        subtitle="Manage subscribers, activation lifecycle, and audience quality with server-side filters and bulk workflows."
      />

      <NewsletterListClient
        initialSubscribers={pageData.subscribers}
        stats={stats}
        filters={pageData.filters}
        pagination={pageData.pagination}
      />
    </div>
  );
}
