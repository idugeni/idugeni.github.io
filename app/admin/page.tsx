import { Suspense } from "react";
import { Loader2Icon } from "@/lib/icons";
import { AdminPageContent } from "./admin-page-content";

function DashboardLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
      <p className="font-mono text-xs text-muted-foreground">Loading dashboard data...</p>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <AdminPageContent />
    </Suspense>
  );
}
