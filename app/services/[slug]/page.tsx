import { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicLayout } from "@/components/layout/public-layout";
import { ServiceDetailClient } from "@/components/pages/services/service-detail-client";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { createPublicClient } from "@/lib/supabase/public";
import { toCamelCase } from "@/lib/utils/case";
import type { Service } from "@/types/pages";

const SERVICE_DETAIL_CACHE_LIFE = {
  stale: 300,
  revalidate: 300,
  expire: 3_600,
} as const;

type ServiceDetailParams = Promise<{ slug: string }>;

async function getServiceMetadata(slug: string) {
  "use cache";
  cacheLife(SERVICE_DETAIL_CACHE_LIFE);
  cacheTag(CACHE_TAGS.services);

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("services")
    .select("nama, deskripsi_pendek")
    .eq("slug", slug)
    .eq("aktif", true)
    .single();

  return data;
}

async function getServiceDetailData(slug: string) {
  "use cache";
  cacheLife(SERVICE_DETAIL_CACHE_LIFE);
  cacheTag(CACHE_TAGS.services);

  const supabase = createPublicClient();
  const { data: rawService, error } = await supabase
    .from("services")
    .select("*")
    .eq("slug", slug)
    .eq("aktif", true)
    .single();

  if (error || !rawService) {
    return null;
  }

  const service = toCamelCase<Service>(rawService);
  const { data: rawRelated } = await supabase
    .from("services")
    .select("*")
    .eq("aktif", true)
    .neq("id", service.id)
    .order("urutan")
    .limit(3);

  return {
    service,
    relatedServices: toCamelCase<Service[]>(rawRelated ?? []),
  };
}

function ServiceDetailFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-primary">LOADING_SERVICE</p>
      </div>
    </div>
  );
}

async function ServiceDetailContent({ params }: { params: ServiceDetailParams }) {
  const { slug } = await params;
  const data = await getServiceDetailData(slug);

  if (!data) {
    notFound();
  }

  return (
    <ServiceDetailClient
      service={data.service}
      relatedServices={data.relatedServices}
    />
  );
}

export async function generateMetadata({
  params,
}: {
  params: ServiceDetailParams;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getServiceMetadata(slug);

  if (!data) {
    return {
      title: "Service Not Found",
      description: "The requested service could not be found.",
    };
  }

  return {
    title: data.nama,
    description: data.deskripsi_pendek,
  };
}

export default function ServiceDetailPage({
  params,
}: {
  params: ServiceDetailParams;
}) {
  return (
    <PublicLayout>
      <Suspense fallback={<ServiceDetailFallback />}>
        <ServiceDetailContent params={params} />
      </Suspense>
    </PublicLayout>
  );
}
