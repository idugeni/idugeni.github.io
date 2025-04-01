/**
 * Modul utilitas untuk mengelola kelas CSS dalam aplikasi.
 * @module utils
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Menggabungkan dan mengoptimalkan kelas CSS dengan dukungan Tailwind.
 * Fungsi ini menggabungkan beberapa kelas CSS menggunakan clsx dan
 * mengoptimalkannya dengan tailwind-merge untuk menghindari konflik.
 * 
 * @param {...ClassValue[]} inputs - Array dari kelas CSS yang akan digabungkan
 * @returns {string} String kelas CSS yang telah digabung dan dioptimalkan
 * 
 * @example
 * cn("text-red-500", "bg-blue-200", { "hidden": isHidden })
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
