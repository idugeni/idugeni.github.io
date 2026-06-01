import { generateOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const alt = "Contact — IRNK Codes";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return generateOgImage({
    title: "Contact",
    description: "Hubungi Eliyanto Sarage untuk kolaborasi proyek, konsultasi teknis, atau diskusi teknologi.",
    type: "Contact",
  });
}
