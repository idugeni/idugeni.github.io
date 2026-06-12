import type { Metadata } from "next";
import type { ReactNode } from "react";
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

export default function AdminRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
