import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format large numbers for display
 * Examples:
 * - 999 → "999"
 * - 1234 → "1.2K"
 * - 12345 → "12K"
 * - 1234567 → "1.2M"
 */
export function formatCompactNumber(num: number): string {
  if (num < 1000) return num.toString();
  if (num < 10000) return `${(num / 1000).toFixed(1)}K`;
  if (num < 1000000) return `${Math.floor(num / 1000)}K`;
  return `${(num / 1000000).toFixed(1)}M`;
}
