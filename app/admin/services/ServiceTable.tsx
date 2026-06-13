"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy, Edit, Eye } from "@/lib/icons";
import { DeleteServiceButton } from "./DeleteServiceButton";
import { AdminTableActionButton } from "@/components/admin/AdminTableActionButton";
import { StatusPill } from "@/components/admin/StatusPill";

export interface AdminService {
  id: string;
  nama: string;
  slug: string;
  deskripsi_pendek: string;
  deskripsi_panjang: string | null;
  icon: string | null;
  harga_mulai: string | null;
  fitur: string[] | null;
  urutan: number;
  aktif: boolean;
  created_at: string;
  updated_at: string;
}

interface ServiceTableProps {
  services: AdminService[];
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectOne: (id: string, checked: boolean) => void;
  onPreview: (service: AdminService) => void;
  onDuplicate: (id: string) => void;
}

export function ServiceTable({ services, selectedIds, onSelectAll, onSelectOne, onPreview, onDuplicate }: ServiceTableProps) {
  const allSelected = services.length > 0 && selectedIds.length === services.length;

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border/50 hover:bg-transparent">
            <TableHead className="w-12">
              <Checkbox checked={allSelected} onCheckedChange={onSelectAll} aria-label="Select all services" className="rounded-none" />
            </TableHead>
          <TableHead className="font-mono text-primary">SERVICE</TableHead>
          <TableHead className="font-mono text-primary">PRICE</TableHead>
          <TableHead className="font-mono text-primary">FEATURES</TableHead>
          <TableHead className="font-mono text-primary">ORDER</TableHead>
          <TableHead className="font-mono text-primary">STATUS</TableHead>
          <TableHead className="font-mono text-primary text-right">ACTIONS</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {services.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="py-8 text-center font-mono text-muted-foreground">NO_SERVICES_FOUND</TableCell>
          </TableRow>
        ) : services.map((service) => (
          <TableRow key={service.id} className="border-border/50 hover:bg-secondary/50">
            <TableCell>
              <Checkbox checked={selectedIds.includes(service.id)} onCheckedChange={(checked) => onSelectOne(service.id, checked as boolean)} aria-label={`Select ${service.nama}`} className="rounded-none" />
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                <div className="font-mono font-medium text-foreground">{service.nama}</div>
                <div className="font-mono text-xs text-muted-foreground">/{service.slug}</div>
                <p className="line-clamp-2 max-w-[200px] sm:max-w-[300px] lg:max-w-[360px] text-sm text-muted-foreground">{service.deskripsi_pendek}</p>
              </div>
            </TableCell>
            <TableCell className="font-mono text-sm text-muted-foreground">{service.harga_mulai || "-"}</TableCell>
            <TableCell className="font-mono text-sm text-muted-foreground">{service.fitur?.length ?? 0}</TableCell>
            <TableCell className="font-mono text-sm text-muted-foreground">{service.urutan}</TableCell>
            <TableCell>
              <StatusPill tone={service.aktif ? "success" : "muted"}>
                {service.aktif ? "ACTIVE" : "INACTIVE"}
              </StatusPill>
            </TableCell>
            <TableCell className="text-right">
              <AdminTableActionButton label={`Preview ${service.nama}`} icon={Eye} intent="view" onClick={() => onPreview(service)} />
              <AdminTableActionButton label={`Duplicate ${service.nama}`} icon={Copy} intent="duplicate" onClick={() => onDuplicate(service.id)} />
              <AdminTableActionButton label={`Edit ${service.nama}`} icon={Edit} intent="edit" href={`/admin/services/${service.slug}/edit`} />
              <DeleteServiceButton serviceId={service.id} serviceName={service.nama} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    </div>
  );
}
