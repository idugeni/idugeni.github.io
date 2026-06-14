import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { connection } from "next/server";
import { AdminLayout } from "@/components/layout/admin-layout";
import { AdminRuntimeFallback } from "@/components/admin/AdminRuntimeFallback";

export const metadata: Metadata = {
  title: {
    template: "%s | Admin — IRNK Codes",
    default: "Dashboard | Admin — IRNK Codes",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  await connection();
  return (
    <AdminLayout>
      <Suspense fallback={<AdminRuntimeFallback label="LOADING_ADMIN_PAGE" />}>
        {children}
      </Suspense>
    </AdminLayout>
  );
}
