import { NextResponse } from "next/server";
import { renderRichHtml } from "@/lib/content/rich-html";
import { getProjectDetailData } from "@/app/projects/[slug]/page";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const detail = await getProjectDetailData(slug);

    if (!detail) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const processedDescription = await renderRichHtml(detail.project.deskripsi);

    return NextResponse.json({
      ...detail,
      processedDescription,
    });
  } catch (error) {
    console.error("[api/projects/[slug]] Error:", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
