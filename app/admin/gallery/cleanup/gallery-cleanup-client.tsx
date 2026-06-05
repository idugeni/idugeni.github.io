"use client";

import { useState, useEffect } from "react";
import { scanOrphanStorageFiles, purgeOrphanStorageFiles, type OrphanFile } from "@/actions/gallery";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle, Database, Loader2Icon, Sparkles, Trash2 } from "@/lib/icons";

export default function StorageCleanupPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [orphans, setOrphans] = useState<OrphanFile[]>([]);
  const [selectedOrphans, setSelectedOrphans] = useState<Record<string, boolean>>({});

  const handleScan = async () => {
    setIsScanning(true);
    try {
      const data = await scanOrphanStorageFiles();
      setOrphans(data);
      const initialSelected: Record<string, boolean> = {};
      data.forEach((item) => {
        initialSelected[`${item.bucket}:${item.name}`] = true;
      });
      setSelectedOrphans(initialSelected);
      toast.success(`Scan complete. Found ${data.length} orphan file(s).`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Scan failed.");
    } finally {
      setIsScanning(false);
    }
  };

  const handlePurge = async () => {
    const filesToPurge = orphans
      .filter((item) => selectedOrphans[`${item.bucket}:${item.name}`])
      .map((item) => ({ bucket: item.bucket, name: item.name }));

    if (filesToPurge.length === 0) {
      toast.warning("No files selected for purging.");
      return;
    }

    setIsPurging(true);
    try {
      const result = await purgeOrphanStorageFiles(filesToPurge);
      toast.success(`Successfully purged ${result.purgedCount} orphan file(s)!`);
      // Re-scan after purge
      const data = await scanOrphanStorageFiles();
      setOrphans(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Purge failed.");
    } finally {
      setIsPurging(false);
    }
  };

  // Run scan on mount
  useEffect(() => {
    handleScan();
  }, []);

  const totalSize = orphans.reduce((sum, item) => sum + item.size, 0);
  const selectedSize = orphans
    .filter((item) => selectedOrphans[`${item.bucket}:${item.name}`])
    .reduce((sum, item) => sum + item.size, 0);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const toggleSelectAll = () => {
    const allSelected = Object.keys(selectedOrphans).length === orphans.length && Object.values(selectedOrphans).every(Boolean);
    const updated: Record<string, boolean> = {};
    orphans.forEach((item) => {
      updated[`${item.bucket}:${item.name}`] = !allSelected;
    });
    setSelectedOrphans(updated);
  };

  const toggleSelect = (key: string) => {
    setSelectedOrphans((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const hasSelected = Object.values(selectedOrphans).some(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-orbitron text-2xl font-bold uppercase tracking-wider text-primary">
            STORAGE_MANAGER
          </h1>
          <p className="text-sm text-muted-foreground font-mono">
            Scan and optimize database storage assets
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleScan}
            disabled={isScanning || isPurging}
            className="rounded-none font-mono text-xs"
          >
            {isScanning ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin text-primary" />
                SCANNING...
              </>
            ) : (
              "RUN_SCAN"
            )}
          </Button>
          <Button
            type="button"
            onClick={handlePurge}
            disabled={isScanning || isPurging || !hasSelected}
            className="rounded-none bg-danger font-mono text-xs text-danger-foreground hover:bg-danger/90"
          >
            {isPurging ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                PURGING...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                PURGE_SELECTED
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Metrics Summary cards */}
      <div className="grid gap-6 sm:grid-cols-3 font-mono text-xs">
        <Card className="rounded-none border-primary/25 bg-card/75">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-semibold tracking-wider uppercase text-muted-foreground">
              <Database className="mr-2 h-4 w-4 text-primary" />
              TOTAL_ORPHANS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground font-orbitron">{orphans.length}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Unused files in storage buckets</p>
          </CardContent>
        </Card>

        <Card className="rounded-none border-primary/25 bg-card/75">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-semibold tracking-wider uppercase text-muted-foreground">
              <Sparkles className="mr-2 h-4 w-4 text-primary" />
              RECLAIMABLE_SPACE
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground font-orbitron">{formatSize(totalSize)}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Current total size of orphan files</p>
          </CardContent>
        </Card>

        <Card className={`${hasSelected ? "border-danger/30 bg-danger/5" : "border-primary/25 bg-card/75"} rounded-none`}>
          <CardHeader className="pb-2">
            <CardTitle className={`flex items-center text-sm font-semibold tracking-wider uppercase ${hasSelected ? "text-danger" : "text-muted-foreground"}`}>
              <AlertTriangle className="mr-2 h-4 w-4" />
              SELECTED_TO_PURGE
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold font-orbitron ${hasSelected ? "text-danger" : "text-foreground"}`}>
              {formatSize(selectedSize)}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Ready for permanent deletion</p>
          </CardContent>
        </Card>
      </div>

      {/* Orphans table list */}
      <Card className="rounded-none border-primary/25 bg-card/90">
        <CardHeader className="border-b border-border/40">
          <CardTitle className="font-orbitron text-sm uppercase tracking-wider text-primary">
            ORPHANED_MEDIA_ASSETS
          </CardTitle>
          <CardDescription className="font-mono text-[10px] text-muted-foreground">
            Assets physically uploaded inside Supabase buckets but have no references in Database rows
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {isScanning ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
              <p className="font-mono text-xs text-muted-foreground">Scanning storage buckets...</p>
            </div>
          ) : orphans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <CheckCircle className="h-8 w-8 text-success animate-pulse" />
              <p className="font-mono text-xs text-success uppercase font-semibold">Storage is fully optimized!</p>
              <p className="font-mono text-[10px] text-muted-foreground">No orphan assets found inside storage buckets.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-border/40 text-muted-foreground uppercase text-[10px]">
                    <th className="pb-3 pl-3">
                      <input
                        type="checkbox"
                        checked={Object.keys(selectedOrphans).length === orphans.length && Object.values(selectedOrphans).every(Boolean)}
                        onChange={toggleSelectAll}
                        className="cursor-pointer"
                      />
                    </th>
                    <th className="pb-3 font-semibold">BUCKET</th>
                    <th className="pb-3 font-semibold">ASSET_NAME</th>
                    <th className="pb-3 font-semibold">FILE_SIZE</th>
                    <th className="pb-3 font-semibold">UPLOADED_DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {orphans.map((item) => {
                    const key = `${item.bucket}:${item.name}`;
                    const isSelected = !!selectedOrphans[key];
                    return (
                      <tr
                        key={key}
                        className={`border-b border-border/20 transition-colors ${
                          isSelected ? "bg-danger/5" : "hover:bg-secondary/20"
                        }`}
                      >
                        <td className="py-3 pl-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(key)}
                            className="cursor-pointer"
                          />
                        </td>
                        <td className="py-3 uppercase text-[10px]">
                          <span className="inline-block px-1.5 py-0.5 border border-primary/20 bg-primary/5 text-primary">
                            {item.bucket}
                          </span>
                        </td>
                        <td className="py-3 font-mono text-muted-foreground break-all max-w-xs">{item.name}</td>
                        <td className="py-3 font-mono text-foreground font-semibold">{formatSize(item.size)}</td>
                        <td className="py-3 text-muted-foreground text-[10px]">
                          {new Date(item.created_at).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
