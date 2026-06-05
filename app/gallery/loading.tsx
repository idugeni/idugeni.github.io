import { PublicIndexSkeleton } from "@/components/loading/public-skeletons";

export default function GalleryLoading() {
  return <PublicIndexSkeleton titleWidth="w-48" subtitleWidth="max-w-xl" filters={3} cards={9} variant="gallery" />;
}
