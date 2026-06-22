import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { headers } from "next/headers";
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

async function AdminShell({ children }: { children: ReactNode }) {
  const hdrs = await headers();
  const forwardedUrl = hdrs.get("x-forwarded-url");
  let pathname = "/admin";
  if (forwardedUrl) {
    try {
      pathname = new URL(forwardedUrl, "http://localhost").pathname;
    } catch {
      pathname = forwardedUrl.startsWith("/") ? forwardedUrl : "/admin";
    }
  }
  return (
    <AdminLayout pathname={pathname}>
      <Suspense fallback={<AdminRuntimeFallback label="LOADING_ADMIN_PAGE" />}>
        {children}
      </Suspense>
    </AdminLayout>
  );
}

export default async function AdminRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense fallback={<AdminRuntimeFallback label="LOADING_ADMIN" />}>
      <AdminShell children={children} />
    </Suspense>
  );
}
