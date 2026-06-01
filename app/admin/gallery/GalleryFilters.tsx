"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X, ArrowUpDown } from "@/lib/icons";

interface GalleryFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  fileTypeFilter: "all" | "image" | "video";
  onFileTypeFilterChange: (value: "all" | "image" | "video") => void;
  aspectRatioFilter: string;
  onAspectRatioFilterChange: (value: string) => void;
  sortBy: "date" | "name" | "size";
  onSortByChange: (value: "date" | "name" | "size") => void;
  sortOrder: "asc" | "desc";
  onSortOrderChange: (value: "asc" | "desc") => void;
  aspectRatios: string[];
}

export function GalleryFilters({
  search,
  onSearchChange,
  fileTypeFilter,
  onFileTypeFilterChange,
  aspectRatioFilter,
  onAspectRatioFilterChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  aspectRatios,
}: GalleryFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Search and File Type Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="SEARCH_MEDIA..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 font-mono rounded-none border-border/50"
          />
          {search && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => onSearchChange("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* File Type Filter */}
        <Select value={fileTypeFilter} onValueChange={(v) => onFileTypeFilterChange(v as any)}>
          <SelectTrigger className="w-full md:w-[180px] font-mono rounded-none border-border/50">
            <SelectValue placeholder="FILE_TYPE" />
          </SelectTrigger>
          <SelectContent className="rounded-none border-border/50">
            <SelectItem value="all" className="font-mono">
              ALL_FILES
            </SelectItem>
            <SelectItem value="image" className="font-mono">
              IMAGES
            </SelectItem>
            <SelectItem value="video" className="font-mono">
              VIDEOS
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Aspect Ratio and Sort Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Aspect Ratio Filter */}
        <Select value={aspectRatioFilter} onValueChange={onAspectRatioFilterChange}>
          <SelectTrigger className="w-full md:w-[200px] font-mono rounded-none border-border/50">
            <SelectValue placeholder="ASPECT_RATIO" />
          </SelectTrigger>
          <SelectContent className="rounded-none border-border/50">
            <SelectItem value="all" className="font-mono">
              ALL_RATIOS
            </SelectItem>
            {aspectRatios.map((ratio) => (
              <SelectItem key={ratio} value={ratio} className="font-mono">
                {ratio}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort By */}
        <Select value={sortBy} onValueChange={(v) => onSortByChange(v as any)}>
          <SelectTrigger className="w-full md:w-[180px] font-mono rounded-none border-border/50">
            <SelectValue placeholder="SORT_BY" />
          </SelectTrigger>
          <SelectContent className="rounded-none border-border/50">
            <SelectItem value="date" className="font-mono">
              DATE
            </SelectItem>
            <SelectItem value="name" className="font-mono">
              NAME
            </SelectItem>
            <SelectItem value="size" className="font-mono">
              SIZE
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Order */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")}
          className="rounded-none border-border/50"
          title={sortOrder === "asc" ? "Ascending" : "Descending"}
        >
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
