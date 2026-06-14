import { headers } from "next/headers";
import { z } from "zod";

export const uuidSchema = z.string().uuid();

export const slugSchema = z
  .string()
  .min(1)
  .max(220)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const uuidArraySchema = z
  .array(uuidSchema)
  .min(1, "At least one ID is required")
  .max(100, "A maximum of 100 IDs can be processed at once");

export async function getClientIp() {
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor || headersList.get("x-real-ip") || "unknown";
}

export function getFirstValidationMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? "Invalid request data";
}
