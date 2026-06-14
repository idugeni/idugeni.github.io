import { NextRequest, NextResponse } from "next/server";
import { queryPooler, queryPoolerSingle } from "@/lib/db/pooler";
import { toCamelCase } from "@/lib/utils/case";
import type { Service } from "@/types/pages";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const rawService = await queryPoolerSingle<Record<string, unknown>>(
      `SELECT * FROM services WHERE slug=$1 AND aktif=true`,
      [slug]
    );

    if (!rawService) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const service = toCamelCase<Service>(rawService);
    const rawRelated = await queryPooler<Record<string, unknown>>(
      `SELECT * FROM services WHERE aktif=true AND id != $1 ORDER BY urutan LIMIT 3`,
      [service.id as string]
    );

    const relatedServices = toCamelCase<Service[]>(rawRelated);

    return NextResponse.json({
      service,
      relatedServices,
    });
  } catch (error) {
    console.error("[api/services/[slug]] Error:", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
