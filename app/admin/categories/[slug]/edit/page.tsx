import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getBlogCategoryBySlug } from "@/actions/blog";
import { CategoryForm } from "../../CategoryForm";

export const metadata: Metadata = { title: "Edit Category" };

type EditCategoryParams = Promise<{ slug: string }>;

export default async function EditBlogCategoryPage({ params }: { params: EditCategoryParams }) {
  await connection();
  const { slug } = await params;
  const category = await getBlogCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  return <CategoryForm mode="edit" category={category} />;
}
