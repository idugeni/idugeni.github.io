import { NextRequest, NextResponse } from "next/server";
import { queryPooler, queryPoolerSingle } from "@/lib/db/pooler";
import { toCamelCase } from "@/lib/utils/case";
import { renderRichHtml } from "@/lib/content/rich-html";
import type { BlogArticle, BlogComment } from "@/types/pages";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  
  try {
    const rawArticle = await queryPoolerSingle<Record<string, unknown>>(
      `SELECT * FROM blog_artikel WHERE slug=$1 AND status='published'`,
      [slug]
    );

    if (!rawArticle) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const [rawComments, rawRelated] = await Promise.all([
      queryPooler<Record<string, unknown>>(
        `SELECT * FROM blog_komentar WHERE artikel_id=$1 AND approved=true ORDER BY created_at DESC`,
        [rawArticle.id as string]
      ),
      queryPooler<Record<string, unknown>>(
        `SELECT * FROM blog_artikel WHERE status='published' AND id != $1 ORDER BY created_at DESC LIMIT 3`,
        [rawArticle.id as string]
      ),
    ]);

    const article = toCamelCase<BlogArticle>(rawArticle);
    const comments = toCamelCase<BlogComment[]>(rawComments);
    const relatedArticles = toCamelCase<BlogArticle[]>(rawRelated);
    const processedContent = await renderRichHtml(article.konten);

    return NextResponse.json({
      article,
      comments,
      relatedArticles,
      processedContent,
    });
  } catch (error) {
    console.error("[api/blog/[slug]] Error:", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
