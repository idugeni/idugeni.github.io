"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Shortlink } from "@/actions/shortlinks";
import { deleteShortlink } from "@/actions/shortlinks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Edit, ExternalLink, Lock, QrCode, Search, Trash2 } from "@/lib/icons";
import { StatusPill } from "@/components/admin/StatusPill";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminTableActionButton } from "@/components/admin/AdminTableActionButton";

interface ShortlinkListClientProps {
  initialShortlinks: Shortlink[];
  stats: {
    total: number;
    active: number;
    totalClicks: number;
    passwordProtected: number;
    trashed: number;
  };
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  filters: {
    search?: string;
    displayMode?: string;
  };
}

export function ShortlinkListClient({
  initialShortlinks,
  stats,
  pagination,
  filters,
}: ShortlinkListClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState(filters.search || "");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filters.displayMode) params.set("displayMode", filters.displayMode);
    router.push(`/admin/shortlinks?${params.toString()}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this shortlink?")) return;
    setIsDeleting(id);
    try {
      await deleteShortlink(id);
      router.refresh();
    } catch (error) {
      alert("Failed to delete shortlink");
    } finally {
      setIsDeleting(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="admin-panel">
          <CardHeader className="pb-2">
            <CardTitle className="font-mono text-xs text-muted-foreground">TOTAL_LINKS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-orbitron text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="admin-panel">
          <CardHeader className="pb-2">
            <CardTitle className="font-mono text-xs text-muted-foreground">ACTIVE</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-orbitron text-3xl font-bold text-success">{stats.active}</div>
          </CardContent>
        </Card>
        <Card className="admin-panel">
          <CardHeader className="pb-2">
            <CardTitle className="font-mono text-xs text-muted-foreground">TOTAL_CLICKS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-orbitron text-3xl font-bold text-primary">{stats.totalClicks}</div>
          </CardContent>
        </Card>
        <Card className="admin-panel">
          <CardHeader className="pb-2">
            <CardTitle className="font-mono text-xs text-muted-foreground">PROTECTED</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-orbitron text-3xl font-bold text-warning">{stats.passwordProtected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card className="admin-panel">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by code, URL, or title..."
                className="rounded-none border-primary/30 bg-secondary/50 pl-10 font-mono"
              />
            </div>
            <Button type="submit" className="rounded-none font-mono">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Shortlinks Table */}
      <Card className="admin-panel">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/50 hover:bg-transparent">
                  <TableHead className="w-48 font-mono text-xs uppercase tracking-wider text-primary">
                    Code
                  </TableHead>
                  <TableHead className="font-mono text-xs uppercase tracking-wider text-primary">
                    Destination
                  </TableHead>
                  <TableHead className="w-36 font-mono text-xs uppercase tracking-wider text-primary">
                    Mode
                  </TableHead>
                  <TableHead className="w-32 font-mono text-xs uppercase tracking-wider text-primary">
                    Clicks
                  </TableHead>
                  <TableHead className="w-32 font-mono text-xs uppercase tracking-wider text-primary">
                    Status
                  </TableHead>
                  <TableHead className="w-48 text-right font-mono text-xs uppercase tracking-wider text-primary">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {initialShortlinks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center font-mono text-sm text-muted-foreground">
                      No shortlinks found
                    </TableCell>
                  </TableRow>
                ) : (
                  initialShortlinks.map((shortlink) => (
                    <TableRow key={shortlink.id} className="border-border/50 hover:bg-secondary/20">
                      <TableCell className="py-3">
                        <div className="space-y-1">
                          <code className="font-mono text-sm font-medium text-primary">
                            {shortlink.code}
                          </code>
                          {shortlink.title && (
                            <p className="truncate text-xs text-muted-foreground">{shortlink.title}</p>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell className="py-3">
                        <a
                          href={shortlink.destination_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary max-w-full"
                        >
                          <span className="truncate">{shortlink.destination_url}</span>
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      </TableCell>
                      
                      <TableCell className="py-3">
                        <StatusPill
                          tone={
                            shortlink.display_mode === "direct"
                              ? "default"
                              : shortlink.display_mode === "safelink"
                                ? "info"
                                : shortlink.display_mode === "splash"
                                  ? "primary"
                                  : "warning"
                          }
                        >
                          {shortlink.display_mode.toUpperCase()}
                        </StatusPill>
                      </TableCell>
                      
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">
                            {shortlink.click_count}
                            {shortlink.click_limit ? ` / ${shortlink.click_limit}` : ""}
                          </span>
                          {shortlink.password_hash && (
                            <Lock className="h-3 w-3 text-warning shrink-0" title="Password protected" />
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell className="py-3">
                        <StatusPill tone={shortlink.is_active ? "success" : "muted"}>
                          {shortlink.is_active ? "ACTIVE" : "INACTIVE"}
                        </StatusPill>
                      </TableCell>
                      
                      <TableCell className="py-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          <AdminTableActionButton
                            label="Copy short URL"
                            icon={Copy}
                            intent="duplicate"
                            onClick={() => copyToClipboard(`${siteUrl}/s/${shortlink.code}`)}
                          />
                          {shortlink.qr_code_url && (
                            <AdminTableActionButton
                              label="View QR code"
                              icon={QrCode}
                              intent="open"
                              href={shortlink.qr_code_url}
                              target="_blank"
                            />
                          )}
                          <AdminTableActionButton
                            label="Edit shortlink"
                            icon={Edit}
                            intent="edit"
                            href={`/admin/shortlinks/${shortlink.id}/edit`}
                          />
                          <AdminTableActionButton
                            label="Delete shortlink"
                            icon={Trash2}
                            intent="delete"
                            onClick={() => handleDelete(shortlink.id)}
                            disabled={isDeleting === shortlink.id}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={page === pagination.page ? "default" : "outline"}
              size="sm"
              onClick={() => {
                const params = new URLSearchParams();
                params.set("page", page.toString());
                if (filters.search) params.set("search", filters.search);
                if (filters.displayMode) params.set("displayMode", filters.displayMode);
                router.push(`/admin/shortlinks?${params.toString()}`);
              }}
              className="rounded-none font-mono"
            >
              {page}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
