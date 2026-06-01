import { getAdminTestimonialsPage, getTestimonialStats } from "@/actions/testimonials";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
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

export default async function AdminTestimonials({ searchParams }: { searchParams: SearchParams }) {
  const filters = normalizeSearchParams(await searchParams);
  const [pageData, stats] = await Promise.all([
    getAdminTestimonialsPage(filters),
    getTestimonialStats(),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="TESTIMONIAL_CONTROL_CENTER"
        title="Testimonials"
        subtitle="Manage client proof, featured quotes, visibility, and testimonial quality with server-side admin workflows."
      />
      <TestimonialListClient
        initialTestimonials={pageData.testimonials}
        stats={stats}
        filters={pageData.filters}
        pagination={pageData.pagination}
      />
    </div>
  );
}
