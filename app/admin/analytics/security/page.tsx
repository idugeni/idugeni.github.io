import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { AdminRuntimeFallback } from "@/components/admin/AdminRuntimeFallback";
import SecurityAnalyticsDashboard from "./security-analytics-client";

export const metadata: Metadata = { title: "Security Analytics" };

async function SecurityAnalyticsRuntimeContent() {
  await connection();

  return <SecurityAnalyticsDashboard />;
}

export default function SecurityAnalyticsRoute() {
  return (
    <Suspense fallback={<AdminRuntimeFallback label="LOADING_SECOPS_COMMAND" />}>
      <SecurityAnalyticsRuntimeContent />
    </Suspense>
  );
}
