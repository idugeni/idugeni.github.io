/**
 * Modul hook kustom untuk mendeteksi perangkat mobile.
 * @module use-mobile
 */

import * as React from "react"

/** Breakpoint lebar layar untuk menentukan perangkat mobile dalam piksel */
const MOBILE_BREAKPOINT = 768

/**
 * Hook untuk mendeteksi apakah perangkat saat ini adalah mobile berdasarkan lebar layar.
 * Menggunakan Media Query untuk memantau perubahan ukuran layar secara real-time.
 * 
 * @returns {boolean} True jika lebar layar kurang dari MOBILE_BREAKPOINT, false jika sebaliknya
 * 
 * @example
 * function MyComponent() {
 *   const isMobile = useIsMobile();
 *   return (
 *     <div>{isMobile ? "Mobile View" : "Desktop View"}</div>
 *   );
 * }
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
