import { NextResponse } from "next/server";
import { getServiceDetailData } from "@/app/services/[slug]/page";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const detail = await getServiceDetailData(slug);

    if (!detail) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    return NextResponse.json(detail);
  } catch (error) {
    console.error("[api/services/[slug]] Error:", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
