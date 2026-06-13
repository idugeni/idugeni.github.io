import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { AdminRuntimeFallback } from "@/components/admin/AdminRuntimeFallback";
import { ServiceForm } from "../ServiceForm";

export const metadata: Metadata = { title: "New Service" };

async function NewServiceRuntimeContent() {
  await connection();

  return <ServiceForm mode="create" />;
}

export default function AdminServiceNew() {
  return (
    <Suspense fallback={<AdminRuntimeFallback label="LOADING_SERVICE_CREATE" />}>
      <NewServiceRuntimeContent />
    </Suspense>
  );
}
