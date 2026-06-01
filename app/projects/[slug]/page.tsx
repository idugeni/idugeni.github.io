import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { toCamelCase } from "@/lib/utils/case";
import { PublicLayout } from "@/components/layout/public-layout";
import { ProjectDetailClient } from "@/components/pages/projects/project-detail-client";
import { ProjectJsonLd } from "@/components/seo/project-json-ld";
import type { Project } from "@/types/pages";
import { renderRichHtml, richHtmlToPlainText } from "@/lib/content/rich-html";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("nama, deskripsi, thumbnail_url, kategori, slug")
    .eq("slug", slug)
    .single();

  if (!project) {
    return { title: "Proyek Tidak Ditemukan" };
  }

  const baseUrl = "https://irnk.codes";
  const description = richHtmlToPlainText(project.deskripsi);

  return {
    title: project.nama,
    description: description,
    authors: [{ name: "Eliyanto Sarage" }],
    openGraph: {
      title: project.nama,
      description: description,
      type: "article",
      authors: ["Eliyanto Sarage"],
      url: `${baseUrl}/projects/${slug}`,
      images: project.thumbnail_url
        ? [{ url: project.thumbnail_url, width: 1200, height: 630, alt: project.nama }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: project.nama,
      description: description,
      images: project.thumbnail_url ? [project.thumbnail_url] : undefined,
      creator: "@idugeni",
    },
    alternates: {
      canonical: `${baseUrl}/projects/${slug}`,
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: rawProject } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!rawProject) {
    notFound();
  }

  const project = toCamelCase<Project>(rawProject);
  const processedDescription = await renderRichHtml(project.deskripsi);
  const projectJsonLd = {
    ...project,
    deskripsi: richHtmlToPlainText(project.deskripsi),
  };

  // Fetch related projects (same category, exclude current project)
  const { data: rawRelatedProjects } = await supabase
    .from("projects")
    .select("*")
    .eq("kategori", project.kategori)
    .neq("id", project.id)
    .limit(3);

  const relatedProjects = rawRelatedProjects 
    ? toCamelCase<Project[]>(rawRelatedProjects) 
    : [];

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
