"use client";

import { Info } from "@/lib/icons";

interface ErrorLog {
  id: string;
  level: string;
  module: string;
  message: string;
  stack: string | null;
  url: string | null;
  user_agent: string | null;
  ip_address: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

interface ErrorLogsTableProps {
  logs: ErrorLog[];
}

function getLevelColor(level: string) {
  switch (level) {
    case "info":
      return "text-blue-400";
    case "warn":
      return "text-amber-400";
    case "error":
      return "text-orange-400";
    case "fatal":
      return "text-red-500";
    default:
      return "text-foreground";
  }
}

const logDateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "medium",
  timeZone: "UTC",
});

function formatLogDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "INVALID_DATE";
  return `${logDateFormatter.format(date)} UTC`;
}

export function ErrorLogsTable({ logs }: ErrorLogsTableProps) {
  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Info className="h-12 w-12 mb-4" />
        <p className="font-mono text-sm">NO_ERRORS_RECORDED</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <div
          key={log.id}
          className="border border-border/50 bg-background/40 p-4 font-mono text-xs"
        >
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex items-center gap-2">
              <span className={`uppercase font-bold ${getLevelColor(log.level)}`}>
                {log.level}
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-primary">{log.module}</span>
            </div>
            <span className="text-muted-foreground whitespace-nowrap">
              {formatLogDate(log.created_at)}
            </span>
          </div>
          
          <div className="text-foreground mb-2">{log.message}</div>

          {log.stack && (
            <details className="text-muted-foreground">
              <summary className="cursor-pointer hover:text-foreground">
                Stack trace
              </summary>
              <pre className="mt-2 p-2 bg-muted/30 overflow-x-auto text-[10px]">
                {log.stack}
              </pre>
            </details>
          )}

          {(log.url || log.ip_address) && (
            <div className="mt-2 text-muted-foreground text-[10px] space-y-0.5">
              {log.url && <div>URL: {log.url}</div>}
              {log.ip_address && <div>IP: {log.ip_address}</div>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
