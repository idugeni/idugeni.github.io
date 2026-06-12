import { Suspense } from "react";
import { getAdminTestimonialsPage, getTestimonialStats } from "@/actions/testimonials";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Loader2Icon } from "@/lib/icons";
import { TestimonialListClient } from "./TestimonialListClient";

type SearchParams = Promise<{
  q?: string;
  visibility?: "visible" | "hidden" | "all";
  featured?: "true" | "false" | "all";
  rating?: string;
  sort?: "date" | "name" | "rating" | "featured" | "visibility";
  order?: "asc" | "desc";
  page?: string;
}>;

function normalizeSearchParams(searchParams: Awaited<SearchParams>) {
  return {
    q: searchParams.q || undefined,
    visibility: searchParams.visibility === "all" ? undefined : searchParams.visibility,
    featured: searchParams.featured === "all" ? undefined : searchParams.featured,
    rating: searchParams.rating && searchParams.rating !== "all" ? Number(searchParams.rating) : undefined,
    sort: searchParams.sort || "date",
    order: searchParams.order || "desc",
    page: searchParams.page ? Number(searchParams.page) : 1,
    pageSize: 10,
  };
}

async function TestimonialsContent({ searchParams }: { searchParams: SearchParams }) {
  let pageData = null;
  let stats = null;
  let error: string | null = null;

  try {
    const filters = normalizeSearchParams(await searchParams);
    const [pd, st] = await Promise.all([
      getAdminTestimonialsPage(filters),
      getTestimonialStats(),
    ]);
    pageData = pd;
    stats = st;
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load testimonials data";
  }

  if (error) {
    return (
      <div className="rounded-none border border-red-500/30 bg-red-500/10 p-6">
        <p className="font-mono text-sm text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="TESTIMONIAL_CONTROL_CENTER"
        title="Testimonials"
        subtitle="Manage client proof, featured quotes, visibility, and testimonial quality with server-side admin workflows."
      />
      <TestimonialListClient
        initialTestimonials={pageData!.testimonials}
        stats={stats!}
        filters={pageData!.filters}
        pagination={pageData!.pagination}
      />
    </div>
  );
}

function TestimonialsLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
      <p className="font-mono text-xs text-muted-foreground">Loading testimonials...</p>
    </div>
  );
}

export default function AdminTestimonials({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<TestimonialsLoading />}>
      <TestimonialsContent searchParams={searchParams} />
    </Suspense>
  );
}
