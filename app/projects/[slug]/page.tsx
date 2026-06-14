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
    return (
      <PublicLayout>
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">
              <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-foreground">Gagal Memuat Proyek</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Server sedang mengalami gangguan. Silakan refresh halaman dalam beberapa saat.
            </p>
            <a href="/projects" className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
              Kembali ke Proyek
            </a>
          </div>
        </div>
      </PublicLayout>
    );
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
