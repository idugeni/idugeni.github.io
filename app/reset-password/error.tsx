"use client";

import { AuthErrorBoundary } from "@/components/auth/AuthErrorBoundary";

export default function ResetPasswordError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <AuthErrorBoundary
      reset={reset}
      title="RESET_CONTEXT_INTERRUPTED"
      description="The password reset context was interrupted. Retry this route from the latest reset link or request a fresh reset email."
    />
  );
}
