import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { AdminRuntimeFallback } from "@/components/admin/AdminRuntimeFallback";
import AdminProjectNew from "./project-new-client";

export const metadata: Metadata = { title: "New Project" };

async function ProjectNewRuntimeContent() {
  await connection();

  return <AdminProjectNew />;
}

export default function AdminProjectNewPage() {
  return (
    <Suspense fallback={<AdminRuntimeFallback label="LOADING_PROJECT_CREATE" />}>
      <ProjectNewRuntimeContent />
    </Suspense>
  );
}
