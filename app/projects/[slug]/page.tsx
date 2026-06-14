import type { Metadata } from "next";
import { PublicLayout } from "@/components/layout/public-layout";
import { ProjectDetailFetcher } from "@/components/pages/projects/project-detail-fetcher";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: "Project Detail",
    description: "Detail proyek pengembangan web dan aplikasi.",
    alternates: {
      canonical: `https://irnk.codes/projects/${slug}`,
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;

  return (
    <PublicLayout>
      <ProjectDetailFetcher slug={slug} />
    </PublicLayout>
  );
}
