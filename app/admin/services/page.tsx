import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { getAdminServicesReadModel, getServiceStatsReadModel } from "@/lib/data/admin/services";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Plus, Loader2Icon } from "@/lib/icons";
import Link from "next/link";
import { ServiceListClient } from "./ServiceListClient";

export const metadata: Metadata = { title: "Services" };

type AdminServicesSearchParams = Promise<Record<string, string | string[] | undefined>>;

async function ServicesContent({ searchParams }: { searchParams: AdminServicesSearchParams }) {
  let pageData = null;
  let stats = null;
  let error: string | null = null;

  try {
    const params = await searchParams;
    const [pd, st] = await Promise.all([
      getAdminServicesReadModel(params),
      getServiceStatsReadModel(),
    ]);
    pageData = pd;
    stats = st;
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load services data";
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
        eyebrow="SERVICE_CONTROL_CENTER"
        title="Services"
        subtitle="Manage service offerings, pricing tiers, feature lists, ordering, and public visibility."
        actions={
          <Button asChild className="rounded-none bg-primary font-mono text-primary-foreground hover:bg-primary/90">
            <Link href="/admin/services/new" prefetch={false}>
              <Plus className="mr-2 h-4 w-4" /> NEW_SERVICE
            </Link>
          </Button>
        }
      />

      <ServiceListClient
        initialServices={pageData!.services}
        stats={stats!}
        filters={pageData!.filters}
        pagination={pageData!.pagination}
      />
    </div>
  );
}

function ServicesLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
      <p className="font-mono text-xs text-muted-foreground">Loading services...</p>
    </div>
  );
}

export default async function AdminServices({ searchParams }: { searchParams: AdminServicesSearchParams }) {
  await connection();
  return (
    <Suspense fallback={<ServicesLoading />}>
      <ServicesContent searchParams={searchParams} />
    </Suspense>
  );
}
