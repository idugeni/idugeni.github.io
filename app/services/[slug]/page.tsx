import { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicLayout } from "@/components/layout/public-layout";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import { ServiceDetailClient } from "@/components/pages/services/service-detail-client";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { queryPooler, queryPoolerSingle } from "@/lib/db/pooler";
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

  return await queryPoolerSingle<{ nama: string; deskripsi_pendek: string }>(
    `SELECT nama, deskripsi_pendek FROM services WHERE slug=$1 AND aktif=true`,
    [slug]
  );
}

async function getServiceDetailData(slug: string) {
  "use cache";
  cacheLife(SERVICE_DETAIL_CACHE_LIFE);
  cacheTag(CACHE_TAGS.services);

  const rawService = await queryPoolerSingle<Record<string, unknown>>(
    `SELECT * FROM services WHERE slug=$1 AND aktif=true`,
    [slug]
  );

  if (!rawService) {
    return null;
  }

  const service = toCamelCase<Service>(rawService);
  const rawRelated = await queryPooler<Record<string, unknown>>(
    `SELECT * FROM services WHERE aktif=true AND id != $1 ORDER BY urutan LIMIT 3`,
    [service.id as string]
  );

  return {
    service,
    relatedServices: toCamelCase<Service[]>(rawRelated),
  };
}

function ServiceDetailFallback() {
  return (
    <div className="sr-only" role="status" aria-live="polite">
      Memuat detail layanan...
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
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Services", url: "/services" },
          { name: data.service.nama, url: `/services/${slug}` },
        ]}
      />
      <ServiceDetailClient
        service={data.service}
        relatedServices={data.relatedServices}
      />
    </>
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
