import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
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

function ProjectDetailFallback() {
  return (
    <main className="min-h-screen pt-4 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 h-10 w-48 animate-pulse rounded-md border border-primary/20 bg-primary/5" />
        <div className="mb-6 flex items-center gap-4">
          <div className="h-7 w-28 animate-pulse rounded-full border border-primary/20 bg-primary/10" />
          <div className="h-7 w-32 animate-pulse rounded-full border border-accent/20 bg-accent/10" />
        </div>
        <h1 className="mb-6 font-orbitron text-4xl font-bold uppercase tracking-wider text-primary md:text-6xl">
          PROJECT_DETAIL
        </h1>
        <p className="mb-12 max-w-2xl font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Preparing project archive content...
        </p>
        <div className="mb-12 aspect-video w-full animate-pulse rounded-lg border border-primary/30 bg-secondary/40" />
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          <section className="space-y-4 md:col-span-2">
            <div className="h-7 w-56 rounded bg-primary/10" />
            <div className="h-4 w-full rounded bg-muted/40" />
            <div className="h-4 w-11/12 rounded bg-muted/40" />
            <div className="h-4 w-10/12 rounded bg-muted/40" />
          </section>
          <aside className="glass-card space-y-3 p-6">
            <div className="h-5 w-32 rounded bg-primary/10" />
            <div className="h-4 w-full rounded bg-muted/40" />
            <div className="h-4 w-2/3 rounded bg-muted/40" />
          </aside>
        </div>
      </div>
    </main>
  );
}

async function ProjectDetailContent({ params }: Props) {
  await connection();

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
    <>
      <ProjectJsonLd project={projectJsonLd} />
      <ProjectDetailClient
        project={project}
        relatedProjects={relatedProjects}
        processedDescription={processedDescription}
      />
    </>
  );
}

export default function ProjectDetailPage({ params }: Props) {
  return (
    <PublicLayout>
      <Suspense fallback={<ProjectDetailFallback />}>
        <ProjectDetailContent params={params} />
      </Suspense>
    </PublicLayout>
  );
}
