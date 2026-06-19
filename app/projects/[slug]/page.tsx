import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { queryPooler, queryPoolerSingle } from "@/lib/db/pooler";
import { toCamelCase } from "@/lib/utils/case";
import { PublicLayout } from "@/components/layout/public-layout";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import type { Project } from "@/types/pages";

export const dynamic = "force-dynamic";

const BASE_URL = "https://irnk.codes";

type Props = { params: Promise<{ slug: string }> };

type ProjectDetail = {
  project: Project;
  relatedProjects: Project[];
};

function toPlainText(value: unknown) {
  return String(value ?? "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getParagraphs(content: unknown) {
  const text = toPlainText(content);
  return text ? text.split(/\n{2,}/).map((item) => item.trim()).filter(Boolean) : [];
}

function safeImageSource(value: unknown) {
  const src = typeof value === "string" ? value.trim() : "";
  if (!src) return null;
  if (src.startsWith("/") || /^https?:\/\//i.test(src)) return src;
  return null;
}

async function getProjectDetailData(slug: string): Promise<ProjectDetail | null> {
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
}

async function getProjectMetadataData(slug: string) {
  const rawProject = await queryPoolerSingle<Record<string, unknown>>(
    `SELECT nama, deskripsi, slug, thumbnail_url AS "thumbnailUrl" FROM projects WHERE slug=$1`,
    [slug]
  );

  return rawProject ? toCamelCase<Project>(rawProject) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const project = await getProjectMetadataData(slug);

    if (!project) return { title: "Proyek Tidak Ditemukan" };

    const description = toPlainText(project.deskripsi).slice(0, 160);

    return {
      title: project.nama,
      description,
      alternates: { canonical: `${BASE_URL}/projects/${slug}` },
      openGraph: {
        title: project.nama,
        description,
        type: "article",
        url: `${BASE_URL}/projects/${slug}`,
        images: project.thumbnailUrl ? [{ url: project.thumbnailUrl, alt: project.nama }] : undefined,
      },
    };
  } catch (error) {
    console.error("[project-detail] generateMetadata failed:", error);
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
  const paragraphs = getParagraphs(project.deskripsi);
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
        <a href="/projects" className="mb-8 inline-flex text-sm font-mono text-primary hover:underline">
          RETURN_TO_ARCHIVES
        </a>
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
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnail}
            alt={project.nama}
            className="mb-10 aspect-video w-full rounded-2xl border border-border object-cover"
            loading="eager"
          />
        )}
        <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
          <div>
            <h2 className="mb-4 text-2xl font-bold text-primary">PROJECT_OVERVIEW</h2>
            <div className="space-y-6 text-base leading-8 text-foreground md:text-lg">
              {paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
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
                <a key={String(related.id)} href={`/projects/${related.slug}`} className="rounded-xl border border-border bg-secondary/30 p-4 hover:border-primary/60">
                  <h3 className="font-semibold text-foreground">{related.nama}</h3>
                  {related.kategori && <p className="mt-2 text-sm text-muted-foreground">{related.kategori}</p>}
                </a>
              ))}
            </div>
          </section>
        )}
      </article>
    </PublicLayout>
  );
}
