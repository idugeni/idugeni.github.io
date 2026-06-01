import { generateOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const alt = "Projects — IRNK Codes";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return generateOgImage({
    title: "Projects",
    description: "Portfolio proyek full-stack, mobile apps, AI/ML, dan open source karya Eliyanto Sarage.",
    type: "Portfolio",
  });
}
