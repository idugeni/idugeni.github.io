import { PublicIndexSkeleton } from "@/components/loading/public-skeletons";

export default function ProjectsLoading() {
  return <PublicIndexSkeleton titleWidth="w-56" subtitleWidth="max-w-2xl" filters={4} cards={6} columns="three" />;
}
