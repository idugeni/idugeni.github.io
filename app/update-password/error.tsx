"use client";

import { AuthErrorBoundary } from "@/components/auth/AuthErrorBoundary";

export default function UpdatePasswordError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <AuthErrorBoundary
      reset={reset}
      title="UPDATE_CONTEXT_INTERRUPTED"
      description="The secure password update context was interrupted. Retry this route from the latest authenticated recovery session."
    />
  );
}
