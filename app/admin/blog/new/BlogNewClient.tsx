"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CreateBlogBodyStatus } from "@/actions/hooks";
import { useCreateBlogArticle, useGenerateBlogArticleWithAi, useGenerateBlogSeoPlanWithAi } from "@/actions/hooks";
import { uploadBlogThumbnail } from "@/actions/blog-media";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import dynamic from "next/dynamic";
import { ArrowLeft, Copy, FileText, ImageIcon, Save, Send, Sparkles, Target } from "@/lib/icons";
import { SeoAuditorPanel } from "@/components/admin/SeoAuditorPanel";

const TiptapEditor = dynamic(() => import("@/components/editor/tiptap-editor").then((mod) => mod.TiptapEditor), {
  ssr: false,
  loading: () => <div className="min-h-[320px] animate-pulse rounded-none border border-primary/30 bg-secondary/30" />,
});

type AiTone = "professional" | "friendly" | "technical" | "premium" | "persuasive";
type AiIntent = "informational" | "commercial" | "transactional" | "navigational";
type AiLength = "short" | "standard" | "long" | "pillar";
type BlogCategory = { id: string; nama: string; warna: string | null };

type SelectOption<T extends string> = { value: T; label: string; description: string };

const languageOptions: Array<SelectOption<"id" | "en">> = [
  { value: "id", label: "INDONESIA", description: "Artikel, metadata, CTA, dan prompt gambar dibuat dalam Bahasa Indonesia." },
  { value: "en", label: "ENGLISH", description: "Gunakan bahasa Inggris untuk target pembaca global dan SERP internasional." },
];

const lengthOptions: Array<SelectOption<AiLength>> = [
  { value: "short", label: "SHORT", description: "Ringkas ±900-1200 kata untuk topik sederhana atau update cepat." },
  { value: "standard", label: "STANDARD", description: "Default seimbang ±1400-1800 kata untuk artikel SEO reguler." },
  { value: "long", label: "LONG", description: "Pembahasan lebih dalam ±2200-2800 kata untuk keyword kompetitif." },
  { value: "pillar", label: "PILLAR", description: "Konten pilar 3000+ kata untuk topical authority dan coverage lengkap." },
];

const toneOptions: Array<SelectOption<AiTone>> = [
  { value: "premium", label: "PREMIUM", description: "Gaya elegan, high-trust, cocok untuk brand positioning IRNK Codes." },
  { value: "professional", label: "PRO", description: "Formal, jelas, dan kredibel untuk audiens bisnis atau korporat." },
  { value: "friendly", label: "FRIENDLY", description: "Lebih hangat dan mudah dipahami untuk pembaca non-teknis." },
  { value: "technical", label: "TECHNICAL", description: "Lebih detail secara teknis untuk developer, engineer, dan praktisi." },
  { value: "persuasive", label: "PERSUASIVE", description: "Lebih conversion-oriented untuk mendorong konsultasi, kontak, atau aksi." },
];

const intentOptions: Array<SelectOption<AiIntent>> = [
  { value: "informational", label: "INFO", description: "Untuk edukasi, panduan, definisi, dan menjawab pertanyaan pembaca." },
  { value: "commercial", label: "COMMERCIAL", description: "Untuk pembaca yang sedang membandingkan solusi, vendor, atau pendekatan." },
  { value: "transactional", label: "TRANSACTION", description: "Untuk niat aksi tinggi seperti membeli, konsultasi, audit, atau request layanan." },
  { value: "navigational", label: "NAVIGATE", description: "Untuk pembaca yang mencari brand, halaman, layanan, atau resource tertentu." },
];

interface BlogNewClientProps { categories: BlogCategory[] }

function slugify(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 200);
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
}

function estimateReadingTime(html: string) {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

function containsKeyword(value: string, keyword: string) {
  if (!keyword.trim()) return false;
  return value.toLowerCase().includes(keyword.trim().toLowerCase());
}

export function BlogNewClient({ categories }: BlogNewClientProps) {
  const router = useRouter();
  const createBlog = useCreateBlogArticle();
  const generateAi = useGenerateBlogArticleWithAi();
  const generateSeoPlan = useGenerateBlogSeoPlanWithAi();
  const { toast } = useToast();
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [hasGeneratedSeoPlan, setHasGeneratedSeoPlan] = useState(false);
  const [hasGeneratedArticle, setHasGeneratedArticle] = useState(false);
  const [textToImagePrompt, setTextToImagePrompt] = useState("");
  const [seoRationale, setSeoRationale] = useState<string[]>([]);
  const [suggestedTitleAngles, setSuggestedTitleAngles] = useState<string[]>([]);

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
  });
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [aiOptions, setAiOptions] = useState({
    topic: "",
    primaryKeyword: "",
    secondaryKeywords: "",
    audience: "",
    language: "id" as "id" | "en",
    tone: "premium" as AiTone,
    intent: "informational" as AiIntent,
    length: "standard" as AiLength,
    cta: "",
    includeFaq: true,
    includeOutline: true,
    includeSeoChecklist: true,
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

  const selectedCategory = categories.find((category) => category.id === formData.kategoriId);
  const selectedLanguageOption = languageOptions.find((option) => option.value === aiOptions.language) ?? languageOptions[0];
  const selectedLengthOption = lengthOptions.find((option) => option.value === aiOptions.length) ?? lengthOptions[1];
  const selectedToneOption = toneOptions.find((option) => option.value === aiOptions.tone) ?? toneOptions[0];
  const selectedIntentOption = intentOptions.find((option) => option.value === aiOptions.intent) ?? intentOptions[0];
  const contentText = stripHtml(formData.konten);
  const seoScore = useMemo(() => {
    let score = 0;
    if (formData.judul.length >= 35 && formData.judul.length <= 70) score += 12;
    if (formData.slug) score += 8;
    if (formData.ringkasan.length >= 120 && formData.ringkasan.length <= 500) score += 10;
    if (formData.metaTitle.length >= 30 && formData.metaTitle.length <= 70) score += 10;
    if (formData.metaDescription.length >= 120 && formData.metaDescription.length <= 170) score += 10;
    if (contentText.split(/\s+/).filter(Boolean).length >= 700) score += 10;
    if (hasGeneratedSeoPlan) score += 10;
    if (textToImagePrompt.length >= 120) score += 8;
    if (containsKeyword(formData.judul, aiOptions.primaryKeyword)) score += 8;
    if (containsKeyword(formData.ringkasan, aiOptions.primaryKeyword)) score += 6;
    if (containsKeyword(formData.metaDescription, aiOptions.primaryKeyword)) score += 4;
    if (containsKeyword(contentText, aiOptions.primaryKeyword)) score += 4;
    return Math.min(100, score);
  }, [aiOptions.primaryKeyword, contentText, formData, hasGeneratedSeoPlan, textToImagePrompt]);

  const articleReadyToSave = Boolean(
    hasGeneratedSeoPlan &&
    hasGeneratedArticle &&
    textToImagePrompt.trim() &&
    formData.judul.trim() &&
    formData.slug.trim() &&
    formData.ringkasan.trim() &&
    formData.konten.trim() &&
    aiOptions.primaryKeyword.trim()
  );

  const handleGenerateSeoPlan = async (refineOnly = false) => {
    if (!aiOptions.topic.trim()) {
      toast({ title: "ARTICLE_BRIEF required", description: "Isi brief artikel dulu sebelum menjalankan SEO blueprint." });
      return;
    }

    const result = await generateSeoPlan.execute({
      topic: aiOptions.topic,
      language: aiOptions.language,
      tone: aiOptions.tone,
      intent: aiOptions.intent,
      length: aiOptions.length,
      includeFaq: aiOptions.includeFaq,
      includeOutline: aiOptions.includeOutline,
      includeSeoChecklist: aiOptions.includeSeoChecklist,
    });

    if (!result) {
      toast({ title: "SEO blueprint failed", description: generateSeoPlan.error?.message || "Check Gemini configuration and try again." });
      return;
    }

    setAiOptions((current) => ({
      ...current,
      topic: result.refinedBrief,
      primaryKeyword: refineOnly ? current.primaryKeyword : result.primaryKeyword,
      secondaryKeywords: refineOnly ? current.secondaryKeywords : result.secondaryKeywords,
      audience: refineOnly ? current.audience : result.audience,
      cta: refineOnly ? current.cta : result.cta,
    }));

    if (!refineOnly) {
      setTextToImagePrompt(result.textToImagePrompt);
      setSeoRationale(result.seoRationale);
      setSuggestedTitleAngles(result.suggestedTitleAngles);
      setHasGeneratedSeoPlan(true);
      setHasGeneratedArticle(false);
    }

    toast({ title: refineOnly ? "ARTICLE_BRIEF refined" : "SEO blueprint generated", description: refineOnly ? "Brief diperjelas tanpa mengubah field SEO lain." : "Keyword, audience, CTA, dan text-to-image prompt sudah dibuat." });
  };

  const handleGenerateAi = async () => {
    if (!hasGeneratedSeoPlan) {
      toast({ title: "Generate SEO blueprint first", description: "Klik GENERATE_SEO_BLUEPRINT sebelum membuat artikel." });
      return;
    }

    const result = await generateAi.execute(aiOptions);
    if (!result) {
      toast({ title: "AI generation failed", description: generateAi.error?.message || "Check Gemini API key and try again." });
      return;
    }

    setFormData((current) => ({
      ...current,
      judul: result.title,
      slug: result.slug || slugify(result.title),
      ringkasan: result.summary,
      konten: result.contentHtml,
      tags: result.tags.join(", "),
      metaTitle: result.metaTitle,
      metaDescription: result.metaDescription,
    }));
    setIsSlugManuallyEdited(Boolean(result.slug));
    setHasGeneratedArticle(true);
    toast({ title: "SEO draft generated", description: "Review content, prompt gambar, dan SEO score sebelum save." });
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleReadyToSave) {
      toast({ title: "SEO workflow belum lengkap", description: "Buat SEO blueprint dan generate artikel dulu sebelum SAVE_TRANSMISSION." });
      return;
    }

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

      const created = await createBlog.execute({
        ...formData,
        slug: finalSlug,
        thumbnailUrl: finalThumbnailUrl,
        waktuBaca: estimateReadingTime(formData.konten),
        tags: formData.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      });
      if (!created) {
        toast({ title: "Failed to save transmission", description: createBlog.error?.message || "Please verify all required fields." });
        return;
      }
      toast({ title: "Transmission created successfully" });
      router.push("/admin/blog");
    } catch (error) {
      toast({ title: "Thumbnail/save failed", description: error instanceof Error ? error.message : "Unknown error" });
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-1 pb-10">
      <div className="relative overflow-hidden border border-primary/20 bg-card/80 p-5 shadow-[0_0_50px_hsl(var(--primary)/0.08)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.16),transparent_35%)]" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon" className="rounded-none text-muted-foreground hover:text-primary"><Link href="/admin/blog"><ArrowLeft className="h-4 w-4" /></Link></Button>
            <div><p className="font-mono text-xs uppercase tracking-[0.35em] text-primary/70">AI SEO BLUEPRINT CONSOLE</p><h1 className="font-orbitron text-2xl font-bold text-primary md:text-3xl">New SEO Transmission</h1><p className="mt-1 max-w-2xl text-sm text-muted-foreground">Start from manual ARTICLE_BRIEF, generate SEO strategy, then produce a reviewable article draft.</p></div>
          </div>
          <div className="grid grid-cols-2 gap-2 font-mono text-xs sm:flex"><span className="border border-primary/30 bg-primary/10 px-3 py-2 text-primary">SEO_SCORE {seoScore}/100</span><span className="border border-border/60 px-3 py-2 text-muted-foreground">READ {estimateReadingTime(formData.konten)} MIN</span><span className="border border-border/60 px-3 py-2 text-muted-foreground">{articleReadyToSave ? "READY" : "LOCKED"}</span></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <Card className="rounded-none border-border/50 bg-card/90"><CardHeader><CardTitle className="font-orbitron text-primary"><FileText className="mr-2 inline h-5 w-5" />ARTICLE_CORE</CardTitle></CardHeader><CardContent className="space-y-5"><div className="grid gap-4 md:grid-cols-[1fr_0.7fr]"><div className="space-y-2"><Label className="font-mono text-xs text-muted-foreground">TITLE</Label><Input required value={formData.judul} onChange={(e) => setFormData((current) => ({ ...current, judul: e.target.value, slug: isSlugManuallyEdited ? current.slug : slugify(e.target.value) }))} className="rounded-none border-primary/30 bg-secondary/50 font-mono" placeholder="Complete SEO article title" /></div><div className="space-y-2"><Label className="font-mono text-xs text-muted-foreground">SLUG</Label><Input required value={formData.slug} onChange={(e) => { setIsSlugManuallyEdited(true); setFormData((current) => ({ ...current, slug: slugify(e.target.value) })); }} className="rounded-none border-primary/30 bg-secondary/50 font-mono" placeholder="seo-friendly-slug" /></div></div><div className="space-y-2"><Label className="font-mono text-xs text-muted-foreground">SUMMARY / EXCERPT</Label><Textarea required value={formData.ringkasan} onChange={(e) => setFormData({ ...formData, ringkasan: e.target.value })} className="min-h-[100px] rounded-none border-primary/30 bg-secondary/50 font-mono" placeholder="Compelling 120-160+ character summary for readers and listings." /></div><div className="space-y-2"><Label className="font-mono text-xs text-muted-foreground">CONTENT_HTML</Label><TiptapEditor content={formData.konten} onChange={(html) => { setFormData({ ...formData, konten: html }); if (hasGeneratedArticle) setHasGeneratedArticle(true); }} placeholder="Generate your SEO article content after SEO blueprint..." /></div></CardContent></Card>

          <Card className="rounded-none border-border/50 bg-card/90"><CardHeader><CardTitle className="font-orbitron text-primary"><Target className="mr-2 inline h-5 w-5" />SEO_METADATA</CardTitle></CardHeader><CardContent className="space-y-5"><div className="grid gap-4 md:grid-cols-2"><div className="space-y-2"><Label className="font-mono text-xs text-muted-foreground">META_TITLE</Label><Input value={formData.metaTitle} onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })} className="rounded-none border-primary/30 bg-secondary/50 font-mono" /></div><div className="space-y-2"><Label className="font-mono text-xs text-muted-foreground">TAGS</Label><Input value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} className="rounded-none border-primary/30 bg-secondary/50 font-mono" placeholder="seo, nextjs, ai" /></div></div><div className="space-y-2"><Label className="font-mono text-xs text-muted-foreground">META_DESCRIPTION</Label><Textarea value={formData.metaDescription} onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })} className="min-h-[90px] rounded-none border-primary/30 bg-secondary/50 font-mono" /></div></CardContent></Card>

          <SeoAuditorPanel
            title={formData.judul}
            summary={formData.ringkasan}
            content={formData.konten}
            onApplyMetaDescription={(desc) => setFormData((curr) => ({ ...curr, metaDescription: desc }))}
            onApplyTags={(tags) => setFormData((curr) => ({ ...curr, tags }))}
          />
        </div>

        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <Card className="rounded-none border-primary/25 bg-card/95 shadow-[0_0_40px_hsl(var(--primary)/0.08)]"><CardHeader><CardTitle className="font-orbitron text-primary"><Sparkles className="mr-2 inline h-5 w-5" />SEO_BLUEPRINT</CardTitle></CardHeader><CardContent className="space-y-4"><div className="space-y-2"><div className="flex items-center justify-between gap-3"><Label className="font-mono text-xs text-muted-foreground">ARTICLE_BRIEF</Label><Button type="button" size="sm" variant="outline" onClick={() => handleGenerateSeoPlan(true)} disabled={generateSeoPlan.isLoading || !aiOptions.topic.trim()} className="h-7 rounded-none px-2 font-mono text-[10px]">REFINE_BRIEF</Button></div><Textarea value={aiOptions.topic} onChange={(e) => { setAiOptions({ ...aiOptions, topic: e.target.value }); setHasGeneratedSeoPlan(false); setHasGeneratedArticle(false); }} className="min-h-[140px] rounded-none border-primary/30 bg-secondary/50 font-mono" placeholder="Tulis brief artikel secara manual: topik, sudut pandang, target pembaca, masalah utama, dan tujuan bisnis..." /></div><div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><label className="space-y-2 border border-primary/20 bg-secondary/30 p-3 transition-colors hover:border-primary/50"><span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">LANGUAGE</span><select className="h-10 w-full rounded-none border border-primary/30 bg-secondary/60 px-3 font-mono text-xs text-foreground shadow-[inset_0_0_18px_hsl(var(--primary)/0.04)] outline-none transition-colors hover:border-primary/50 focus:border-primary focus:bg-secondary/80" value={aiOptions.language} onChange={(e) => setAiOptions({ ...aiOptions, language: e.target.value as "id" | "en" })}>{languageOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select><p className="min-h-[48px] text-xs leading-relaxed text-muted-foreground">{selectedLanguageOption.description}</p></label><label className="space-y-2 border border-primary/20 bg-secondary/30 p-3 transition-colors hover:border-primary/50"><span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">LENGTH</span><select className="h-10 w-full rounded-none border border-primary/30 bg-secondary/60 px-3 font-mono text-xs text-foreground shadow-[inset_0_0_18px_hsl(var(--primary)/0.04)] outline-none transition-colors hover:border-primary/50 focus:border-primary focus:bg-secondary/80" value={aiOptions.length} onChange={(e) => setAiOptions({ ...aiOptions, length: e.target.value as AiLength })}>{lengthOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select><p className="min-h-[48px] text-xs leading-relaxed text-muted-foreground">{selectedLengthOption.description}</p></label><label className="space-y-2 border border-primary/20 bg-secondary/30 p-3 transition-colors hover:border-primary/50"><span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">TONE</span><select className="h-10 w-full rounded-none border border-primary/30 bg-secondary/60 px-3 font-mono text-xs text-foreground shadow-[inset_0_0_18px_hsl(var(--primary)/0.04)] outline-none transition-colors hover:border-primary/50 focus:border-primary focus:bg-secondary/80" value={aiOptions.tone} onChange={(e) => setAiOptions({ ...aiOptions, tone: e.target.value as AiTone })}>{toneOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select><p className="min-h-[48px] text-xs leading-relaxed text-muted-foreground">{selectedToneOption.description}</p></label><label className="space-y-2 border border-primary/20 bg-secondary/30 p-3 transition-colors hover:border-primary/50"><span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">INTENT</span><select className="h-10 w-full rounded-none border border-primary/30 bg-secondary/60 px-3 font-mono text-xs text-foreground shadow-[inset_0_0_18px_hsl(var(--primary)/0.04)] outline-none transition-colors hover:border-primary/50 focus:border-primary focus:bg-secondary/80" value={aiOptions.intent} onChange={(e) => setAiOptions({ ...aiOptions, intent: e.target.value as AiIntent })}>{intentOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select><p className="min-h-[48px] text-xs leading-relaxed text-muted-foreground">{selectedIntentOption.description}</p></label></div><div className="grid gap-2 font-mono text-xs text-muted-foreground">{(["includeFaq", "includeOutline", "includeSeoChecklist"] as const).map((key) => <label key={key} className="flex items-center gap-2"><input type="checkbox" checked={aiOptions[key]} onChange={(e) => setAiOptions({ ...aiOptions, [key]: e.target.checked })} />{key.toUpperCase()}</label>)}</div><Button type="button" onClick={() => handleGenerateSeoPlan(false)} disabled={generateSeoPlan.isLoading || !aiOptions.topic.trim()} className="w-full rounded-none bg-primary font-mono text-primary-foreground hover:bg-primary/90">{generateSeoPlan.isLoading ? "BUILDING_BLUEPRINT..." : <><Target className="mr-2 h-4 w-4" />GENERATE_SEO_BLUEPRINT</>}</Button><div className="space-y-2"><Label className="font-mono text-xs text-muted-foreground">PRIMARY_KEYWORD</Label><Input value={aiOptions.primaryKeyword} onChange={(e) => setAiOptions({ ...aiOptions, primaryKeyword: e.target.value })} className="rounded-none border-primary/30 bg-secondary/50 font-mono" /></div><div className="space-y-2"><Label className="font-mono text-xs text-muted-foreground">SECONDARY_KEYWORDS</Label><Textarea value={aiOptions.secondaryKeywords} onChange={(e) => setAiOptions({ ...aiOptions, secondaryKeywords: e.target.value })} className="min-h-[70px] rounded-none border-primary/30 bg-secondary/50 font-mono" /></div><div className="space-y-2"><Label className="font-mono text-xs text-muted-foreground">AUDIENCE</Label><Input value={aiOptions.audience} onChange={(e) => setAiOptions({ ...aiOptions, audience: e.target.value })} className="rounded-none border-primary/30 bg-secondary/50 font-mono" /></div><div className="space-y-2"><Label className="font-mono text-xs text-muted-foreground">CTA_GOAL</Label><Input value={aiOptions.cta} onChange={(e) => setAiOptions({ ...aiOptions, cta: e.target.value })} className="rounded-none border-primary/30 bg-secondary/50 font-mono" /></div><div className="space-y-2"><div className="flex items-center justify-between gap-3"><Label className="font-mono text-xs text-muted-foreground">TEXT_TO_IMAGE_PROMPT</Label><div className="flex gap-1.5"><Button type="button" size="sm" variant="ghost" className="h-7 rounded-none px-2 text-primary font-mono text-[10px]" onClick={() => window.open(`https://leonardo.ai/`, "_blank")} disabled={!textToImagePrompt}>LEONARDO</Button><Button type="button" size="sm" variant="ghost" className="h-7 rounded-none px-2 text-primary font-mono text-[10px]" onClick={() => window.open(`https://lexica.art/?q=${encodeURIComponent(aiOptions.primaryKeyword)}`, "_blank")} disabled={!textToImagePrompt}>LEXICA</Button><Button type="button" size="sm" variant="ghost" className="h-7 rounded-none px-2" onClick={() => navigator.clipboard.writeText(textToImagePrompt)} disabled={!textToImagePrompt}><Copy className="h-3.5 w-3.5" /></Button></div></div><Textarea value={textToImagePrompt} onChange={(e) => setTextToImagePrompt(e.target.value)} className="min-h-[120px] rounded-none border-primary/30 bg-secondary/50 font-mono text-xs" placeholder="Generated after SEO blueprint..." /></div>{seoRationale.length > 0 && <div className="border border-primary/20 bg-primary/5 p-3"><p className="mb-2 font-mono text-xs text-primary">SEO_RATIONALE</p><ul className="space-y-1 text-xs text-muted-foreground">{seoRationale.map((item) => <li key={item}>• {item}</li>)}</ul></div>}{suggestedTitleAngles.length > 0 && <div className="border border-border/50 p-3"><p className="mb-2 font-mono text-xs text-muted-foreground">TITLE_ANGLES</p><div className="space-y-1 text-xs text-muted-foreground">{suggestedTitleAngles.map((item) => <p key={item}>→ {item}</p>)}</div></div>}<Button type="button" onClick={handleGenerateAi} disabled={generateAi.isLoading || !hasGeneratedSeoPlan || !aiOptions.primaryKeyword} className="w-full rounded-none font-mono">{generateAi.isLoading ? "GENERATING_ARTICLE..." : <><Sparkles className="mr-2 h-4 w-4" />GENERATE_SEO_ARTICLE</>}</Button><p className="text-xs leading-relaxed text-muted-foreground">Flow: brief manual → SEO blueprint → artikel → save. Ini menjaga SEO tetap nomor 1.</p></CardContent></Card>

          <Card className="rounded-none border-border/50 bg-card/90"><CardHeader><CardTitle className="font-orbitron text-primary">PUBLISHING</CardTitle></CardHeader><CardContent className="space-y-4"><div className="grid grid-cols-2 gap-3"><select className="h-10 rounded-none border border-primary/30 bg-secondary/50 px-3 font-mono text-xs" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as CreateBlogBodyStatus })}><option value="draft">DRAFT</option><option value="published">PUBLISHED</option></select><select className="h-10 rounded-none border border-primary/30 bg-secondary/50 px-3 font-mono text-xs" value={formData.kategoriId} onChange={(e) => setFormData({ ...formData, kategoriId: e.target.value })}><option value="">SELECT_CATEGORY</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.nama}</option>)}</select></div>{selectedCategory && <div className="inline-flex items-center gap-2 border border-border/50 px-2 py-1 font-mono text-xs"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: selectedCategory.warna || "hsl(var(--primary))" }} />{selectedCategory.nama}</div>}<div className="space-y-2"><Label className="font-mono text-xs text-muted-foreground">THUMBNAIL_FILE_DEFERRED_UPLOAD</Label><label className="flex min-h-40 cursor-pointer flex-col items-center justify-center gap-3 border border-dashed border-primary/30 bg-secondary/40 p-4 text-center transition-colors hover:border-primary/60">{thumbnailPreview || formData.thumbnailUrl ? <img src={thumbnailPreview || formData.thumbnailUrl} alt="Thumbnail preview" className="max-h-44 w-full object-cover" /> : <><ImageIcon className="h-8 w-8 text-primary" /><span className="font-mono text-xs text-muted-foreground">Select thumbnail. It uploads only when saving.</span></>}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(e) => handleThumbnailChange(e.target.files?.[0] ?? null)} /></label><Input value={formData.thumbnailUrl} onChange={(e) => { setThumbnailFile(null); setFormData({ ...formData, thumbnailUrl: e.target.value }); }} className="rounded-none border-primary/30 bg-secondary/50 font-mono" placeholder="Or paste existing thumbnail URL" /></div><label className="flex items-center gap-2 font-mono text-sm"><input type="checkbox" checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} /> FEATURED_TRANSMISSION</label><Button type="submit" className="w-full rounded-none bg-primary font-mono text-primary-foreground hover:bg-primary/90 disabled:opacity-40" disabled={createBlog.isLoading || isUploadingThumbnail || !articleReadyToSave}>{isUploadingThumbnail ? "UPLOADING_THUMBNAIL..." : createBlog.isLoading ? "SAVING..." : <><Save className="mr-2 h-4 w-4" />SAVE_TRANSMISSION</>}</Button>{!articleReadyToSave && <p className="text-xs leading-relaxed text-muted-foreground">SAVE terkunci sampai SEO blueprint, prompt gambar, dan draft artikel selesai.</p>}<Button asChild type="button" variant="outline" className="w-full rounded-none font-mono"><Link href="/admin/blog"><Send className="mr-2 h-4 w-4" />BACK_TO_LIST</Link></Button></CardContent></Card>
        </aside>
      </form>
    </div>
  );
}
