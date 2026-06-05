import { revalidateTag, updateTag } from "next/cache";

export const CACHE_TAGS = {
  home: "home",
  blog: "blog",
  projects: "projects",
  services: "services",
  testimonials: "testimonials",
  gallery: "gallery",
  announcements: "announcements",
} as const;

type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];

const PUBLIC_HOME_DEPENDENCIES: readonly CacheTag[] = [
  CACHE_TAGS.home,
  CACHE_TAGS.projects,
  CACHE_TAGS.services,
  CACHE_TAGS.testimonials,
  CACHE_TAGS.blog,
  CACHE_TAGS.gallery,
] as const;

function revalidatePublicTags(tags: readonly CacheTag[]) {
  for (const tag of tags) {
    revalidateTag(tag, "max");
  }
}

function updatePublicTags(tags: readonly CacheTag[]) {
  for (const tag of tags) {
    updateTag(tag);
  }
}

export function revalidatePublicContent(tags: readonly CacheTag[]) {
  revalidatePublicTags(tags);
  if (tags.some((tag) => PUBLIC_HOME_DEPENDENCIES.includes(tag))) {
    revalidateTag(CACHE_TAGS.home, "max");
  }
}

export function updatePublicContent(tags: readonly CacheTag[]) {
  updatePublicTags(tags);
  if (tags.some((tag) => PUBLIC_HOME_DEPENDENCIES.includes(tag))) {
    updateTag(CACHE_TAGS.home);
  }
}
