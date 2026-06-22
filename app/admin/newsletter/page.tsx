import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { getAdminNewsletterSubscribersReadModel, getNewsletterStatsReadModel } from "@/lib/data/admin/newsletter";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Loader2Icon } from "@/lib/icons";
import { NewsletterListClient } from "./NewsletterListClient";

export const metadata: Metadata = { title: "Newsletter" };

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

async function NewsletterContent() {
  await connection();
  let pageData = null;
  let stats = null;
  let error: string | null = null;

  try {
    const [pd, st] = await Promise.all([
      getAdminNewsletterSubscribersReadModel({ sort: "date", order: "desc", page: 1, pageSize: 10 }),
      getNewsletterStatsReadModel(),
    ]);
    pageData = pd;
    stats = st;
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load newsletter data";
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
        eyebrow="NEWSLETTER_CONTROL_CENTER"
        title="Newsletter"
        subtitle="Manage subscribers, activation lifecycle, and audience quality with server-side filters and bulk workflows."
      />

      <NewsletterListClient
        initialSubscribers={pageData!.subscribers}
        stats={stats!}
        filters={pageData!.filters}
        pagination={pageData!.pagination}
      />
    </div>
  );
}

function NewsletterLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
      <p className="font-mono text-xs text-muted-foreground">Loading newsletter data...</p>
    </div>
  );
}

export default async function AdminNewsletter() {
  await connection();
  return (
    <Suspense fallback={<NewsletterLoading />}>
      <NewsletterContent />
    </Suspense>
  );
}
