import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { BlogNewClient } from "./BlogNewClient";

export const metadata = {
  title: "Create Blog Article",
  description: "Create SEO-ready blog articles with AI assistance and deferred thumbnail upload.",
};

export default async function AdminBlogNewPage() {
  await connection();
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("kategori")
    .select("id,nama,warna")
    .order("nama", { ascending: true });

  return <BlogNewClient categories={categories ?? []} />;
}
