import { notFound } from "next/navigation";
import { getBlogCategoryBySlug } from "@/actions/blog";
import { CategoryForm } from "../../CategoryForm";

type EditCategoryParams = Promise<{ slug: string }>;

export default async function EditBlogCategoryPage({ params }: { params: EditCategoryParams }) {
  const { slug } = await params;
  const category = await getBlogCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  return <CategoryForm mode="edit" category={category} />;
}
