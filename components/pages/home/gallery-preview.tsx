"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { HiOutlineArrowRight, HiChevronLeft, HiChevronRight, HiXMark } from "react-icons/hi2";
import type { GalleryItem } from "@/types/pages";
import {
  getSafeImageSource,
  shouldBypassImageOptimization,
} from "@/lib/utils/image-source";

export function GalleryPreview({ items }: { items: GalleryItem[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  if (!items || items.length === 0) return null;

  const displayItems = items.slice(0, 8);

  const openModal = (index: number) => {
    setSelectedIndex(index);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedIndex(null);
  };

  const goToPrevious = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedIndex !== null && selectedIndex < displayItems.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const selectedItem = selectedIndex !== null ? displayItems[selectedIndex] : null;

  return (
    <>
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12">
              <div>
                <span className="font-mono text-[10px] text-primary/70 tracking-widest">// VISUAL ARCHIVES</span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-orbitron font-bold neon-text mt-2">
                  GALLERY_PREVIEW
                </h2>
              </div>
              <Link href="/gallery" prefetch={false}>
                <Button variant="ghost" className="font-mono text-primary hover:text-primary/80">
                  VIEW_ALL <HiOutlineArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={150}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {displayItems.map((item, i) => {
                const previewImage = getSafeImageSource(item.thumbnailUrl, item.fileUrl);

                return (
                  <button
                    key={item.id}
                    onClick={() => openModal(i)}
                    className={`relative group overflow-hidden border border-primary/10 hover:border-primary/40 transition-all duration-300 cursor-pointer ${
                      i === 0 ? "col-span-2 row-span-2" : ""
                    }`}
                  >
                    <div className={`relative ${i === 0 ? "h-64 md:h-80" : "h-32 md:h-40"} bg-secondary/30`}>
                      {previewImage ? (
                        <Image
                          src={previewImage}
                          alt={item.judul}
                          fill
                          className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                          sizes={i === 0 ? "(max-width: 768px) 100vw, 600px" : "(max-width: 768px) 50vw, 300px"}
                          unoptimized={shouldBypassImageOptimization(previewImage)}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-secondary/60 font-mono text-xs text-muted-foreground">
                          [NO_IMAGE]
                        </div>
                      )}
                    </div>
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="font-mono text-xs text-foreground truncate">{item.judul}</p>
                        {item.kategori && (
                          <span className="font-mono text-[10px] text-primary/70">{item.kategori}</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Gallery Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-7xl w-[95vw] h-[90vh] p-0 overflow-hidden border-primary/20">
          {selectedItem && (
            <div className="relative w-full h-full flex flex-col">
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-colors"
                aria-label="Close"
              >
                <HiXMark className="h-5 w-5 text-foreground" />
              </button>

              {/* Image Container */}
              <div className="relative flex-1 bg-black/50">
                {getSafeImageSource(selectedItem.fileUrl, selectedItem.thumbnailUrl) ? (
                  <Image
                    src={getSafeImageSource(selectedItem.fileUrl, selectedItem.thumbnailUrl)!}
                    alt={selectedItem.judul}
                    fill
                    className="object-contain"
                    sizes="95vw"
                    loading="eager"
                    unoptimized={shouldBypassImageOptimization(getSafeImageSource(selectedItem.fileUrl, selectedItem.thumbnailUrl))}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-mono text-sm text-muted-foreground">
                    [NO_IMAGE]
                  </div>
                )}
              </div>

              {/* Navigation Controls */}
              <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 pointer-events-none">
                <button
                  onClick={goToPrevious}
                  disabled={selectedIndex === 0}
                  className="pointer-events-auto p-3 rounded-full bg-background/80 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Previous image"
                >
                  <HiChevronLeft className="h-6 w-6 text-foreground" />
                </button>
                <button
                  onClick={goToNext}
                  disabled={selectedIndex === displayItems.length - 1}
                  className="pointer-events-auto p-3 rounded-full bg-background/80 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Next image"
                >
                  <HiChevronRight className="h-6 w-6 text-foreground" />
                </button>
              </div>

              {/* Image Info */}
              <div className="p-6 bg-background/95 backdrop-blur-sm border-t border-primary/20">
                <div className="max-w-7xl mx-auto">
                  <DialogTitle className="font-mono text-lg font-semibold text-foreground mb-1">
                    {selectedItem.judul}
                  </DialogTitle>
                  {selectedItem.kategori && (
                    <p className="font-mono text-sm text-primary/70">{selectedItem.kategori}</p>
                  )}
                  <DialogDescription className="font-mono text-sm text-muted-foreground mt-2">
                    {selectedItem.deskripsi || "Gallery image"}
                  </DialogDescription>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="font-mono text-xs text-muted-foreground">
                      {selectedIndex !== null ? selectedIndex + 1 : 0} / {displayItems.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
