import { getCSRFToken } from "@/lib/security/csrf";
import { CSRFProvider } from "@/components/providers/csrf-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { ReactNode } from "react";

/**
 * CSRFBoundary - Async server component that READS the CSRF token.
 *
 * Next.js 16 restriction: cookies can only be SET in Server Actions or Route Handlers.
 * This component ONLY reads existing cookies — it never writes them.
 *
 * If no CSRF cookie exists yet, the CSRFProvider will lazily fetch one
 * via the /api/csrf-token route handler on the client side.
 */
export async function CSRFBoundary({ children }: { children: ReactNode }) {
  const csrfToken = await getCSRFToken(); // read-only, returns null if no cookie

  return (
    <CSRFProvider initialToken={csrfToken}>
      <TooltipProvider>
        {children}
      </TooltipProvider>
    </CSRFProvider>
  );
}
