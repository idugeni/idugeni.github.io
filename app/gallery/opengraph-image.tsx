import { generateOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const alt = "Gallery — IRNK Codes";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return generateOgImage({
    title: "Gallery",
    description: "Koleksi foto workspace, events, achievements, dan behind-the-scenes dari perjalanan engineering.",
    type: "Gallery",
  });
}
