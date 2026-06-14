import { generateOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const alt = "Blog — IRNK Codes";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return generateOgImage({
    title: "Blog",
    description: "Artikel dan insight tentang web development, AI engineering, UI/UX design, dan teknologi terkini.",
    type: "Blog",
  });
}
