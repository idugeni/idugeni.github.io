import { getProjectBySlug } from "@/actions/projects";
import { ProjectEditClient } from "./ProjectEditClient";

type EditProjectParams = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: EditProjectParams }) {
  const { slug } = await params;
  return {
    title: `Edit Project ${slug}`,
    description: "Edit project content by canonical slug.",
  };
}

export default async function AdminProjectEdit({ params }: { params: EditProjectParams }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  return <ProjectEditClient project={project} />;
}
