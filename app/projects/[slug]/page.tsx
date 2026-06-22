import Link from "next/link";
import Image from "next/image";
import { cache } from "react";
import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { queryPooler, queryPoolerSingle } from "@/lib/db/pooler";
import { toCamelCase } from "@/lib/utils/case";
import { toPlainText, safeImageSource } from "@/lib/utils/html";
import { sanitizeRichHtml } from "@/lib/security/sanitize-html";
import { siteConfig } from "@/lib/config/site";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { PublicLayout } from "@/components/layout/public-layout";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import type { Project } from "@/types/pages";

type Props = { params: Promise<{ slug: string }> };

type ProjectDetail = {
  project: Project;
  relatedProjects: Project[];
};

export const getProjectDetailData = cache(async function getProjectDetailData(slug: string): Promise<ProjectDetail | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(`project-${slug}`, CACHE_TAGS.projects);

  const rawProject = await queryPoolerSingle<Record<string, unknown>>(
    `SELECT * FROM projects WHERE slug=$1`,
    [slug]
  );

  if (!rawProject) return null;

  const project = toCamelCase<Project>(rawProject);
  const rawRelatedProjects = await queryPooler<Record<string, unknown>>(
    `SELECT * FROM projects WHERE kategori=$1 AND id != $2 LIMIT 3`,
    [project.kategori as string, project.id as string]
  );

  return {
    project,
    relatedProjects: toCamelCase<Project[]>(rawRelatedProjects),
  };
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const detail = await getProjectDetailData(slug);
    const project = detail?.project;

    if (!project) return { title: "Proyek Tidak Ditemukan" };

    const description = toPlainText(project.deskripsi).slice(0, 160);

    return {
      title: project.nama,
      description,
      alternates: { canonical: `${siteConfig.url}/projects/${slug}` },
      openGraph: {
        title: project.nama,
        description,
        type: "article",
        url: `${siteConfig.url}/projects/${slug}`,
        images: project.thumbnailUrl ? [{ url: project.thumbnailUrl, alt: project.nama }] : undefined,
      },
    };
  } catch {
    return { title: "Projects" };
  }
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  let detail: ProjectDetail | null = null;

  try {
    detail = await getProjectDetailData(slug);
  } catch (error) {
    console.error("[project-detail] Failed to fetch project data:", error);
  }

  if (!detail) notFound();

  const { project, relatedProjects } = detail;
  const sanitizedDescription = sanitizeRichHtml(project.deskripsi);
  const thumbnail = safeImageSource(project.thumbnailUrl);

  return (
    <PublicLayout>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Projects", url: "/projects" },
          { name: project.nama, url: `/projects/${slug}` },
        ]}
      />
      <article className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <Link href="/projects" className="mb-8 inline-flex text-sm font-mono text-primary hover:underline">
          RETURN_TO_ARCHIVES
        </Link>
        <div className="mb-6 flex flex-wrap items-center gap-3 text-xs font-mono uppercase text-muted-foreground">
          <span>{project.kategori || "Project"}</span>
          <span>•</span>
          <span>STATUS: {project.status || "published"}</span>
        </div>
        <h1 className="mb-8 text-4xl font-bold tracking-tight text-foreground md:text-6xl">
          {project.nama}
        </h1>
        <div className="mb-10 flex flex-wrap gap-3">
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border px-4 py-2 text-sm font-mono text-foreground hover:border-primary">
              REPOSITORY
            </a>
          )}
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-primary px-4 py-2 text-sm font-mono text-primary-foreground hover:bg-primary/90">
              LAUNCH_LIVE
            </a>
          )}
        </div>
        {thumbnail && (
          <div className="mb-10 aspect-video w-full relative rounded-2xl border border-border overflow-hidden">
            <Image
              src={thumbnail}
              alt={project.nama}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
        )}
        <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
          <div>
            <h2 className="mb-4 text-2xl font-bold text-primary">PROJECT_OVERVIEW</h2>
            <div
              className="irnk-prose"
              dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
            />
          </div>
          <aside className="space-y-6">
            {project.techStack && project.techStack.length > 0 && (
              <div className="rounded-2xl border border-border bg-secondary/30 p-5">
                <h2 className="mb-4 text-lg font-bold">TECH_STACK</h2>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech) => (
                    <span key={tech} className="rounded border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-mono text-primary">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="rounded-2xl border border-border bg-secondary/30 p-5 text-sm text-muted-foreground">
              <p><span className="text-foreground">Kategori:</span> {project.kategori || "-"}</p>
              <p><span className="text-foreground">Status:</span> {project.status || "-"}</p>
            </div>
          </aside>
        </div>
        {relatedProjects.length > 0 && (
          <section className="mt-14 border-t border-border pt-8">
            <h2 className="mb-4 text-2xl font-bold">Related Projects</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {relatedProjects.map((related) => (
                <Link key={String(related.id)} href={`/projects/${related.slug}`} className="rounded-xl border border-border bg-secondary/30 p-4 hover:border-primary/60">
                  <h3 className="font-semibold text-foreground">{related.nama}</h3>
                  {related.kategori && <p className="mt-2 text-sm text-muted-foreground">{related.kategori}</p>}
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </PublicLayout>
  );
}
