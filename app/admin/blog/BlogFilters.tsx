"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X, ArrowUpDown } from "@/lib/icons";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";

interface BlogFiltersProps {
  filters: {
    q?: string;
    status?: "published" | "draft";
    category?: string;
    featured?: "true";
    sort?: "date" | "views" | "likes" | "title";
    order?: "asc" | "desc";
  };
  categories: Array<{ id: string; nama: string; warna: string | null }>;
}

export function BlogFilters({ filters, categories }: BlogFiltersProps) {
  const router = useRouter();
  const [search, setSearch] = useState(filters.q ?? "");
  const current = useMemo(() => new URLSearchParams(), []);

  const navigate = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(current);
    if (filters.q) params.set("q", filters.q);
    if (filters.status) params.set("status", filters.status);
    if (filters.category) params.set("category", filters.category);
    if (filters.featured) params.set("featured", filters.featured);
    if (filters.sort) params.set("sort", filters.sort);
    if (filters.order) params.set("order", filters.order);

    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === "all") params.delete(key);
      else params.set(key, value);
    });
    params.delete("page");
    const query = params.toString();
    router.push(query ? `/admin/blog?${query}` : "/admin/blog");
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate({ q: search.trim() || null });
  };

  const statusFilter = filters.status ?? "all";
  const categoryFilter = filters.category ?? "all";
  const featuredFilter = filters.featured === "true";
  const sortBy = filters.sort ?? "date";
  const sortOrder = filters.order ?? "desc";

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <form onSubmit={submitSearch} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            name="q"
            placeholder="SEARCH_ARTICLES..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-10 pr-20 font-mono rounded-none border-border/50"
          />
          {search && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-10 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => {
                setSearch("");
                navigate({ q: null });
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button type="submit" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 rounded-none font-mono">
            GO
          </Button>
        </form>

        <Tabs value={statusFilter} onValueChange={(value) => navigate({ status: value })} className="w-full md:w-auto">
          <TabsList className="grid w-full md:w-auto grid-cols-3 rounded-none border border-border/50">
            <TabsTrigger value="all" className="font-mono text-xs rounded-none">ALL</TabsTrigger>
            <TabsTrigger value="published" className="font-mono text-xs rounded-none">PUBLISHED</TabsTrigger>
            <TabsTrigger value="draft" className="font-mono text-xs rounded-none">DRAFT</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <Select value={categoryFilter} onValueChange={(value) => navigate({ category: value })}>
          <SelectTrigger className="w-full md:w-56 font-mono rounded-none border-border/50">
            <SelectValue placeholder="ALL_CATEGORIES" />
          </SelectTrigger>
          <SelectContent className="rounded-none border-border/50">
            <SelectItem value="all" className="font-mono">ALL_CATEGORIES</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id} className="font-mono">
                <div className="flex items-center gap-2">
                  {cat.warna && <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.warna }} />}
                  {cat.nama}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant={featuredFilter ? "default" : "outline"}
          onClick={() => navigate({ featured: featuredFilter ? null : "true" })}
          className="font-mono rounded-none border-border/50"
        >
          {featuredFilter ? "FEATURED_ONLY" : "SHOW_ALL"}
        </Button>

        <Select value={sortBy} onValueChange={(value) => navigate({ sort: value })}>
          <SelectTrigger className="w-full md:w-44 font-mono rounded-none border-border/50">
            <SelectValue placeholder="SORT_BY" />
          </SelectTrigger>
          <SelectContent className="rounded-none border-border/50">
            <SelectItem value="date" className="font-mono">DATE</SelectItem>
            <SelectItem value="views" className="font-mono">VIEWS</SelectItem>
            <SelectItem value="likes" className="font-mono">LIKES</SelectItem>
            <SelectItem value="title" className="font-mono">TITLE</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate({ order: sortOrder === "asc" ? "desc" : "asc" })}
          className="rounded-none border-border/50"
          title={sortOrder === "asc" ? "Ascending" : "Descending"}
        >
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
