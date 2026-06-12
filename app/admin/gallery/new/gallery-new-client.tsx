"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createGalleryItem } from "@/actions/gallery";
import { uploadGalleryMedia } from "@/actions/blog-media";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, FileText, ImageIcon, Save, Send, Sparkles, Target } from "@/lib/icons";
import { slugify } from "@/lib/utils/slug";

const galleryCategoryOptions = [
  { value: "portfolio", label: "PORTFOLIO", description: "Project showcase, case study visual, atau hasil kerja utama." },
  { value: "workspace", label: "WORKSPACE", description: "Behind the scenes, setup kerja, proses produksi, atau environment." },
  { value: "ui-design", label: "UI_DESIGN", description: "Interface, mockup, visual system, atau desain produk digital." },
  { value: "development", label: "DEVELOPMENT", description: "Coding, architecture, terminal, dashboard, atau engineering process." },
  { value: "brand", label: "BRAND", description: "Visual branding, identity, campaign, atau creative asset." },
  { value: "other", label: "OTHER", description: "Media lain yang belum masuk kategori utama." },
] as const;

function formatBytes(size: number) {
  if (!size) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1);
  return `${(size / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export default function AdminGalleryNew() {
  const router = useRouter();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ judul: "", deskripsi: "", kategori: "portfolio", urutan: 0 });

  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const isVideo = file?.type.startsWith("video/") ?? false;
  const mediaKind = file ? (isVideo ? "VIDEO" : "IMAGE") : "EMPTY";
  const slugPreview = slugify(formData.judul);
  const selectedCategory = useMemo(() => galleryCategoryOptions.find((category) => category.value === formData.kategori) ?? galleryCategoryOptions[0], [formData.kategori]);

  const handleFileChange = (nextFile: File | null) => {
    if (!nextFile) {
      setFile(null);
      return;
    }
    const isSupportedImage = nextFile.type.startsWith("image/");
    const isSupportedVideo = nextFile.type === "video/mp4" || nextFile.type === "video/webm";
    if (!isSupportedImage && !isSupportedVideo) {
      toast({ title: "Unsupported media", description: "Use image files or MP4/WebM video." });
      return;
    }
    setFile(nextFile);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      toast({ title: "Media file required", description: "Select an image or video before saving." });
      return;
    }

    setIsSaving(true);
    try {
      const uploadData = new FormData();
      uploadData.set("slug", slugPreview);
      uploadData.set("kind", isVideo ? "video" : "image");
      uploadData.set("file", file);
      const uploaded = await uploadGalleryMedia(uploadData);
      await createGalleryItem({
        judul: formData.judul,
        slug: slugPreview,
        deskripsi: formData.deskripsi,
        kategori: formData.kategori,
        urutan: formData.urutan,
        tipe: isVideo ? "video" : "foto",
        fileUrl: uploaded.url,
        thumbnailUrl: isVideo ? "" : uploaded.url,
      });
      toast({ title: "Gallery media uploaded" });
      router.push("/admin/gallery");
    } catch (error) {
      toast({ title: "Gallery upload failed", description: error instanceof Error ? error.message : "Unknown error" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-1 pb-10">
      <div className="relative overflow-hidden border border-primary/20 bg-card/80 p-5 shadow-[0_0_50px_hsl(var(--primary)/0.08)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.16),transparent_35%)]" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon" className="rounded-none text-muted-foreground hover:text-primary">
              <Link href="/admin/gallery" aria-label="Back to gallery"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.35em] text-primary/70">MEDIA_BUCKET_CONSOLE</p>
              <h1 className="font-orbitron text-2xl font-bold text-primary md:text-3xl">New Gallery Media</h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Upload image or video assets with category, metadata, preview, ordering, and publishing-ready media routing.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 font-mono text-xs sm:flex">
            <span className="border border-primary/30 bg-primary/10 px-3 py-2 text-primary">{mediaKind}</span>
            <span className="border border-border/60 px-3 py-2 text-muted-foreground">{file ? formatBytes(file.size) : "NO_FILE"}</span>
            <span className="border border-border/60 px-3 py-2 text-muted-foreground">ORDER {formData.urutan}</span>
            <span className="border border-border/60 px-3 py-2 text-muted-foreground">{selectedCategory.label}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <Card className="rounded-none border-border/50 bg-card/90">
            <CardHeader><CardTitle className="font-orbitron text-primary"><FileText className="mr-2 inline h-5 w-5" />GALLERY_CORE</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-[1fr_0.7fr]">
                <div className="space-y-2">
                  <Label className="font-mono text-xs text-muted-foreground">TITLE</Label>
                  <Input required value={formData.judul} onChange={(event) => setFormData({ ...formData, judul: event.target.value })} className="rounded-none border-primary/30 bg-secondary/50 font-mono" placeholder="Premium workspace showcase" />
                  <p className="font-mono text-[11px] text-muted-foreground">Digunakan untuk judul media, alt text context, dan nama upload.</p>
                </div>
                <div className="space-y-2">
                  <Label className="font-mono text-xs text-muted-foreground">SLUG_PREVIEW</Label>
                  <Input readOnly value={slugPreview} className="rounded-none border-primary/30 bg-secondary/30 font-mono text-muted-foreground" />
                  <p className="font-mono text-[11px] text-muted-foreground">Otomatis dari title untuk path upload.</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-mono text-xs text-muted-foreground">DESCRIPTION</Label>
                <Textarea value={formData.deskripsi} onChange={(event) => setFormData({ ...formData, deskripsi: event.target.value })} className="min-h-32 rounded-none border-primary/30 bg-secondary/50 font-mono" placeholder="Describe the media context, visual subject, project relevance, or campaign purpose..." />
                <p className="font-mono text-[11px] text-muted-foreground">Optional, max 1000 characters server-side. Current: {formData.deskripsi.length}/1000.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-none border-border/50 bg-card/90">
            <CardHeader><CardTitle className="font-orbitron text-primary"><Target className="mr-2 inline h-5 w-5" />GALLERY_METADATA</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="font-mono text-xs text-muted-foreground">CATEGORY_SELECT</Label>
                  <select className="h-10 w-full rounded-none border border-primary/30 bg-secondary/50 px-3 font-mono text-xs text-foreground outline-none transition-colors hover:border-primary/50 focus:border-primary focus:bg-secondary/80" value={formData.kategori} onChange={(event) => setFormData({ ...formData, kategori: event.target.value })}>
                    {galleryCategoryOptions.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
                  </select>
                  <p className="min-h-10 text-xs leading-relaxed text-muted-foreground">{selectedCategory.description}</p>
                </div>
                <div className="space-y-2">
                  <Label className="font-mono text-xs text-muted-foreground">ORDER</Label>
                  <Input type="number" min={0} value={formData.urutan} onChange={(event) => setFormData({ ...formData, urutan: Number(event.target.value) || 0 })} className="rounded-none border-primary/30 bg-secondary/50 font-mono" />
                  <p className="font-mono text-[11px] text-muted-foreground">Urutan tampil di daftar gallery.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <Card className="rounded-none border-primary/25 bg-card/95 shadow-[0_0_40px_hsl(var(--primary)/0.08)]">
            <CardHeader><CardTitle className="font-orbitron text-primary"><Sparkles className="mr-2 inline h-5 w-5" />MEDIA_UPLOAD</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="font-mono text-xs text-muted-foreground">MEDIA_FILE_DEFERRED_UPLOAD</Label>
                <label className="flex min-h-52 cursor-pointer flex-col items-center justify-center gap-3 border border-dashed border-primary/30 bg-secondary/40 p-4 text-center transition-colors hover:border-primary/60">
                  {preview ? (isVideo ? <video src={preview} controls className="max-h-64 w-full" /> : <img src={preview} alt="Gallery preview" className="max-h-64 w-full object-contain" />) : <><ImageIcon className="h-8 w-8 text-primary" /><span className="font-mono text-xs text-muted-foreground">Select media. Uploads to media/gallery only when saving.</span></>}
                  <input type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml,video/mp4,video/webm" className="hidden" onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)} />
                </label>
                <p className="font-mono text-[11px] text-muted-foreground">Supported: JPG, PNG, GIF, WebP, SVG, MP4, WebM.</p>
              </div>

              {file && <div className="space-y-2 border border-border/60 bg-secondary/30 p-3 font-mono text-xs text-muted-foreground"><p className="text-foreground">{file.name}</p><p>{file.type || "unknown type"}</p><p>{formatBytes(file.size)}</p></div>}

              <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
                <span className="border border-primary/30 bg-primary/10 px-2 py-2 text-center text-primary">{mediaKind}</span>
                <span className="border border-border/60 px-2 py-2 text-center text-muted-foreground">ORDER {formData.urutan}</span>
                <span className="border border-border/60 px-2 py-2 text-center text-muted-foreground">{selectedCategory.label}</span>
              </div>

              <Button type="submit" className="w-full rounded-none bg-primary font-mono text-primary-foreground hover:bg-primary/90" disabled={isSaving}>{isSaving ? "UPLOADING_MEDIA..." : <><Save className="mr-2 h-4 w-4" />SAVE_MEDIA</>}</Button>
              <Button asChild type="button" variant="outline" className="w-full rounded-none font-mono"><Link href="/admin/gallery"><Send className="mr-2 h-4 w-4" />BACK_TO_LIST</Link></Button>
            </CardContent>
          </Card>
        </aside>
      </form>
    </div>
  );
}
