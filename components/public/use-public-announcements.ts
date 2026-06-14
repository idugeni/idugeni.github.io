"use client";

import { useEffect, useState } from "react";
import type { Announcement } from "@/actions/announcements";

const DISMISSED_ANNOUNCEMENTS_KEY = "dismissed_announcements";

let announcementsPromise: Promise<Announcement[]> | null = null;
let announcementsCache: Announcement[] | null = null;

function getPublicAnnouncements(): Promise<Announcement[]> {
  if (announcementsCache) return Promise.resolve(announcementsCache);

  announcementsPromise ??= fetch("/api/announcements", {
    cache: "force-cache",
  })
    .then(async (response) => {
      if (!response.ok) return [];
      return (await response.json()) as Announcement[];
    })
    .then((announcements) => {
      announcementsCache = announcements;
      return announcements;
    })
    .catch(() => []);

  return announcementsPromise;
}

function readDismissedAnnouncementIds(): string[] {
  try {
    const rawValue = localStorage.getItem(DISMISSED_ANNOUNCEMENTS_KEY);
    const parsedValue: unknown = rawValue ? JSON.parse(rawValue) : [];
    return Array.isArray(parsedValue)
      ? parsedValue.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function dismissAnnouncement(id: string) {
  const dismissedIds = new Set(readDismissedAnnouncementIds());
  dismissedIds.add(id);
  localStorage.setItem(
    DISMISSED_ANNOUNCEMENTS_KEY,
    JSON.stringify(Array.from(dismissedIds))
  );
}

function matchesAnnouncementTarget(announcement: Announcement, pathname: string) {
  if (announcement.target_page === "*") return true;
  return pathname === announcement.target_page;
}

export function usePublicAnnouncement(
  placement: Announcement["placement"],
  pathname: string
) {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (pathname?.startsWith("/admin")) {
      setAnnouncement(null);
      return;
    }

    getPublicAnnouncements().then((announcements) => {
      if (!isMounted) return;

      const dismissedIds = readDismissedAnnouncementIds();
      const matchingAnnouncement = announcements.find((item) => {
        if (item.placement !== placement) return false;
        if (!matchesAnnouncementTarget(item, pathname)) return false;
        return !dismissedIds.includes(item.id);
      });

      setAnnouncement(matchingAnnouncement ?? null);
    });

    return () => {
      isMounted = false;
    };
  }, [pathname, placement]);

  return announcement;
}
