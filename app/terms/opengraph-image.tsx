import { generateOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const alt = "Terms of Service — IRNK Codes";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return generateOgImage({
    title: "Terms of Service",
    description: "Syarat dan ketentuan penggunaan layanan dan platform IRNK Codes.",
    type: "Legal",
  });
}
