import { PublicIndexSkeleton } from "@/components/loading/public-skeletons";

export default function BlogLoading() {
  return <PublicIndexSkeleton titleWidth="w-48" subtitleWidth="max-w-xl" filters={3} cards={6} columns="two" variant="articles" />;
}
