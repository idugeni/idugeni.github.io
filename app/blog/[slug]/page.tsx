import type { Metadata } from "next";
import { PublicLayout } from "@/components/layout/public-layout";
import { BlogDetailFetcher } from "@/components/pages/blog/blog-detail-fetcher";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: "Blog Detail",
    description: "Artikel blog tentang pengembangan web dan teknologi terkini.",
    alternates: {
      canonical: `https://irnk.codes/blog/${slug}`,
    },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;

  return (
    <PublicLayout>
      <BlogDetailFetcher slug={slug} />
    </PublicLayout>
  );
}
