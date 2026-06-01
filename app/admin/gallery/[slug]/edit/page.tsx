import { getGalleryItemBySlug } from "@/actions/gallery";
import { GalleryEditClient } from "./GalleryEditClient";

type EditGalleryParams = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: EditGalleryParams }) {
  const { slug } = await params;
  return {
    title: `Edit Gallery ${slug}`,
    description: "Edit gallery media metadata and replace media files with deferred upload.",
  };
}

export default async function AdminGalleryEdit({ params }: { params: EditGalleryParams }) {
  const { slug } = await params;
  const item = await getGalleryItemBySlug(slug);
  return <GalleryEditClient item={item} />;
}
