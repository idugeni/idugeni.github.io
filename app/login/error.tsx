"use client";

import { AuthErrorBoundary } from "@/components/auth/AuthErrorBoundary";

export default function LoginError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <AuthErrorBoundary
      reset={reset}
      title="AUTH_CONTEXT_INTERRUPTED"
      description="The login session context was interrupted. Retry the secure login route or return home before attempting again."
    />
  );
}
