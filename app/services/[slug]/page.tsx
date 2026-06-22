import Link from "next/link";
import { cache } from "react";
import { cacheLife, cacheTag } from "next/cache";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicLayout } from "@/components/layout/public-layout";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import { ServiceDetailClient } from "@/components/pages/services/service-detail-client";
import { queryPooler, queryPoolerSingle } from "@/lib/db/pooler";
import { toCamelCase } from "@/lib/utils/case";
import { siteConfig } from "@/lib/config/site";
import { CACHE_TAGS } from "@/lib/cache/tags";
import type { Service } from "@/types/pages";

type ServiceDetailParams = Promise<{ slug: string }>;

type ServiceDetail = {
  service: Service;
  relatedServices: Service[];
};

export const getServiceDetailData = cache(async function getServiceDetailData(slug: string): Promise<ServiceDetail | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(`service-${slug}`, CACHE_TAGS.services);

  const rawService = await queryPoolerSingle<Record<string, unknown>>(
    `SELECT * FROM services WHERE slug=$1 AND aktif=true`,
    [slug]
  );

  if (!rawService) return null;

  const service = toCamelCase<Service>(rawService);
  const rawRelated = await queryPooler<Record<string, unknown>>(
    `SELECT * FROM services WHERE aktif=true AND id != $1 ORDER BY urutan LIMIT 3`,
    [service.id as string]
  );

  return {
    service,
    relatedServices: toCamelCase<Service[]>(rawRelated),
  };
});

export async function generateStaticParams() {
  const rows = await queryPooler<{ slug: string }>(
    `SELECT slug FROM services WHERE aktif=true ORDER BY urutan ASC LIMIT 100`
  );

  return rows.map((service) => ({ slug: service.slug }));
}

async function ServiceDetailContent({ params }: { params: ServiceDetailParams }) {
  const { slug } = await params;
  let data: ServiceDetail | null = null;

  try {
    data = await getServiceDetailData(slug);
  } catch (error) {
    console.error("[service-detail] Failed to fetch service data:", error);
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">
            <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-foreground">Gagal Memuat Layanan</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Server sedang mengalami gangguan. Silakan refresh halaman dalam beberapa saat.
          </p>
          <Link href="/services" className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
            Kembali ke Layanan
          </Link>
        </div>
      </div>
    );
  }

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
  try {
    const { slug } = await params;
    const detail = await getServiceDetailData(slug);
    const data = detail?.service;

    if (!data) {
      return {
        title: "Service Not Found",
        description: "The requested service could not be found.",
      };
    }

    return {
      title: data.nama,
      description: data.deskripsiPendek,
    };
  } catch {
    return { title: "Services" };
  }
}

export default function ServiceDetailPage({
  params,
}: {
  params: ServiceDetailParams;
}) {
  return (
    <PublicLayout>
      <ServiceDetailContent params={params} />
    </PublicLayout>
  );
}
