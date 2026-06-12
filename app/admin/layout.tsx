import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";

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
  return (
    <Suspense fallback={null}>
      <AdminLayout>{children}</AdminLayout>
    </Suspense>
  );
}
