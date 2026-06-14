import { connection } from "next/server";
import { getCSRFToken } from "@/lib/security/csrf";
import { CSRFProvider } from "@/components/providers/csrf-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { ReactNode } from "react";

/**
 * CSRFBoundary - Async server component that fetches the CSRF token.
 * Must be wrapped with <Suspense> in the RootLayout because getCSRFToken()
 * accesses cookies (uncached data under Next.js 16 cacheComponents).
 */
export async function CSRFBoundary({ children }: { children: ReactNode }) {
  await connection();
  const csrfToken = await getCSRFToken();

  return (
    <CSRFProvider token={csrfToken}>
      <TooltipProvider>
        {children}
      </TooltipProvider>
    </CSRFProvider>
  );
}
