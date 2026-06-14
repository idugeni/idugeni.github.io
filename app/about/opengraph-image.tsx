import { generateOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const alt = "About — IRNK Codes";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return generateOgImage({
    title: "About",
    description: "Eliyanto Sarage — Full Stack Developer, UI/UX Designer, dan AI Engineer dengan 5+ tahun pengalaman.",
    type: "About",
  });
}
