import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getGalleryItemBySlug } from "@/actions/gallery";
import { GalleryEditClient } from "./GalleryEditClient";

type EditGalleryParams = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: EditGalleryParams }) {
  await connection();
  const { slug } = await params;
  return {
    title: `Edit Gallery ${slug}`,
    description: "Edit gallery media metadata and replace media files with deferred upload.",
  };
}

export default async function AdminGalleryEdit({ params }: { params: EditGalleryParams }) {
  await connection();
  const { slug } = await params;
  let item;
  try {
    item = await getGalleryItemBySlug(slug);
  } catch {
    notFound();
  }
  if (!item) notFound();
  return <GalleryEditClient item={item} />;
}
