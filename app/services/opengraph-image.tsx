import { generateOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const alt = "Services — IRNK Codes";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return generateOgImage({
    title: "Services",
    description: "Web development, AI integration, UI/UX design, mobile apps, DevOps, dan technical consulting.",
    type: "Services",
  });
}
