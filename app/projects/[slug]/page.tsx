import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { createPublicClient } from "@/lib/supabase/public";
import { toCamelCase } from "@/lib/utils/case";
import { PublicLayout } from "@/components/layout/public-layout";
import { ProjectDetailClient } from "@/components/pages/projects/project-detail-client";
import { ProjectJsonLd } from "@/components/seo/project-json-ld";
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

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("projects")
    .select("slug")
    .not("slug", "is", null)
    .order("urutan");

  if (error) {
    throw error;
  }

  return (data ?? [])
    .map((project) => project.slug)
    .filter((slug): slug is string => Boolean(slug));
}

async function getProjectDetailData(slug: string) {
  "use cache";
  cacheLife(PROJECT_DETAIL_CACHE_LIFE);
  cacheTag(CACHE_TAGS.projects);

  const supabase = createPublicClient();

  const { data: rawProject, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (projectError) {
    throw projectError;
  }

  if (!rawProject) {
    return null;
  }

  const project = toCamelCase<Project>(rawProject);
  const { data: rawRelatedProjects, error: relatedError } = await supabase
    .from("projects")
    .select("*")
    .eq("kategori", project.kategori)
    .neq("id", project.id)
    .limit(3);

  if (relatedError) {
    throw relatedError;
  }

  const relatedProjects = toCamelCase<Project[]>(rawRelatedProjects ?? []);
  const processedDescription = await renderRichHtml(project.deskripsi);

  return {
    project,
    relatedProjects,
    processedDescription,
  };
}

export async function generateStaticParams() {
  const slugs = await getProjectSlugs();

  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
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
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const detail = await getProjectDetailData(slug);

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
      <ProjectJsonLd project={projectJsonLd} />
      <ProjectDetailClient
        project={project}
        relatedProjects={relatedProjects}
        processedDescription={processedDescription}
      />
    </PublicLayout>
  );
}
