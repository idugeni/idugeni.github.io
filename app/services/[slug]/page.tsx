import type { Metadata } from "next";
import { PublicLayout } from "@/components/layout/public-layout";
import { ServiceDetailFetcher } from "@/components/pages/services/service-detail-fetcher";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: "Service Detail",
    description: "Detail layanan pengembangan web dan teknologi.",
    alternates: {
      canonical: `https://irnk.codes/services/${slug}`,
    },
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;

  return (
    <PublicLayout>
      <ServiceDetailFetcher slug={slug} />
    </PublicLayout>
  );
}
