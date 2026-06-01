import { getAdminServicesPage, getServiceStats } from "@/actions/services";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "@/lib/icons";
import Link from "next/link";
import { ServiceListClient } from "./ServiceListClient";

type AdminServicesSearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminServices({ searchParams }: { searchParams: AdminServicesSearchParams }) {
  const params = await searchParams;
  const [pageData, stats] = await Promise.all([
    getAdminServicesPage(params),
    getServiceStats(),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="SERVICE_CONTROL_CENTER"
        title="Services"
        subtitle="Manage service offerings, pricing tiers, feature lists, ordering, and public visibility."
        actions={
          <Button asChild className="rounded-none bg-primary font-mono text-primary-foreground hover:bg-primary/90">
            <Link href="/admin/services/new">
              <Plus className="mr-2 h-4 w-4" /> NEW_SERVICE
            </Link>
          </Button>
        }
      />

      <ServiceListClient
        initialServices={pageData.services}
        stats={stats}
        filters={pageData.filters}
        pagination={pageData.pagination}
      />
    </div>
  );
}
