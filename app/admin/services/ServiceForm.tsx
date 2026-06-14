"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import dynamic from "next/dynamic";
import { ArrowLeft, Save } from "@/lib/icons";
import { createService, updateService } from "@/actions/services";
import type { AdminService } from "./ServiceTable";

const TiptapEditor = dynamic(() => import("@/components/editor/tiptap-editor").then((mod) => mod.TiptapEditor), {
  ssr: false,
  loading: () => <div className="min-h-[320px] animate-pulse rounded-none border border-primary/30 bg-secondary/30" />,
});

interface ServiceFormProps {
  mode: "create" | "edit";
  service?: AdminService;
}

function featuresToText(features: string[] | null | undefined) {
  return (features ?? []).join("\n");
}

function textToFeatures(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function ServiceForm({ mode, service }: ServiceFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    nama: service?.nama ?? "",
    slug: service?.slug ?? "",
    deskripsiPendek: service?.deskripsi_pendek ?? "",
    deskripsiPanjang: service?.deskripsi_panjang ?? "",
    icon: service?.icon ?? "",
    hargaMulai: service?.harga_mulai ?? "",
    fitur: featuresToText(service?.fitur),
    urutan: service?.urutan ?? 0,
    aktif: service?.aktif ?? true,
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    const payload = {
      nama: formData.nama,
      slug: formData.slug,
      deskripsiPendek: formData.deskripsiPendek,
      deskripsiPanjang: formData.deskripsiPanjang,
      icon: formData.icon,
      hargaMulai: formData.hargaMulai,
      fitur: textToFeatures(formData.fitur),
      urutan: Number(formData.urutan) || 0,
      aktif: formData.aktif,
    };

    try {
      if (mode === "edit" && service) {
        await updateService(service.id, payload);
        toast.success("Service updated successfully");
      } else {
        await createService(payload);
        toast.success("Service created successfully");
      }
      router.push("/admin/services");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save service");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
          <Link href="/admin/services" prefetch={false}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="font-orbitron text-2xl font-bold text-primary">
          {mode === "edit" ? "Edit Service" : "New Service"}
        </h1>
      </div>

      <Card className="rounded-none border-border/50 bg-card">
        <CardHeader>
          <CardTitle className="font-orbitron">SERVICE_DATA</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="font-mono text-xs text-muted-foreground">SERVICE_NAME</Label>
                <Input
                  required
                  value={formData.nama}
                  onChange={(event) => setFormData({ ...formData, nama: event.target.value })}
                  className="rounded-none border-primary/30 bg-secondary/50 font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-mono text-xs text-muted-foreground">SLUG</Label>
                <Input
                  value={formData.slug}
                  onChange={(event) => setFormData({ ...formData, slug: event.target.value })}
                  className="rounded-none border-primary/30 bg-secondary/50 font-mono"
                  placeholder="Auto-generated when empty"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-mono text-xs text-muted-foreground">SHORT_DESCRIPTION</Label>
              <Textarea
                required
                value={formData.deskripsiPendek}
                onChange={(event) => setFormData({ ...formData, deskripsiPendek: event.target.value })}
                className="min-h-24 rounded-none border-primary/30 bg-secondary/50 font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-mono text-xs text-muted-foreground">LONG_DESCRIPTION</Label>
              <TiptapEditor
                content={formData.deskripsiPanjang}
                onChange={(content) => setFormData({ ...formData, deskripsiPanjang: content })}
                placeholder="Describe service details, deliverables, process, and terms..."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label className="font-mono text-xs text-muted-foreground">ICON_KEY</Label>
                <Input
                  value={formData.icon}
                  onChange={(event) => setFormData({ ...formData, icon: event.target.value })}
                  className="rounded-none border-primary/30 bg-secondary/50 font-mono"
                  placeholder="Code, Briefcase, Settings..."
                />
              </div>
              <div className="space-y-2">
                <Label className="font-mono text-xs text-muted-foreground">PRICE_FROM</Label>
                <Input
                  value={formData.hargaMulai}
                  onChange={(event) => setFormData({ ...formData, hargaMulai: event.target.value })}
                  className="rounded-none border-primary/30 bg-secondary/50 font-mono"
                  placeholder="Starts from ..."
                />
              </div>
              <div className="space-y-2">
                <Label className="font-mono text-xs text-muted-foreground">ORDER</Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.urutan}
                  onChange={(event) => setFormData({ ...formData, urutan: Number(event.target.value) })}
                  className="rounded-none border-primary/30 bg-secondary/50 font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-mono text-xs text-muted-foreground">FEATURES (one per line or comma-separated)</Label>
              <Textarea
                value={formData.fitur}
                onChange={(event) => setFormData({ ...formData, fitur: event.target.value })}
                className="min-h-32 rounded-none border-primary/30 bg-secondary/50 font-mono"
                placeholder="Discovery session\nUI/UX design\nDevelopment\nDeployment"
              />
            </div>

            <div className="flex items-center gap-3 rounded-none border border-border/50 bg-secondary/30 p-4">
              <Switch checked={formData.aktif} onCheckedChange={(checked) => setFormData({ ...formData, aktif: checked })} />
              <div>
                <Label className="font-mono text-sm">ACTIVE_SERVICE</Label>
                <p className="text-sm text-muted-foreground">Show this service on public service pages.</p>
              </div>
            </div>

            <Button type="submit" className="w-full rounded-none bg-primary font-mono text-primary-foreground hover:bg-primary/90" disabled={isSaving}>
              {isSaving ? "SAVING..." : <><Save className="mr-2 h-4 w-4" /> SAVE_SERVICE</>}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
