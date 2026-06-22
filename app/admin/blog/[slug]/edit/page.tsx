import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getBlogArticle } from "@/actions/blog";
import { AdminBlogEditClient } from "./AdminBlogEditClient";

type AdminBlogEditPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await params;
  return { title: `Edit Blog ${slug}` };
}

export default async function AdminBlogEditPage({ params }: AdminBlogEditPageProps) {
  await connection();
  const { slug } = await params;

  let post;
  try {
    post = await getBlogArticle(slug);
  } catch {
    notFound();
  }
  if (!post) notFound();

  return <AdminBlogEditClient slug={slug} />;
}
