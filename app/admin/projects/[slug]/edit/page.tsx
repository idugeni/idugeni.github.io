import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/actions/projects";
import { ProjectEditClient } from "./ProjectEditClient";
import { connection } from "next/server";

type EditProjectParams = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: EditProjectParams }) {
  await connection();
  const { slug } = await params;
  return {
    title: `Edit Project ${slug}`,
    description: "Edit project content by canonical slug.",
  };
}

export default async function AdminProjectEdit({ params }: { params: EditProjectParams }) {
  await connection();
  const { slug } = await params;
  let project;
  try {
    project = await getProjectBySlug(slug);
  } catch {
    notFound();
  }
  if (!project) notFound();
  return <ProjectEditClient project={project} />;
}
