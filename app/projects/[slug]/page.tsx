import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { queryPooler, queryPoolerSingle } from "@/lib/db/pooler";
import { toCamelCase } from "@/lib/utils/case";
import { PublicLayout } from "@/components/layout/public-layout";
import { ProjectDetailClient } from "@/components/pages/projects/project-detail-client";
import { ProjectJsonLd } from "@/components/seo/project-json-ld";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import type { Project } from "@/types/pages";
import { renderRichHtml, richHtmlToPlainText } from "@/lib/content/rich-html";

type Props = { params: Promise<{ slug: string }> };

const PROJECT_DETAIL_CACHE_LIFE = {
  stale: 300,
  revalidate: 300,
  expire: 3_600,
} as const;

async function getProjectSlugs() {
  "use cache";
  cacheLife(PROJECT_DETAIL_CACHE_LIFE);
  cacheTag(CACHE_TAGS.projects);

  const rows = await queryPooler<{ slug: string }>(
    `SELECT slug FROM projects WHERE slug IS NOT NULL ORDER BY urutan`
  );
  return rows.map((r) => r.slug).filter(Boolean);
}

async function getProjectDetailData(slug: string) {
  "use cache";
  cacheLife(PROJECT_DETAIL_CACHE_LIFE);
  cacheTag(CACHE_TAGS.projects);

  const rawProject = await queryPoolerSingle<Record<string, unknown>>(
    `SELECT * FROM projects WHERE slug=$1`,
    [slug]
  );

  if (!rawProject) {
    return null;
  }

  const project = toCamelCase<Project>(rawProject);
  const rawRelatedProjects = await queryPooler<Record<string, unknown>>(
    `SELECT * FROM projects WHERE kategori=$1 AND id != $2 LIMIT 3`,
    [project.kategori as string, project.id as string]
  );

  const relatedProjects = toCamelCase<Project[]>(rawRelatedProjects);
  const processedDescription = await renderRichHtml(project.deskripsi);

  return { project, relatedProjects, processedDescription };
}

export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const detail = await getProjectDetailData(slug);

    if (!detail) {
      return { title: "Proyek Tidak Ditemukan" };
    }

    const { project } = detail;
    const baseUrl = "https://irnk.codes";
    const description = richHtmlToPlainText(project.deskripsi);

    return {
      title: project.nama,
      description,
      authors: [{ name: "Eliyanto Sarage" }],
      openGraph: {
        title: project.nama,
        description,
        type: "article",
        authors: ["Eliyanto Sarage"],
        url: `${baseUrl}/projects/${slug}`,
        images: project.thumbnailUrl
          ? [{ url: project.thumbnailUrl, width: 1200, height: 630, alt: project.nama }]
          : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: project.nama,
        description,
        images: project.thumbnailUrl ? [project.thumbnailUrl] : undefined,
        creator: "@idugeni",
      },
      alternates: {
        canonical: `${baseUrl}/projects/${slug}`,
      },
    };
  } catch (error) {
    console.error("[project-detail] generateMetadata failed:", error);
    return { title: "Projects" };
  }
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  let detail;

  try {
    detail = await getProjectDetailData(slug);
  } catch (error) {
    console.error("[project-detail] Failed to fetch project data:", error);
    throw error; // Let error.tsx handle this
  }

  if (!detail) {
    notFound();
  }

  const { project, relatedProjects, processedDescription } = detail;

  const projectJsonLd = {
    ...project,
    deskripsi: richHtmlToPlainText(project.deskripsi),
  };

  return (
    <PublicLayout>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Projects", url: "/projects" },
          { name: project.nama, url: `/projects/${slug}` },
        ]}
      />
      <ProjectJsonLd project={projectJsonLd} />
      <ProjectDetailClient
        project={project}
        relatedProjects={relatedProjects}
        processedDescription={processedDescription}
      />
    </PublicLayout>
  );
}
