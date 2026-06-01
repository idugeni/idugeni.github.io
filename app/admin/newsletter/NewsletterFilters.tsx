"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "@/lib/icons";

export interface NewsletterFiltersState { q?: string; status?: "active" | "inactive"; sort?: "date" | "email" | "name" | "status"; order?: "asc" | "desc" }
export function NewsletterFilters({ filters }: { filters: NewsletterFiltersState }) {
  return <form action="/admin/newsletter" className="grid gap-3 rounded-none border border-border/50 bg-card/70 p-4 md:grid-cols-5">
    <div className="relative md:col-span-2"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input name="q" defaultValue={filters.q} placeholder="Search subscribers..." className="rounded-none pl-9 font-mono" /></div>
    <Select name="status" defaultValue={filters.status || "all"}><SelectTrigger className="rounded-none font-mono"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">ALL_STATUS</SelectItem><SelectItem value="active">ACTIVE</SelectItem><SelectItem value="inactive">UNSUBSCRIBED</SelectItem></SelectContent></Select>
    <Select name="sort" defaultValue={filters.sort || "date"}><SelectTrigger className="rounded-none font-mono"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="date">DATE</SelectItem><SelectItem value="email">EMAIL</SelectItem><SelectItem value="name">NAME</SelectItem><SelectItem value="status">STATUS</SelectItem></SelectContent></Select>
    <div className="flex gap-2"><Button className="flex-1 rounded-none font-mono" type="submit">FILTER</Button><Button asChild variant="outline" className="rounded-none font-mono"><Link href="/admin/newsletter">RESET</Link></Button></div>
    <input type="hidden" name="order" value={filters.order || "desc"} />
  </form>;
}
