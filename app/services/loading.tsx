import { PublicIndexSkeleton } from "@/components/loading/public-skeletons";

export default function ServicesLoading() {
  return <PublicIndexSkeleton titleWidth="w-52" subtitleWidth="max-w-2xl" filters={3} cards={6} columns="three" />;
}
