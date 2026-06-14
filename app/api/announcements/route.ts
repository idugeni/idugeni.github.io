import { NextResponse } from "next/server";
import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { createPublicClient } from "@/lib/supabase/public";
import type { Announcement } from "@/actions/announcements";

const PUBLIC_ANNOUNCEMENTS_CACHE_LIFE = {
  stale: 60,
  revalidate: 300,
  expire: 3_600,
} as const;

async function getPublicAnnouncementsData(): Promise<Announcement[]> {
  "use cache";
  cacheLife(PUBLIC_ANNOUNCEMENTS_CACHE_LIFE);
  cacheTag(CACHE_TAGS.announcements);

  const supabase = createPublicClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("announcements")
    .select("id,title,content,type,placement,is_active,starts_at,ends_at,target_page,dismissible,cta_label,cta_url,created_by,created_at,updated_at")
    .eq("is_active", true)
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gt.${now}`)
    .order("starts_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as Announcement[];
}

export async function GET() {
  try {
    const announcements = await getPublicAnnouncementsData();
    return NextResponse.json(announcements);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
