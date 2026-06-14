import { NextResponse } from "next/server";
import { setCSRFToken, getCSRFToken } from "@/lib/security/csrf";

/**
 * GET /api/csrf-token
 *
 * Sets a new CSRF cookie if one doesn't already exist, then returns the token.
 * This route handler is the only place where cookie.set() is called,
 * complying with Next.js 16's restriction that cookies can only be
 * modified in Server Actions or Route Handlers.
 */
export async function GET() {
  try {
    // First check if a valid token already exists
    const existing = await getCSRFToken();
    if (existing) {
      return NextResponse.json({ token: existing });
    }

    // Generate and set new cookie
    const token = await setCSRFToken();
    return NextResponse.json({ token });
  } catch (error) {
    console.error("[csrf-token] Failed to set CSRF cookie:", error);
    return NextResponse.json(
      { error: "Failed to initialize CSRF token" },
      { status: 500 },
    );
  }
}
