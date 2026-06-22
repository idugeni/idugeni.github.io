import { NextResponse } from "next/server";
import { renderRichHtml } from "@/lib/content/rich-html";
import { getBlogDetailData } from "@/app/blog/[slug]/page";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const detail = await getBlogDetailData(slug);

    if (!detail) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const processedContent = await renderRichHtml(detail.article.konten);

    return NextResponse.json({
      ...detail,
      processedContent,
    });
  } catch (error) {
    console.error("[api/blog/[slug]] Error:", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
