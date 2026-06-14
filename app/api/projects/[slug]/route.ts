import { NextRequest, NextResponse } from "next/server";
import { queryPooler, queryPoolerSingle } from "@/lib/db/pooler";
import { toCamelCase } from "@/lib/utils/case";
import { renderRichHtml } from "@/lib/content/rich-html";
import type { Project } from "@/types/pages";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const rawProject = await queryPoolerSingle<Record<string, unknown>>(
      `SELECT * FROM projects WHERE slug=$1`,
      [slug]
    );

    if (!rawProject) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const project = toCamelCase<Project>(rawProject);
    const rawRelatedProjects = await queryPooler<Record<string, unknown>>(
      `SELECT * FROM projects WHERE kategori=$1 AND id != $2 LIMIT 3`,
      [project.kategori as string, project.id as string]
    );

    const relatedProjects = toCamelCase<Project[]>(rawRelatedProjects);
    const processedDescription = await renderRichHtml(project.deskripsi);

    return NextResponse.json({
      project,
      relatedProjects,
      processedDescription,
    });
  } catch (error) {
    console.error("[api/projects/[slug]] Error:", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
