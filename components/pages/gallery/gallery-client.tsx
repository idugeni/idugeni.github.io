"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { NeonBorder } from "@/components/ui/neon-border";
import { getAspectRatioClass } from "@/lib/utils/aspect-ratio";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  HiOutlineXMark,
  HiOutlineMagnifyingGlassPlus,
  HiOutlinePlay,
  HiOutlinePhoto,
  HiOutlineFilm,
  HiOutlineSquares2X2,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi2";
import type { GalleryClientProps, GalleryItem } from "@/types/pages";

type GalleryFilter = "semua" | "foto" | "video" | string;

const MEDIA_FILTERS = new Set(["semua", "foto", "video"]);

function normalizeFilter(value: string | null): GalleryFilter {
  return value?.trim().toLowerCase() || "semua";
}

// Helper to detect YouTube URLs
function isYouTubeUrl(url: string): boolean {
  return url.includes("youtube.com/embed/") || url.includes("youtu.be/");
}

function getYouTubeThumbnailUrl(url: string): string | null {
  const patterns = [
    /youtube\.com\/embed\/([^?&/]+)/,
    /youtube\.com\/watch\?v=([^?&/]+)/,
    /youtu\.be\/([^?&/]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return `https://i.ytimg.com/vi_webp/${match[1]}/sddefault.webp`;
    }
  }
  return null;
}

function getGalleryPreviewImage(item: GalleryItem): string | null {
  if (item.thumbnailUrl) return item.thumbnailUrl;
  if (isYouTubeUrl(item.fileUrl)) return getYouTubeThumbnailUrl(item.fileUrl);
  return item.tipe === "foto" ? item.fileUrl : null;
}

export function GalleryClient({ items }: GalleryClientProps) {
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<GalleryFilter>(() =>
    normalizeFilter(searchParams.get("filter"))
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    setFilter(normalizeFilter(searchParams.get("filter")));
    setSelectedIndex(null);
  }, [searchParams]);

  const categories = useMemo(
    () => [...new Set(items.map((item) => item.kategori).filter(Boolean))] as string[],
    [items]
  );

  const filteredItems = useMemo(() => items.filter((item) => {
    if (filter === "semua") return true;
    if (MEDIA_FILTERS.has(filter)) return item.tipe === filter;
    return item.kategori?.toLowerCase() === filter;
  }), [filter, items]);

  const selectedItem = selectedIndex !== null ? filteredItems[selectedIndex] : null;

  const goNext = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % filteredItems.length);
  }, [selectedIndex, filteredItems.length]);

  const goPrev = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + filteredItems.length) % filteredItems.length);
  }, [selectedIndex, filteredItems.length]);

  const closeLightbox = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (selectedIndex === null) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "Escape") closeLightbox();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, goNext, goPrev, closeLightbox]);

  const filterButtons = [
    { key: "semua", label: "ALL", icon: HiOutlineSquares2X2 },
    { key: "foto", label: "PHOTO", icon: HiOutlinePhoto },
    { key: "video", label: "VIDEO", icon: HiOutlineFilm },
  ] as const;

  return (
    <div className="pt-4 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Header */}
        <PageHeader
          badge="Media Archive"
          badgeIcon={<HiOutlinePhoto className="w-4 h-4" />}
          title="VISUAL_ARCHIVES"
          description="Koleksi visual dari workspace, events, achievements, dan momen di balik layar."
        />

        {/* Filter Tabs */}
        <ScrollReveal delay={100}>
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {filterButtons.map((f) => (
              <button
                key={f.key}
                onClick={() => {
                  setFilter(f.key);
                  setSelectedIndex(null);
                }}
                className={cn(
                  "inline-flex items-center gap-2 px-5 py-2.5 font-mono text-xs uppercase transition-all duration-300 border",
                  filter === f.key
                    ? "bg-primary/15 text-primary border-primary/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                    : "bg-secondary/50 text-muted-foreground border-border/50 hover:border-primary/30 hover:text-primary"
                )}
              >
                <f.icon className="w-4 h-4" />
                {f.label}
              </button>
            ))}

            {/* Item count */}
            <span className="font-mono text-[10px] text-muted-foreground/60 ml-2">
              [{filteredItems.length} items]
            </span>
          </div>
        </ScrollReveal>

        {/* Category pills */}
        {categories.length > 0 && (
          <ScrollReveal delay={150}>
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {categories.map((cat) => (
                <span
                  key={cat}
                  className="px-3 py-1 font-mono text-[10px] text-muted-foreground/70 border border-border/30 bg-secondary/20 uppercase"
                >
                  {cat}
                </span>
              ))}
            </div>
          </ScrollReveal>
        )}

        {/* Gallery Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <HiOutlinePhoto className="w-7 h-7 text-primary/50" />
            </div>
            <p className="font-orbitron text-lg text-muted-foreground mb-2">
              NO_MEDIA_FOUND
            </p>
            <p className="font-mono text-xs text-muted-foreground/60">
              Tidak ada media dalam kategori ini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredItems.map((item, i) => (
              <ScrollReveal key={item.id} delay={i * 40}>
                <div
                  className={`relative group cursor-pointer overflow-hidden border border-border/30 hover:border-primary/40 transition-all duration-300 ${getAspectRatioClass(item.aspectRatio)}`}
                  onClick={() => {
                    setSelectedIndex(i);
                  }}
                >
                  {isYouTubeUrl(item.fileUrl) ? (
                    <>
                      {getGalleryPreviewImage(item) ? (
                        <Image
                          src={getGalleryPreviewImage(item)!}
                          alt={item.judul}
                          fill
                          className="object-cover opacity-75 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                          sizes="(max-width: 768px) 50vw, 300px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/60 text-primary">
                          <HiOutlinePlay className="h-10 w-10" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20" aria-hidden="true" />
                    </>
                  ) : item.tipe === "video" && !item.thumbnailUrl ? (
                    <video
                      src={item.fileUrl}
                      muted
                      preload="metadata"
                      className="w-full h-full object-cover opacity-75 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                    />
                  ) : (
                    getGalleryPreviewImage(item) ? (
                      <Image
                        src={getGalleryPreviewImage(item)!}
                        alt={item.judul}
                        fill
                        className="object-cover opacity-75 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                        sizes="(max-width: 768px) 50vw, 300px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-secondary/60 text-muted-foreground">
                        <HiOutlinePhoto className="h-10 w-10" />
                      </div>
                    ))}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="font-orbitron text-sm font-bold text-white mb-1">
                        {item.judul}
                      </h3>
                      {item.deskripsi && (
                        <p className="font-mono text-[10px] text-gray-300 line-clamp-2">
                          {item.deskripsi}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Zoom/Play icon */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/50 backdrop-blur-sm flex items-center justify-center">
                      {item.tipe === "video" ? (
                        <HiOutlinePlay className="w-5 h-5 text-primary" />
                      ) : (
                        <HiOutlineMagnifyingGlassPlus className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </div>

                  {/* Type badge */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm border border-primary/30 font-mono text-[9px] text-primary uppercase">
                    {item.tipe}
                  </div>

                  {/* Category badge */}
                  {item.kategori && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm border border-border/30 font-mono text-[9px] text-muted-foreground uppercase">
                      {item.kategori}
                    </div>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center pt-16 pb-4 px-4 md:pt-20 md:pb-8 md:px-16"
          onClick={closeLightbox}
        >
          {/* Counter */}
          <div className="absolute top-4 left-4 font-mono text-xs text-muted-foreground/60 z-[101]">
            {selectedIndex !== null ? selectedIndex + 1 : 0} / {filteredItems.length}
          </div>

          {/* Prev button */}
          {filteredItems.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 text-white hover:text-primary hover:bg-primary/20 z-[101] w-12 h-12 border border-white/20 bg-black/50 backdrop-blur-sm"
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
            >
              <HiOutlineChevronLeft className="w-8 h-8" />
            </Button>
          )}

          {/* Next button */}
          {filteredItems.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 text-white hover:text-primary hover:bg-primary/20 z-[101] w-12 h-12 border border-white/20 bg-black/50 backdrop-blur-sm"
              onClick={(e) => { e.stopPropagation(); goNext(); }}
            >
              <HiOutlineChevronRight className="w-8 h-8" />
            </Button>
          )}

          {/* Image */}
          <div
            className="relative w-full max-w-5xl flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button - pojok kanan atas gambar */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-2 -right-2 md:top-2 md:right-2 text-white hover:text-primary hover:bg-primary/20 z-[102] w-10 h-10 border border-white/20 bg-black/70 backdrop-blur-sm rounded-full"
              onClick={closeLightbox}
            >
              <HiOutlineXMark className="w-6 h-6" />
            </Button>

            <NeonBorder className="w-full">
              <div className={`relative w-full ${getAspectRatioClass(selectedItem.aspectRatio)} max-h-[75vh] overflow-hidden`}>
                {isYouTubeUrl(selectedItem.fileUrl) ? (
                  <iframe
                    src={selectedItem.fileUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    suppressHydrationWarning
                  />
                ) : selectedItem.tipe === "video" ? (
                  <video
                    src={selectedItem.fileUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image
                    src={selectedItem.fileUrl}
                    alt={selectedItem.judul}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 900px"
                    priority
                  />
                )}
              </div>
            </NeonBorder>
          </div>

          {/* Title & Description */}
          <div
            className="mt-4 text-center max-w-2xl z-[101]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-orbitron text-sm md:text-base font-bold text-white mb-1">
              {selectedItem.judul}
            </h3>
            {selectedItem.deskripsi && (
              <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                {selectedItem.deskripsi}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
