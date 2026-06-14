"use client"

import { createContext, useContext } from "react"
import type { ReactNode } from "react"

const CSRFContext = createContext<string | null>(null)

export function CSRFProvider({ 
  children, 
  token 
}: { 
  children: ReactNode
  token: string 
}) {
  return (
    <CSRFContext.Provider value={token}>
      {children}
    </CSRFContext.Provider>
  )
}

export function useCSRFToken() {
  const token = useContext(CSRFContext)
  if (!token) {
    throw new Error("useCSRFToken must be used within CSRFProvider")
  }
  return token
}
