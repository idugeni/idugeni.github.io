import { AdminBlogEditClient } from "./AdminBlogEditClient";

type AdminBlogEditPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function AdminBlogEditPage({ params }: AdminBlogEditPageProps) {
  const { slug } = await params;

  return <AdminBlogEditClient slug={slug} />;
}
