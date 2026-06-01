import type { AspectRatio } from "@/types/pages";

/**
 * Maps aspect ratio enum to Tailwind CSS aspect-ratio class.
 */
export function getAspectRatioClass(ratio: AspectRatio): string {
  const map: Record<AspectRatio, string> = {
    "1:1": "aspect-square",
    "4:3": "aspect-[4/3]",
    "3:4": "aspect-[3/4]",
    "16:9": "aspect-video",
    "9:16": "aspect-[9/16]",
    "21:9": "aspect-[21/9]",
    "3:2": "aspect-[3/2]",
    "2:3": "aspect-[2/3]",
  };
  return map[ratio] || "aspect-video";
}

/**
 * Maps aspect ratio enum to numeric value (width / height).
 */
export function getAspectRatioValue(ratio: AspectRatio): number {
  const map: Record<AspectRatio, number> = {
    "1:1": 1,
    "4:3": 4 / 3,
    "3:4": 3 / 4,
    "16:9": 16 / 9,
    "9:16": 9 / 16,
    "21:9": 21 / 9,
    "3:2": 3 / 2,
    "2:3": 2 / 3,
  };
  return map[ratio] || 16 / 9;
}

/**
 * All available aspect ratio options for form selects.
 */
export const ASPECT_RATIO_OPTIONS: { value: AspectRatio; label: string }[] = [
  { value: "1:1", label: "1:1 (Square)" },
  { value: "4:3", label: "4:3 (Classic)" },
  { value: "3:4", label: "3:4 (Portrait)" },
  { value: "16:9", label: "16:9 (Widescreen)" },
  { value: "9:16", label: "9:16 (Story/Reels)" },
  { value: "21:9", label: "21:9 (Ultrawide)" },
  { value: "3:2", label: "3:2 (Photo)" },
  { value: "2:3", label: "2:3 (Photo Portrait)" },
];
