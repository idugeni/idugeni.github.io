"use client"

import { createContext, useContext, useState, useEffect } from "react"
import type { ReactNode } from "react"

const CSRFContext = createContext<string | null>(null)

export function CSRFProvider({ 
  children, 
  initialToken 
}: { 
  children: ReactNode
  initialToken: string | null
}) {
  const [token, setToken] = useState<string | null>(initialToken)

  useEffect(() => {
    // If we already have a token from server-side render, no need to fetch
    if (token) return

    // Lazily fetch CSRF token from the API route (which can set cookies)
    let cancelled = false
    fetch("/api/csrf-token")
      .then((res) => {
        if (!res.ok) throw new Error(`CSRF fetch failed: ${res.status}`)
        return res.json()
      })
      .then((data: { token: string }) => {
        if (!cancelled && data.token) {
          setToken(data.token)
        }
      })
      .catch((err) => {
        console.error("[CSRFProvider] Failed to fetch CSRF token:", err)
      })

    return () => { cancelled = true }
  }, [token])

  return (
    <CSRFContext.Provider value={token}>
      {children}
    </CSRFContext.Provider>
  )
}

export function useCSRFToken() {
  const token = useContext(CSRFContext)
  // Return empty string instead of throwing when token is still loading
  // Server actions that require CSRF will validate on submission
  return token ?? ""
}
