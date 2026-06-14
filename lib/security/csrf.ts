import "server-only"
import { cookies } from "next/headers"

const CSRF_SECRET = process.env.CSRF_SECRET || process.env.DATABASE_SECRET_KEY || "default-csrf-secret-change-me"

// Edge-compatible random bytes using Web Crypto API
function getRandomHex(bytes: number): string {
  const array = new Uint8Array(bytes)
  crypto.getRandomValues(array)
  return Array.from(array, b => b.toString(16).padStart(2, "0")).join("")
}

// Edge-compatible HMAC using Web Crypto API
async function hmacSign(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(data)
  )
  return Array.from(new Uint8Array(signature), b => b.toString(16).padStart(2, "0")).join("")
}

function generateCSRFToken(): Promise<string> {
  return (async () => {
    const tokenId = getRandomHex(32)
    const signature = await hmacSign(tokenId, CSRF_SECRET)
    return `${tokenId}.${signature}`
  })()
}

export async function validateCSRFToken(token: string): Promise<boolean> {
  const parts = token.split(".")
  if (parts.length !== 2) return false
  
  const [tokenId, signature] = parts
  const expectedSignature = await hmacSign(tokenId, CSRF_SECRET)
  
  return signature === expectedSignature
}

async function verifyCSRFToken(token: string): Promise<boolean> {
  return validateCSRFToken(token)
}

/**
 * Read existing CSRF token from cookie (READ-ONLY, safe for Server Components).
 * Returns null if no valid token exists yet.
 */
export async function getCSRFToken(): Promise<string | null> {
  const cookieStore = await cookies()
  const existingToken = cookieStore.get("csrf_token")
  
  if (existingToken && await verifyCSRFToken(existingToken.value)) {
    return existingToken.value
  }
  
  return null
}

/**
 * Generate a new CSRF token and set it as a cookie.
 * MUST only be called from a Route Handler or Server Action.
 */
export async function setCSRFToken(): Promise<string> {
  const cookieStore = await cookies()
  const newToken = await generateCSRFToken()
  cookieStore.set("csrf_token", newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  })
  return newToken
}

export async function validateCSRF(formData: FormData): Promise<boolean> {
  const token = formData.get("csrf_token")
  
  if (typeof token !== "string") {
    return false
  }
  
  const cookieStore = await cookies()
  const cookieToken = cookieStore.get("csrf_token")
  
  if (!cookieToken || cookieToken.value !== token) {
    return false
  }
  
  return verifyCSRFToken(token)
}

export function withCSRF<T extends (...args: any[]) => Promise<any>>(
  action: T
): T {
  return (async (formData: FormData, ...args: any[]) => {
    const isValid = await validateCSRF(formData)
    
    if (!isValid) {
      throw new Error("Invalid CSRF token")
    }
    
    return action(formData, ...args)
  }) as T
}
