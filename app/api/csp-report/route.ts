import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    await request.text();
  } catch {
    // CSP reports are best-effort telemetry. Never surface ingestion failures to the browser.
  }

  return new Response(null, { status: 204 });
}

export function GET() {
  return NextResponse.json({ ok: true });
}
