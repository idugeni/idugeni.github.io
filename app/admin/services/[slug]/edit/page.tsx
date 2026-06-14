import { notFound } from "next/navigation";
import { getServiceBySlug } from "@/actions/services";
import { ServiceForm } from "../../ServiceForm";

type EditServiceParams = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: EditServiceParams }) {
  const { slug } = await params;
  return {
    title: `Edit Service ${slug}`,
    description: "Edit service content by canonical slug.",
  };
}

export default async function AdminServiceEdit({ params }: { params: EditServiceParams }) {
  const { slug } = await params;
  let service;
  try {
    service = await getServiceBySlug(slug);
  } catch {
    notFound();
  }
  if (!service) notFound();
  return <ServiceForm mode="edit" service={service} />;
}
