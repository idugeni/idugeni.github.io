import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";
import type { Announcement } from "@/actions/announcements";

async function getPublicAnnouncementsData(): Promise<Announcement[]> {
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
