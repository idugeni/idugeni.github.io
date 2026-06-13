"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "@/lib/icons";

export interface MessageFiltersState {
  q?: string;
  read?: "read" | "unread";
  replied?: "replied" | "unreplied";
  resend?: "pending" | "sent" | "skipped" | "failed";
  service?: string;
  sort?: "date" | "sender" | "subject" | "resend";
  order?: "asc" | "desc";
}

interface MessageFiltersProps {
  filters: MessageFiltersState;
  services: string[];
}

function buildHref(next: MessageFiltersState) {
  const params = new URLSearchParams();
  Object.entries(next).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const query = params.toString();
  return query ? `/admin/messages?${query}` : "/admin/messages";
}

export function MessageFilters({ filters, services }: MessageFiltersProps) {
  return (
    <form action="/admin/messages" className="grid gap-3 rounded-none border border-border/50 bg-card/70 p-4 md:grid-cols-2 xl:grid-cols-7">
      <div className="relative xl:col-span-2">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="q"
          defaultValue={filters.q}
          placeholder="Search transmissions..."
          className="rounded-none pl-9 font-mono"
        />
      </div>

      <Select name="read" defaultValue={filters.read || "all"}>
        <SelectTrigger className="rounded-none font-mono"><SelectValue placeholder="Read status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">ALL_READ</SelectItem>
          <SelectItem value="unread">UNREAD</SelectItem>
          <SelectItem value="read">READ</SelectItem>
        </SelectContent>
      </Select>

      <Select name="replied" defaultValue={filters.replied || "all"}>
        <SelectTrigger className="rounded-none font-mono"><SelectValue placeholder="Reply status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">ALL_REPLIES</SelectItem>
          <SelectItem value="unreplied">UNREPLIED</SelectItem>
          <SelectItem value="replied">REPLIED</SelectItem>
        </SelectContent>
      </Select>

      <Select name="resend" defaultValue={filters.resend || "all"}>
        <SelectTrigger className="rounded-none font-mono"><SelectValue placeholder="Resend" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">ALL_RESEND</SelectItem>
          <SelectItem value="pending">PENDING</SelectItem>
          <SelectItem value="sent">SENT</SelectItem>
          <SelectItem value="skipped">SKIPPED</SelectItem>
          <SelectItem value="failed">FAILED</SelectItem>
        </SelectContent>
      </Select>

      <Select name="service" defaultValue={filters.service || "all"}>
        <SelectTrigger className="rounded-none font-mono"><SelectValue placeholder="Service" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">ALL_SERVICES</SelectItem>
          {services.map((service) => <SelectItem key={service} value={service}>{service}</SelectItem>)}
        </SelectContent>
      </Select>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1 rounded-none font-mono">FILTER</Button>
        <Button asChild type="button" variant="outline" className="rounded-none font-mono">
          <Link href={buildHref({})} prefetch={false}>RESET</Link>
        </Button>
      </div>
      <input type="hidden" name="sort" value={filters.sort || "date"} />
      <input type="hidden" name="order" value={filters.order || "desc"} />
    </form>
  );
}
