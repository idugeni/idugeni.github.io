"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy, Edit, Eye, Star, Trash2 } from "@/lib/icons";
import type { Database } from "@/lib/supabase/types";
import { AdminTableActionButton } from "@/components/admin/AdminTableActionButton";
import { StatusPill } from "@/components/admin/StatusPill";

export type AdminTestimonial = Database["public"]["Tables"]["testimonials"]["Row"];

interface Props {
  testimonials: AdminTestimonial[];
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectOne: (id: string, checked: boolean) => void;
  onPreview: (item: AdminTestimonial) => void;
  onEdit: (item: AdminTestimonial) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TestimonialTable({
  testimonials,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onPreview,
  onEdit,
  onDuplicate,
  onDelete,
}: Props) {
  const allSelected = testimonials.length > 0 && selectedIds.length === testimonials.length;

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border/50 hover:bg-transparent">
            <TableHead className="w-12">
              <Checkbox checked={allSelected} onCheckedChange={onSelectAll} aria-label="Select all testimonials" className="rounded-none" />
            </TableHead>
            <TableHead className="font-mono text-primary">CLIENT</TableHead>
            <TableHead className="font-mono text-primary">TESTIMONIAL</TableHead>
            <TableHead className="font-mono text-primary">RATING</TableHead>
            <TableHead className="font-mono text-primary">STATUS</TableHead>
            <TableHead className="font-mono text-primary text-right">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {testimonials.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center font-mono text-muted-foreground">
                NO_TESTIMONIALS_FOUND
              </TableCell>
            </TableRow>
          ) : (
            testimonials.map((item) => (
              <TableRow key={item.id} className="border-border/50 hover:bg-secondary/40">
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(item.id)}
                    onCheckedChange={(checked) => onSelectOne(item.id, Boolean(checked))}
                    aria-label={`Select ${item.nama}`}
                    className="rounded-none"
                  />
                </TableCell>
                
                <TableCell className="font-mono">
                  <div className="font-medium text-foreground">{item.nama}</div>
                  <div className="text-xs text-muted-foreground">{item.jabatan || "-"}</div>
                  <div className="text-xs text-muted-foreground">{item.perusahaan || "-"}</div>
                </TableCell>
                
                <TableCell className="max-w-[180px] sm:max-w-[300px] lg:max-w-[420px] font-mono text-xs text-muted-foreground">
                  <p className="line-clamp-3 leading-relaxed">{item.isi}</p>
                </TableCell>
                
                <TableCell className="font-mono text-amber-400">
                  <div className="flex items-center gap-1 font-semibold">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400 shrink-0" />
                    {item.rating}/5
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex flex-col gap-1.5 py-1">
                    <div className="inline-block">
                      <StatusPill tone={item.tampil ? "success" : "muted"}>
                        {item.tampil ? "VISIBLE" : "HIDDEN"}
                      </StatusPill>
                    </div>
                    <div className="inline-block">
                      <StatusPill tone={item.featured ? "primary" : "muted"}>
                        {item.featured ? "FEATURED" : "STANDARD"}
                      </StatusPill>
                    </div>
                  </div>
                </TableCell>
                
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1.5">
                    <AdminTableActionButton label={`Preview testimonial from ${item.nama}`} icon={Eye} intent="view" onClick={() => onPreview(item)} />
                    <AdminTableActionButton label={`Edit testimonial from ${item.nama}`} icon={Edit} intent="edit" onClick={() => onEdit(item)} />
                    <AdminTableActionButton label={`Duplicate testimonial from ${item.nama}`} icon={Copy} intent="duplicate" onClick={() => onDuplicate(item.id)} />
                    <AdminTableActionButton label={`Delete testimonial from ${item.nama}`} icon={Trash2} intent="delete" onClick={() => onDelete(item.id)} />
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
