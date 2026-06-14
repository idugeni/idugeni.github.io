import { generateOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const alt = "Resume — IRNK Codes";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return generateOgImage({
    title: "Resume",
    description: "Resume profesional Eliyanto Sarage — Full Stack Developer, UI/UX Designer & AI Engineer.",
    type: "Resume",
  });
}
