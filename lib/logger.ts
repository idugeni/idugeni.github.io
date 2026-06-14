/**
 * Structured Logger for IRNK Codes
 *
 * Centralized logging utility with levels (info, warn, error, fatal).
 * Server-side: outputs structured JSON to console for cloud log aggregation.
 * Client-side: sends errors to /api/report-error endpoint.
 *
 * Usage:
 *   import { logger } from "@/lib/logger";
 *   logger.error("Failed to send email", { module: "contact", error });
 */

export type LogLevel = "info" | "warn" | "error" | "fatal";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  error?: string;
  stack?: string;
  metadata?: Record<string, unknown>;
}

function createLogEntry(
  level: LogLevel,
  module: string,
  message: string,
  metadata?: Record<string, unknown>,
): LogEntry {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    module,
    message,
  };

  if (metadata?.error instanceof Error) {
    entry.error = metadata.error.message;
    entry.stack = metadata.error.stack;
    const { error: _err, ...rest } = metadata;
    if (Object.keys(rest).length > 0) entry.metadata = rest;
  } else if (metadata && Object.keys(metadata).length > 0) {
    entry.metadata = metadata;
  }

  return entry;
}

// --- Server-side logger ---

function logServer(entry: LogEntry): void {
  const output = JSON.stringify(entry);
  switch (entry.level) {
    case "info":
      console.log(output);
      break;
    case "warn":
      console.warn(output);
      break;
    case "error":
    case "fatal":
      console.error(output);
      break;
  }
}

// --- Client-side logger (reports to server) ---

async function reportToServer(entry: LogEntry): Promise<void> {
  try {
    await fetch("/api/report-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
  } catch {
    // Silently fail — don't create infinite error loops
  }
}

function logClient(entry: LogEntry): void {
  // Always log to console in development
  if (process.env.NODE_ENV === "development") {
    logServer(entry);
  }

  // Report errors and fatals to server in production
  if (entry.level === "error" || entry.level === "fatal") {
    reportToServer(entry);
  }
}

// --- Universal logger factory ---

function isServer(): boolean {
  return typeof window === "undefined";
}

export interface Logger {
  info: (message: string, metadata?: Record<string, unknown>) => void;
  warn: (message: string, metadata?: Record<string, unknown>) => void;
  error: (message: string, metadata?: Record<string, unknown>) => void;
  fatal: (message: string, metadata?: Record<string, unknown>) => void;
}

/**
 * Create a namespaced logger instance.
 *
 * @example
 * ```ts
 * const log = createLogger("contact-action");
 * log.error("Failed to send email", { error: err });
 * log.info("Message submitted", { nama: "John" });
 * ```
 */
export function createLogger(module: string): Logger {
  const log = (level: LogLevel, message: string, metadata?: Record<string, unknown>) => {
    const entry = createLogEntry(level, module, message, metadata);
    if (isServer()) {
      logServer(entry);
    } else {
      logClient(entry);
    }
  };

  return {
    info: (message, metadata) => log("info", message, metadata),
    warn: (message, metadata) => log("warn", message, metadata),
    error: (message, metadata) => log("error", message, metadata),
    fatal: (message, metadata) => log("fatal", message, metadata),
  };
}

/**
 * Default logger for quick one-off logging.
 *
 * @example
 * ```ts
 * logger.error("Something went wrong", { error: err });
 * ```
 */
export const logger: Logger = createLogger("app");
