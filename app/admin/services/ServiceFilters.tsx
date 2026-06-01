"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "@/lib/icons";

interface ServiceFiltersProps {
  filters: {
    q?: string;
    status?: "active" | "inactive";
    sort?: "date" | "name" | "order" | "status";
    order?: "asc" | "desc";
  };
}

function filterHref(next: ServiceFiltersProps["filters"]) {
  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.status) params.set("status", next.status);
  if (next.sort) params.set("sort", next.sort);
  if (next.order) params.set("order", next.order);
  const query = params.toString();
  return query ? `/admin/services?${query}` : "/admin/services";
}

export function ServiceFilters({ filters }: ServiceFiltersProps) {
  return (
    <form action="/admin/services" className="grid gap-3 rounded-none border border-border/50 bg-card p-4 md:grid-cols-[1fr_160px_160px_140px_auto]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="q"
          defaultValue={filters.q ?? ""}
          placeholder="Search services..."
          className="rounded-none border-border/50 bg-secondary/50 pl-9 font-mono"
        />
      </div>

      <Select name="status" defaultValue={filters.status ?? "all"}>
        <SelectTrigger className="rounded-none border-border/50 bg-secondary/50 font-mono">
          <SelectValue placeholder="STATUS" />
        </SelectTrigger>
        <SelectContent className="rounded-none border-border/50">
          <SelectItem value="all" className="font-mono">ALL_STATUS</SelectItem>
          <SelectItem value="active" className="font-mono">ACTIVE</SelectItem>
          <SelectItem value="inactive" className="font-mono">INACTIVE</SelectItem>
        </SelectContent>
      </Select>

      <Select name="sort" defaultValue={filters.sort ?? "order"}>
        <SelectTrigger className="rounded-none border-border/50 bg-secondary/50 font-mono">
          <SelectValue placeholder="SORT" />
        </SelectTrigger>
        <SelectContent className="rounded-none border-border/50">
          <SelectItem value="order" className="font-mono">ORDER</SelectItem>
          <SelectItem value="name" className="font-mono">NAME</SelectItem>
          <SelectItem value="status" className="font-mono">STATUS</SelectItem>
          <SelectItem value="date" className="font-mono">DATE</SelectItem>
        </SelectContent>
      </Select>

      <Select name="order" defaultValue={filters.order ?? "asc"}>
        <SelectTrigger className="rounded-none border-border/50 bg-secondary/50 font-mono">
          <SelectValue placeholder="ORDER" />
        </SelectTrigger>
        <SelectContent className="rounded-none border-border/50">
          <SelectItem value="asc" className="font-mono">ASC</SelectItem>
          <SelectItem value="desc" className="font-mono">DESC</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex gap-2">
        <Button type="submit" className="rounded-none font-mono">FILTER</Button>
        <Button asChild type="button" variant="outline" className="rounded-none font-mono">
          <Link href={filterHref({})}>RESET</Link>
        </Button>
      </div>
    </form>
  );
}
