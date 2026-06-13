"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { CreateBlogBodyStatus } from "@/actions/hooks/use-blog";
import { useGetBlogArticle, useGetBlogCategories, useUpdateBlogArticle } from "@/actions/hooks/use-blog";
import { uploadBlogThumbnail } from "@/actions/blog-media";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import dynamicImport from "next/dynamic";
import { ArrowLeft, FileText, ImageIcon, Save, Send, Sparkles, Target } from "@/lib/icons";
import { SeoAuditorPanel } from "@/components/admin/SeoAuditorPanel";
import { slugify } from "@/lib/utils/slug";

const TiptapEditor = dynamicImport(() => import("@/components/editor/tiptap-editor").then((mod) => mod.TiptapEditor), {
  ssr: false,
  loading: () => <div className="min-h-[320px] animate-pulse rounded-none border border-primary/30 bg-secondary/30" />,
});

type BlogCategory = { id: string; nama: string; warna: string | null };

type AdminBlogEditClientProps = {
  slug: string;
};

function estimateReadingTime(html: string) {
  const words = html.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

function parseViews(value: string) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.min(parsed, 999_999_999);
}

export function AdminBlogEditClient({ slug }: AdminBlogEditClientProps) {
  const router = useRouter();

  const { data: article, isLoading } = useGetBlogArticle(slug);
  const { data: categories } = useGetBlogCategories();
  const updateBlog = useUpdateBlogArticle();
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);

  const [formData, setFormData] = useState({
    judul: "",
    slug: "",
    ringkasan: "",
    konten: "",
    thumbnailUrl: "",
    kategoriId: "",
    status: "draft" as CreateBlogBodyStatus,
    featured: false,
    tags: "",
    metaTitle: "",
    metaDescription: "",
    jumlahView: 0,
  });
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const initializedForId = useRef<string | null>(null);

  useEffect(() => {
    if (!thumbnailFile) {
      setThumbnailPreview("");
      return;
    }
    const url = URL.createObjectURL(thumbnailFile);
    setThumbnailPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [thumbnailFile]);

  useEffect(() => {
    if (article && initializedForId.current !== article.id) {
      initializedForId.current = article.id;
      setIsSlugManuallyEdited(Boolean(article.slug));
      setThumbnailFile(null);
      setFormData({
        judul: article.judul || "",
        slug: article.slug || "",
        ringkasan: article.ringkasan || "",
        konten: article.konten || "",
        thumbnailUrl: article.thumbnailUrl || "",
        kategoriId: article.kategoriId || "",
        status: (article.status as CreateBlogBodyStatus) || "draft",
        featured: article.featured || false,
        tags: article.tags?.join(", ") || "",
        metaTitle: article.metaTitle || "",
        metaDescription: article.metaDescription || "",
        jumlahView: Number(article.jumlahView ?? 0),
      });
    }
  }, [article]);

  const categoryOptions = (categories ?? []) as BlogCategory[];
  const selectedCategory = categoryOptions.find((category) => category.id === formData.kategoriId);
  const readingTime = useMemo(() => estimateReadingTime(formData.konten), [formData.konten]);
  const seoScore = useMemo(() => {
    let score = 0;
    if (formData.judul.length >= 35 && formData.judul.length <= 70) score += 20;
    if (formData.slug) score += 10;
    if (formData.ringkasan.length >= 120 && formData.ringkasan.length <= 500) score += 20;
    if (formData.metaTitle.length >= 30 && formData.metaTitle.length <= 70) score += 15;
    if (formData.metaDescription.length >= 120 && formData.metaDescription.length <= 170) score += 20;
    if (formData.konten.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length >= 700) score += 15;
    return score;
  }, [formData]);

  const handleThumbnailChange = (file: File | null) => {
    if (!file) {
      setThumbnailFile(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    setThumbnailFile(file);
    setFormData((current) => ({ ...current, thumbnailUrl: "" }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!article) return;

    const finalSlug = formData.slug || slugify(formData.judul);
    let finalThumbnailUrl = formData.thumbnailUrl;

    try {
      if (thumbnailFile) {
        setIsUploadingThumbnail(true);
        const uploadFormData = new FormData();
        uploadFormData.set("slug", finalSlug);
        uploadFormData.set("file", thumbnailFile);
        const uploaded = await uploadBlogThumbnail(uploadFormData);
        finalThumbnailUrl = uploaded.url;
      }

      const updated = await updateBlog.execute(article.slug, {
        ...formData,
        slug: finalSlug,
        thumbnailUrl: finalThumbnailUrl,
        jumlahView: formData.jumlahView,
        waktuBaca: readingTime,
        tags: formData.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      });

      if (!updated) {
        toast.error("Failed to update transmission", { description: updateBlog.error?.message || "Please verify all required fields." });
        return;
      }

      toast.success("Transmission updated successfully");
      router.push("/admin/blog");
    } catch (error) {
      toast.error("Thumbnail/update failed", { description: error instanceof Error ? error.message : "Unknown error" });
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  if (isLoading) return <div className="p-8 font-mono animate-pulse">DECRYPTING_DATA...</div>;

  if (!article) {
    return <div className="mx-auto w-full max-w-3xl border border-border/50 bg-card/80 p-6 text-center"><p className="font-mono text-sm text-muted-foreground">TRANSMISSION_NOT_FOUND</p><Button asChild variant="outline" className="mt-4 rounded-none font-mono"><Link href="/admin/blog">BACK_TO_LIST</Link></Button></div>;
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-1 pb-10">
      <div className="relative overflow-hidden border border-primary/20 bg-card/80 p-5 shadow-[0_0_50px_hsl(var(--primary)/0.08)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.16),transparent_35%)]" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4"><Button asChild variant="ghost" size="icon" className="rounded-none text-muted-foreground hover:text-primary"><Link href="/admin/blog" aria-label="Back to blog list"><ArrowLeft className="h-4 w-4" /></Link></Button><div><p className="font-mono text-xs uppercase tracking-display text-primary/70">EDITORIAL_REVISION_CONSOLE</p><h1 className="font-orbitron text-2xl font-bold text-primary md:text-3xl">Edit Transmission</h1><p className="mt-1 max-w-2xl text-sm text-muted-foreground">Update article content, SEO metadata, thumbnail, views, publishing state, and category signal.</p></div></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex gap-2 font-mono text-xs"><span className="border border-primary/30 bg-primary/10 px-3 py-2 text-primary">SEO_SCORE {seoScore}/100</span><span className="border border-border/60 px-3 py-2 text-muted-foreground">READ {readingTime} MIN</span><span className="border border-border/60 px-3 py-2 text-muted-foreground">VIEWS {formData.jumlahView}</span><span className="border border-border/60 px-3 py-2 text-muted-foreground">{formData.status.toUpperCase()}</span></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-6">
          <Card className="rounded-none border-border/50 bg-card/90"><CardHeader><CardTitle className="font-orbitron text-primary"><FileText className="mr-2 inline h-5 w-5" />ARTICLE_CORE</CardTitle></CardHeader><CardContent className="space-y-5"><div className="grid gap-4 md:grid-cols-[1fr_0.7fr]"><div className="space-y-2"><Label className="font-mono text-xs text-muted-foreground">TITLE</Label><Input required value={formData.judul} onChange={(event) => setFormData((current) => ({ ...current, judul: event.target.value, slug: isSlugManuallyEdited ? current.slug : slugify(event.target.value) }))} className="rounded-none border-primary/30 bg-secondary/50 font-mono" placeholder="Complete SEO article title" /><p className="font-mono text-[11px] text-muted-foreground">Recommended 35-70 characters. Current: {formData.judul.length}</p></div><div className="space-y-2"><Label className="font-mono text-xs text-muted-foreground">SLUG</Label><Input required value={formData.slug} onChange={(event) => { setIsSlugManuallyEdited(true); setFormData((current) => ({ ...current, slug: slugify(event.target.value) })); }} className="rounded-none border-primary/30 bg-secondary/50 font-mono" placeholder="seo-friendly-slug" /><p className="font-mono text-[11px] text-muted-foreground">Changing slug updates the public URL after save.</p></div></div><div className="space-y-2"><Label className="font-mono text-xs text-muted-foreground">SUMMARY / EXCERPT</Label><Textarea required value={formData.ringkasan} onChange={(event) => setFormData({ ...formData, ringkasan: event.target.value })} className="min-h-[110px] rounded-none border-primary/30 bg-secondary/50 font-mono" placeholder="Compelling 120-160+ character summary for readers and listings." /><p className="font-mono text-[11px] text-muted-foreground">Current: {formData.ringkasan.length}/500 characters.</p></div><div className="space-y-2"><Label className="font-mono text-xs text-muted-foreground">CONTENT_HTML</Label><TiptapEditor content={formData.konten} onChange={(html) => setFormData({ ...formData, konten: html })} placeholder="Write or revise your transmission content..." /></div></CardContent></Card>

          <Card className="rounded-none border-border/50 bg-card/90"><CardHeader><CardTitle className="font-orbitron text-primary"><Target className="mr-2 inline h-5 w-5" />SEO_METADATA</CardTitle></CardHeader><CardContent className="space-y-5"><div className="grid gap-4 md:grid-cols-2"><div className="space-y-2"><Label className="font-mono text-xs text-muted-foreground">META_TITLE</Label><Input value={formData.metaTitle} onChange={(event) => setFormData({ ...formData, metaTitle: event.target.value })} className="rounded-none border-primary/30 bg-secondary/50 font-mono" placeholder="Search result title override" /><p className="font-mono text-[11px] text-muted-foreground">Recommended 30-70 characters. Current: {formData.metaTitle.length}</p></div><div className="space-y-2"><Label className="font-mono text-xs text-muted-foreground">TAGS</Label><Input value={formData.tags} onChange={(event) => setFormData({ ...formData, tags: event.target.value })} className="rounded-none border-primary/30 bg-secondary/50 font-mono" placeholder="seo, nextjs, ai" /><p className="font-mono text-[11px] text-muted-foreground">Comma separated. Max 12 tags server-side.</p></div></div><div className="space-y-2"><Label className="font-mono text-xs text-muted-foreground">META_DESCRIPTION</Label><Textarea value={formData.metaDescription} onChange={(event) => setFormData({ ...formData, metaDescription: event.target.value })} className="min-h-[100px] rounded-none border-primary/30 bg-secondary/50 font-mono" placeholder="Compelling description for search snippets." /><p className="font-mono text-[11px] text-muted-foreground">Recommended 120-170 characters. Current: {formData.metaDescription.length}/500</p></div></CardContent></Card>

          <SeoAuditorPanel
            title={formData.judul}
            summary={formData.ringkasan}
            content={formData.konten}
            onApplyMetaDescription={(desc) => setFormData((curr) => ({ ...curr, metaDescription: desc }))}
            onApplyTags={(tags) => setFormData((curr) => ({ ...curr, tags }))}
          />
        </div>

        <aside className="min-w-0 space-y-6 xl:sticky xl:top-24 xl:self-start">
          <Card className="rounded-none border-primary/25 bg-card/95 shadow-[0_0_40px_hsl(var(--primary)/0.08)]"><CardHeader><CardTitle className="font-orbitron text-primary"><Sparkles className="mr-2 inline h-5 w-5" />PUBLISHING</CardTitle></CardHeader><CardContent className="space-y-4"><div className="grid grid-cols-2 gap-3"><select className="h-10 rounded-none border border-primary/30 bg-secondary/50 px-3 font-mono text-xs text-foreground" value={formData.status} onChange={(event) => setFormData({ ...formData, status: event.target.value as CreateBlogBodyStatus })}><option value="draft">DRAFT</option><option value="published">PUBLISHED</option></select><select className="h-10 rounded-none border border-primary/30 bg-secondary/50 px-3 font-mono text-xs text-foreground" value={formData.kategoriId} onChange={(event) => setFormData({ ...formData, kategoriId: event.target.value })}><option value="">SELECT_CATEGORY</option>{categoryOptions.map((category) => <option key={category.id} value={category.id}>{category.nama}</option>)}</select></div>{selectedCategory && <div className="inline-flex items-center gap-2 border border-border/50 px-2 py-1 font-mono text-xs text-muted-foreground"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: selectedCategory.warna || "hsl(var(--primary))" }} />{selectedCategory.nama}</div>}

          <div className="space-y-2"><Label className="font-mono text-xs text-muted-foreground">THUMBNAIL_REPLACE_DEFERRED_UPLOAD</Label><label className="flex min-h-40 cursor-pointer flex-col items-center justify-center gap-3 border border-dashed border-primary/30 bg-secondary/40 p-4 text-center transition-colors hover:border-primary/60">{thumbnailPreview || formData.thumbnailUrl ? <img src={thumbnailPreview || formData.thumbnailUrl} alt="Thumbnail preview" className="max-h-44 w-full object-cover" /> : <><ImageIcon className="h-8 w-8 text-primary" /><span className="font-mono text-xs text-muted-foreground">Select replacement thumbnail. It uploads only when saving.</span></>}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" className="hidden" onChange={(event) => handleThumbnailChange(event.target.files?.[0] ?? null)} /></label><Input value={formData.thumbnailUrl} onChange={(event) => { setThumbnailFile(null); setFormData({ ...formData, thumbnailUrl: event.target.value }); }} className="rounded-none border-primary/30 bg-secondary/50 font-mono" placeholder="Or paste existing thumbnail URL" /><p className="font-mono text-[11px] text-muted-foreground">Upload file baru atau paste URL manual. File baru akan mengganti URL saat save.</p></div>

          <div className="space-y-2"><Label className="font-mono text-xs text-muted-foreground">VIEWS_OVERRIDE</Label><Input type="number" min={0} max={999999999} value={formData.jumlahView} onChange={(event) => setFormData({ ...formData, jumlahView: parseViews(event.target.value) })} className="rounded-none border-primary/30 bg-secondary/50 font-mono" /><p className="font-mono text-[11px] text-muted-foreground">Mengubah counter artikel `jumlah_view`, bukan tabel analytics page_views.</p></div>

          <label className="flex items-center justify-between gap-4 border border-primary/25 bg-primary/5 p-4 font-mono text-sm"><span><span className="block text-foreground">FEATURED_TRANSMISSION</span><span className="block text-xs text-muted-foreground">Prioritize this article in featured areas.</span></span><input type="checkbox" checked={formData.featured} onChange={(event) => setFormData({ ...formData, featured: event.target.checked })} className="h-4 w-4 rounded-none border-primary bg-secondary" /></label><div className="grid grid-cols-3 gap-2 font-mono text-[11px]"><span className="border border-border/60 px-2 py-2 text-center text-muted-foreground">READ {readingTime} MIN</span><span className="border border-primary/30 bg-primary/10 px-2 py-2 text-center text-primary">SEO {seoScore}/100</span><span className="border border-border/60 px-2 py-2 text-center text-muted-foreground">VIEWS {formData.jumlahView}</span></div><Button type="submit" className="w-full rounded-none bg-primary font-mono text-primary-foreground hover:bg-primary/90" disabled={updateBlog.isLoading || isUploadingThumbnail}>{isUploadingThumbnail ? "UPLOADING_THUMBNAIL..." : updateBlog.isLoading ? "SAVING..." : <><Save className="mr-2 h-4 w-4" />UPDATE_TRANSMISSION</>}</Button><Button asChild type="button" variant="outline" className="w-full rounded-none font-mono"><Link href="/admin/blog"><Send className="mr-2 h-4 w-4" />BACK_TO_LIST</Link></Button></CardContent></Card>
        </aside>
      </form>
    </div>
  );
}
