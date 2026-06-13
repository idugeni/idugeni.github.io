"use client";

import Link from "next/link";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { CreateProjectBodyStatus } from "@/actions/hooks/use-projects";
import { useCreateProject } from "@/actions/hooks/use-projects";
import { uploadProjectThumbnail } from "@/actions/blog-media";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import dynamic from "next/dynamic";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Calendar, FileText, ImageIcon, Save, Send, Sparkles, Target } from "@/lib/icons";
import { slugify } from "@/lib/utils/slug";

const TiptapEditor = dynamic(() => import("@/components/editor/tiptap-editor").then((mod) => mod.TiptapEditor), {
  ssr: false,
  loading: () => <div className="min-h-[320px] animate-pulse rounded-none border border-primary/30 bg-secondary/30" />,
});

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function parseDateValue(value: string) {
  if (!value) return undefined;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function formatDateValue(date: Date | undefined) {
  return date ? format(date, "yyyy-MM-dd") : "";
}

function DatePickerField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const selectedDate = parseDateValue(value);

  return (
    <div className="space-y-2">
      <Label className="font-mono text-xs text-muted-foreground">{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" className="h-10 w-full justify-start rounded-none border-primary/30 bg-secondary/50 font-mono text-xs text-foreground hover:border-primary/50 hover:bg-secondary/70">
            <Calendar className="mr-2 h-4 w-4 text-primary" />
            {selectedDate ? format(selectedDate, "dd MMM yyyy") : "Select date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto rounded-none border-primary/25 bg-card/95 p-0 shadow-[0_0_35px_hsl(var(--primary)/0.12)]">
          <CalendarPicker mode="single" selected={selectedDate} onSelect={(date) => onChange(formatDateValue(date))} captionLayout="dropdown" className="bg-transparent" />
        </PopoverContent>
      </Popover>
      <p className="font-mono text-[11px] text-muted-foreground">Stored as {value || "empty"}.</p>
    </div>
  );
}

export default function AdminProjectNew() {
  const router = useRouter();
  const createProject = useCreateProject();
  const { toast } = useToast();
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    deskripsi: "",
    thumbnailUrl: "",
    githubUrl: "",
    liveUrl: "",
    kategori: "",
    status: "ongoing" as CreateProjectBodyStatus,
    featured: false,
    urutan: 0,
    techStack: "",
    tanggalMulai: "",
    tanggalSelesai: "",
    klien: "",
    timSize: "",
    peran: "",
  });

  useEffect(() => {
    if (!thumbnailFile) {
      setThumbnailPreview("");
      return;
    }
    const url = URL.createObjectURL(thumbnailFile);
    setThumbnailPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [thumbnailFile]);

  const slugPreview = slugify(formData.nama);
  const descriptionWords = useMemo(() => stripHtml(formData.deskripsi).split(/\s+/).filter(Boolean).length, [formData.deskripsi]);
  const techCount = useMemo(() => formData.techStack.split(",").map((tech) => tech.trim()).filter(Boolean).length, [formData.techStack]);

  const handleThumbnailChange = (file: File | null) => {
    if (!file) {
      setThumbnailFile(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid thumbnail", description: "Please select an image file." });
      return;
    }
    setThumbnailFile(file);
    setFormData((current) => ({ ...current, thumbnailUrl: "" }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const slug = slugPreview;
    let finalThumbnailUrl = formData.thumbnailUrl;

    try {
      if (thumbnailFile) {
        setIsUploading(true);
        const uploadData = new FormData();
        uploadData.set("slug", slug);
        uploadData.set("file", thumbnailFile);
        finalThumbnailUrl = (await uploadProjectThumbnail(uploadData)).url;
      }

      const payload = {
        ...formData,
        thumbnailUrl: finalThumbnailUrl,
        techStack: formData.techStack.split(",").map((tech) => tech.trim()).filter(Boolean),
      };
      const created = await createProject.execute(payload);
      if (!created) {
        toast({ title: "Failed to save project", description: createProject.error?.message || "Please verify all fields." });
        return;
      }
      toast({ title: "Project created successfully" });
      router.push("/admin/projects");
    } catch (error) {
      toast({ title: "Project upload failed", description: error instanceof Error ? error.message : "Unknown error" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-1 pb-10">
      <div className="relative overflow-hidden border border-primary/20 bg-card/80 p-5 shadow-[0_0_50px_hsl(var(--primary)/0.08)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.16),transparent_35%)]" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon" className="rounded-none text-muted-foreground hover:text-primary">
              <Link href="/admin/projects" aria-label="Back to project list"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.35em] text-primary/70">PROJECT_CREATION_CONSOLE</p>
              <h1 className="font-orbitron text-2xl font-bold text-primary md:text-3xl">New Project</h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Create a complete portfolio project with content, stack, client context, thumbnail, URLs, ordering, and publishing controls.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 font-mono text-xs sm:flex">
            <span className="border border-primary/30 bg-primary/10 px-3 py-2 text-primary">STACK {techCount}</span>
            <span className="border border-border/60 px-3 py-2 text-muted-foreground">WORDS {descriptionWords}</span>
            <span className="border border-border/60 px-3 py-2 text-muted-foreground">ORDER {formData.urutan}</span>
            <span className="border border-border/60 px-3 py-2 text-muted-foreground">{formData.status.toUpperCase()}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-6">
          <Card className="rounded-none border-border/50 bg-card/90">
            <CardHeader><CardTitle className="font-orbitron text-primary"><FileText className="mr-2 inline h-5 w-5" />PROJECT_CORE</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-[1fr_0.7fr]">
                <div className="space-y-2">
                  <Label className="font-mono text-xs text-muted-foreground">PROJECT_NAME</Label>
                  <Input required value={formData.nama} onChange={(event) => setFormData({ ...formData, nama: event.target.value })} className="rounded-none border-primary/30 bg-secondary/50 font-mono" placeholder="CloudForge CLI" />
                  <p className="font-mono text-[11px] text-muted-foreground">Nama project menjadi sumber slug otomatis.</p>
                </div>
                <div className="space-y-2">
                  <Label className="font-mono text-xs text-muted-foreground">SLUG_PREVIEW</Label>
                  <Input readOnly value={slugPreview} className="rounded-none border-primary/30 bg-secondary/30 font-mono text-muted-foreground" placeholder="auto-generated-after-name" />
                  <p className="font-mono text-[11px] text-muted-foreground">URL final dibuat otomatis saat save.</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-mono text-xs text-muted-foreground">DESCRIPTION_HTML</Label>
                <TiptapEditor content={formData.deskripsi} onChange={(content) => setFormData({ ...formData, deskripsi: content })} placeholder="Describe the project architecture, goals, features, stack, impact, and implementation details..." />
                <p className="font-mono text-[11px] text-muted-foreground">Current: {descriptionWords} words. Isi detail agar halaman project kuat untuk SEO dan portfolio storytelling.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-none border-border/50 bg-card/90">
            <CardHeader><CardTitle className="font-orbitron text-primary"><Target className="mr-2 inline h-5 w-5" />PROJECT_METADATA</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label className="font-mono text-xs text-muted-foreground">CATEGORY</Label>
                  <Input value={formData.kategori} onChange={(event) => setFormData({ ...formData, kategori: event.target.value })} className="rounded-none border-primary/30 bg-secondary/50 font-mono" placeholder="CLI / Web App / SaaS" />
                </div>
                <div className="space-y-2">
                  <Label className="font-mono text-xs text-muted-foreground">TECH_STACK</Label>
                  <Input value={formData.techStack} onChange={(event) => setFormData({ ...formData, techStack: event.target.value })} className="rounded-none border-primary/30 bg-secondary/50 font-mono" placeholder="React, Next.js, Supabase" />
                  <p className="font-mono text-[11px] text-muted-foreground">Pisahkan dengan koma. Count: {techCount}</p>
                </div>
                <div className="space-y-2">
                  <Label className="font-mono text-xs text-muted-foreground">ORDER</Label>
                  <Input type="number" min={0} value={formData.urutan} onChange={(event) => setFormData({ ...formData, urutan: Number(event.target.value) || 0 })} className="rounded-none border-primary/30 bg-secondary/50 font-mono" placeholder="Display order" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="font-mono text-xs text-muted-foreground">GITHUB_URL</Label>
                  <Input value={formData.githubUrl} onChange={(event) => setFormData({ ...formData, githubUrl: event.target.value })} className="rounded-none border-primary/30 bg-secondary/50 font-mono" placeholder="https://github.com/..." />
                </div>
                <div className="space-y-2">
                  <Label className="font-mono text-xs text-muted-foreground">LIVE_URL</Label>
                  <Input value={formData.liveUrl} onChange={(event) => setFormData({ ...formData, liveUrl: event.target.value })} className="rounded-none border-primary/30 bg-secondary/50 font-mono" placeholder="https://..." />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-none border-border/50 bg-card/90">
            <CardHeader><CardTitle className="font-orbitron text-primary"><Target className="mr-2 inline h-5 w-5" />PROJECT_CONTEXT</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <DatePickerField label="START_DATE" value={formData.tanggalMulai} onChange={(value) => setFormData({ ...formData, tanggalMulai: value })} />
                <DatePickerField label="END_DATE" value={formData.tanggalSelesai} onChange={(value) => setFormData({ ...formData, tanggalSelesai: value })} />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label className="font-mono text-xs text-muted-foreground">CLIENT</Label>
                  <Input value={formData.klien} onChange={(event) => setFormData({ ...formData, klien: event.target.value })} className="rounded-none border-primary/30 bg-secondary/50 font-mono" placeholder="Internal / Client name" />
                </div>
                <div className="space-y-2">
                  <Label className="font-mono text-xs text-muted-foreground">TEAM_SIZE</Label>
                  <Input value={formData.timSize} onChange={(event) => setFormData({ ...formData, timSize: event.target.value })} className="rounded-none border-primary/30 bg-secondary/50 font-mono" placeholder="Solo / 3 Engineers" />
                </div>
                <div className="space-y-2">
                  <Label className="font-mono text-xs text-muted-foreground">ROLE</Label>
                  <Input value={formData.peran} onChange={(event) => setFormData({ ...formData, peran: event.target.value })} className="rounded-none border-primary/30 bg-secondary/50 font-mono" placeholder="Lead Developer" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="min-w-0 space-y-6 xl:sticky xl:top-24 xl:self-start">
          <Card className="rounded-none border-primary/25 bg-card/95 shadow-[0_0_40px_hsl(var(--primary)/0.08)]">
            <CardHeader><CardTitle className="font-orbitron text-primary"><Sparkles className="mr-2 inline h-5 w-5" />PUBLISHING</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <select className="h-10 rounded-none border border-primary/30 bg-secondary/50 px-3 font-mono text-xs text-foreground" value={formData.status} onChange={(event) => setFormData({ ...formData, status: event.target.value as CreateProjectBodyStatus })}>
                  <option value="ongoing">ONGOING</option>
                  <option value="completed">COMPLETED</option>
                  <option value="archived">ARCHIVED</option>
                </select>
                <Input type="number" min={0} value={formData.urutan} onChange={(event) => setFormData({ ...formData, urutan: Number(event.target.value) || 0 })} className="h-10 rounded-none border-primary/30 bg-secondary/50 font-mono text-xs" placeholder="ORDER" />
              </div>

              <div className="space-y-2">
                <Label className="font-mono text-xs text-muted-foreground">PROJECT_THUMBNAIL_DEFERRED_UPLOAD</Label>
                <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center gap-3 border border-dashed border-primary/30 bg-secondary/40 p-4 text-center transition-colors hover:border-primary/60">
                  {thumbnailPreview || formData.thumbnailUrl ? <img src={thumbnailPreview || formData.thumbnailUrl} alt="Project thumbnail preview" className="max-h-44 w-full object-cover" /> : <><ImageIcon className="h-8 w-8 text-primary" /><span className="font-mono text-xs text-muted-foreground">Select thumbnail. Uploads to media/projects/thumbnails only when saving.</span></>}
                  <input type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml" className="hidden" onChange={(event) => handleThumbnailChange(event.target.files?.[0] ?? null)} />
                </label>
                <Input value={formData.thumbnailUrl} onChange={(event) => { setThumbnailFile(null); setFormData({ ...formData, thumbnailUrl: event.target.value }); }} className="rounded-none border-primary/30 bg-secondary/50 font-mono" placeholder="Or paste existing thumbnail URL" />
                <p className="font-mono text-[11px] text-muted-foreground">Upload file baru atau paste URL manual. File baru akan mengganti URL saat save.</p>
              </div>

              <label className="flex items-center justify-between gap-4 border border-primary/25 bg-primary/5 p-4 font-mono text-sm">
                <span><span className="block text-foreground">FEATURED_PROJECT</span><span className="block text-xs text-muted-foreground">Prioritize this project in featured areas.</span></span>
                <input type="checkbox" checked={formData.featured} onChange={(event) => setFormData({ ...formData, featured: event.target.checked })} className="h-4 w-4 rounded-none border-primary bg-secondary" />
              </label>

              <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
                <span className="border border-primary/30 bg-primary/10 px-2 py-2 text-center text-primary">STACK {techCount}</span>
                <span className="border border-border/60 px-2 py-2 text-center text-muted-foreground">WORDS {descriptionWords}</span>
                <span className="border border-border/60 px-2 py-2 text-center text-muted-foreground">ORDER {formData.urutan}</span>
              </div>

              <Button type="submit" className="w-full rounded-none bg-primary font-mono text-primary-foreground hover:bg-primary/90" disabled={createProject.isLoading || isUploading}>{isUploading ? "UPLOADING_THUMBNAIL..." : createProject.isLoading ? "SAVING..." : <><Save className="mr-2 h-4 w-4" />SAVE_PROJECT</>}</Button>
              <Button asChild type="button" variant="outline" className="w-full rounded-none font-mono"><Link href="/admin/projects"><Send className="mr-2 h-4 w-4" />BACK_TO_LIST</Link></Button>
            </CardContent>
          </Card>
        </aside>
      </form>
    </div>
  );
}
