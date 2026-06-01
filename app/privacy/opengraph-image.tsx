import { generateOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const alt = "Privacy Policy — IRNK Codes";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return generateOgImage({
    title: "Privacy Policy",
    description: "Kebijakan privasi dan perlindungan data pengguna di platform IRNK Codes.",
    type: "Legal",
  });
}
