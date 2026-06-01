"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GalleryStatCards } from "./GalleryStatCards";
import { GalleryFilters } from "./GalleryFilters";
import { GalleryGrid } from "./GalleryGrid";
import { GalleryBulkActionsBar } from "./GalleryBulkActionsBar";
import { GalleryPreviewModal } from "./GalleryPreviewModal";
import { bulkDeleteGalleryItems } from "@/actions/gallery";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface GalleryItem {
  id: string;
  slug: string;
  judul: string;
  deskripsi: string | null;
  fileUrl: string;
  thumbnailUrl: string | null;
  fileType: string;
  fileSize: number;
  aspectRatio: string;
  width: number | null;
  height: number | null;
  created_at: string;
}

interface GalleryListClientProps {
  initialItems: GalleryItem[];
  aspectRatios: string[];
  stats: {
    total: number;
    totalSize: number;
    images: number;
    videos: number;
  };
}

export function GalleryListClient({ initialItems, aspectRatios, stats }: GalleryListClientProps) {
  const router = useRouter();
  
  // Filter state
  const [search, setSearch] = useState("");
  const [fileTypeFilter, setFileTypeFilter] = useState<"all" | "image" | "video">("all");
  const [aspectRatioFilter, setAspectRatioFilter] = useState("all");
  
  // Sort state
  const [sortBy, setSortBy] = useState<"date" | "name" | "size">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Preview modal state
  const [previewItem, setPreviewItem] = useState<GalleryItem | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let filtered = [...initialItems];

    // Search filter
    if (search) {
      filtered = filtered.filter((item) =>
        item.judul.toLowerCase().includes(search.toLowerCase())
      );
    }

    // File type filter
    if (fileTypeFilter !== "all") {
      filtered = filtered.filter((item) =>
        item.fileType.startsWith(fileTypeFilter + "/")
      );
    }

    // Aspect ratio filter
    if (aspectRatioFilter !== "all") {
      filtered = filtered.filter((item) => item.aspectRatio === aspectRatioFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "date":
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case "name":
          comparison = a.judul.localeCompare(b.judul);
          break;
        case "size":
          comparison = a.fileSize - b.fileSize;
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [initialItems, search, fileTypeFilter, aspectRatioFilter, sortBy, sortOrder]);

  // Bulk selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredItems.map((item) => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  // Bulk action handlers
  const handleBulkDelete = async () => {
    try {
      await bulkDeleteGalleryItems(selectedIds);
      toast.success(`Deleted ${selectedIds.length} item(s)`);
      setSelectedIds([]);
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete items");
    }
  };

  // Preview handler
  const handlePreview = (item: GalleryItem) => {
    setPreviewItem(item);
    setPreviewOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <GalleryStatCards stats={stats} />

      {/* Filters */}
      <GalleryFilters
        search={search}
        onSearchChange={setSearch}
        fileTypeFilter={fileTypeFilter}
        onFileTypeFilterChange={setFileTypeFilter}
        aspectRatioFilter={aspectRatioFilter}
        onAspectRatioFilterChange={setAspectRatioFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        aspectRatios={aspectRatios}
      />

      {/* Bulk Actions Bar */}
      <GalleryBulkActionsBar
        selectedCount={selectedIds.length}
        onBulkDelete={handleBulkDelete}
        onClearSelection={() => setSelectedIds([])}
      />

      {/* Grid */}
      <Card className="bg-card border-border/50 rounded-none">
        <CardHeader>
          <CardTitle className="font-orbitron">
            MEDIA_ARCHIVE ({filteredItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <GalleryGrid
            items={filteredItems}
            selectedIds={selectedIds}
            onSelectAll={handleSelectAll}
            onSelectOne={handleSelectOne}
            onPreview={handlePreview}
          />
        </CardContent>
      </Card>

      {/* Preview Modal */}
      <GalleryPreviewModal
        item={previewItem}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </div>
  );
}
