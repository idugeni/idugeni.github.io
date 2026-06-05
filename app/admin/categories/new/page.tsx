import { Suspense } from "react";
import { connection } from "next/server";
import { AdminRuntimeFallback } from "@/components/admin/AdminRuntimeFallback";
import { CategoryForm } from "../CategoryForm";

async function NewCategoryRuntimeContent() {
  await connection();

  return <CategoryForm mode="create" />;
}

export default function NewBlogCategoryPage() {
  return (
    <Suspense fallback={<AdminRuntimeFallback label="LOADING_CATEGORY_CREATE" />}>
      <NewCategoryRuntimeContent />
    </Suspense>
  );
}
