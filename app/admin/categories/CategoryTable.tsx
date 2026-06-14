"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Tag } from "@/lib/icons";
import { AdminTableActionButton } from "@/components/admin/AdminTableActionButton";

export interface AdminBlogCategory {
  id: string;
  nama: string;
  slug: string;
  deskripsi: string | null;
  warna: string | null;
  created_at: string;
  article_count: number;
}

interface CategoryTableProps {
  categories: AdminBlogCategory[];
  onDelete: (category: AdminBlogCategory) => void;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function CategoryTable({ categories, onDelete }: CategoryTableProps) {
  return (
    <div className="overflow-x-auto border border-border/50 bg-card/80">
      <Table className="w-full">
        <TableHeader>
          <TableRow className="border-border/50 hover:bg-transparent">
            <TableHead className="font-mono text-primary">CATEGORY_DETAILS</TableHead>
            <TableHead className="w-48 font-mono text-primary">SLUG_PATH</TableHead>
            <TableHead className="w-40 font-mono text-primary">COLOR_SIGNAL</TableHead>
            <TableHead className="w-32 text-center font-mono text-primary">ARTICLES</TableHead>
            <TableHead className="w-44 font-mono text-primary">CREATED_DATE</TableHead>
            <TableHead className="w-36 text-right font-mono text-primary">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-12 text-center font-mono text-muted-foreground">
                <Tag className="mx-auto mb-2 h-6 w-6 text-primary/40 animate-pulse" />
                NO_CATEGORIES_FOUND
              </TableCell>
            </TableRow>
          ) : (
            categories.map((category) => (
              <TableRow key={category.id} className="border-border/50 align-top hover:bg-secondary/40">
                <TableCell className="py-4">
                  <div className="space-y-1 font-mono">
                    <div className="text-sm font-semibold text-foreground leading-snug">{category.nama}</div>
                    {category.deskripsi && (
                      <p className="line-clamp-2 max-w-md text-xs text-muted-foreground leading-relaxed">
                        {category.deskripsi}
                      </p>
                    )}
                  </div>
                </TableCell>
                
                <TableCell className="py-4 font-mono text-xs text-primary">
                  /{category.slug}
                </TableCell>
                
                <TableCell className="py-4">
                  <div className="inline-flex items-center gap-2 border border-border/50 bg-background/40 px-2 py-1 font-mono text-xs">
                    <span
                      className="h-3 w-3 rounded-full border border-white/20 shrink-0"
                      style={{ backgroundColor: category.warna ?? "hsl(var(--primary))" }}
                    />
                    {category.warna ?? "DEFAULT_CYAN"}
                  </div>
                </TableCell>
                
                <TableCell className="py-4 text-center font-orbitron text-lg font-bold text-foreground">
                  {category.article_count}
                </TableCell>
                
                <TableCell className="py-4 font-mono text-xs text-muted-foreground">
                  {formatDate(category.created_at)}
                </TableCell>
                
                <TableCell className="py-4 text-right">
                  <div className="flex justify-end gap-1.5">
                    <AdminTableActionButton 
                      label={`Edit ${category.nama}`} 
                      icon={Edit} 
                      intent="edit" 
                      href={`/admin/categories/${category.slug}/edit`} 
                    />
                    <AdminTableActionButton 
                      label={`Delete ${category.nama}`} 
                      icon={Trash2} 
                      intent="delete" 
                      onClick={() => onDelete(category)} 
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
