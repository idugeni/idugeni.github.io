"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Sparkles, Loader2Icon as Loader2, Check, AlertTriangle } from "@/lib/icons";
import { auditExistingArticleWithAi } from "@/actions/blog-ai";

interface SeoAuditorPanelProps {
  title: string;
  summary: string;
  content: string;
  onApplyMetaDescription?: (desc: string) => void;
  onApplyTags?: (tags: string) => void;
}

function stripHtml(html: string) {
  if (typeof window === "undefined") return html.replace(/<[^>]*>/g, " ");
  const doc = new Parser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}

// Simple fallback parser for server-side or immediate render
class Parser {
  parseFromString(html: string, _mime: string) {
    if (typeof document === "undefined") {
      return { body: { textContent: html.replace(/<[^>]*>/g, " ") } };
    }
    const el = document.createElement("div");
    el.innerHTML = html;
    return { body: { textContent: el.textContent || el.innerText } };
  }
}

export function SeoAuditorPanel({
  title,
  summary,
  content,
  onApplyMetaDescription,
  onApplyTags,
}: SeoAuditorPanelProps) {
  const [primaryKeyword, setPrimaryKeyword] = useState("");
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<{
    seoScoreFeedback: string;
    suggestedImprovements: string[];
    optimizedMetaDescription: string;
    suggestedTags?: string[];
  } | null>(null);

  const cleanContent = useMemo(() => stripHtml(content), [content]);
  const wordCount = useMemo(() => cleanContent.split(/\s+/).filter(Boolean).length, [cleanContent]);

  // Keyword density calculations
  const density = useMemo(() => {
    if (!primaryKeyword.trim() || cleanContent.length === 0) return { count: 0, percent: 0 };
    const escaped = primaryKeyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "gi");
    const matches = cleanContent.match(regex);
    const count = matches ? matches.length : 0;
    const percent = wordCount > 0 ? (count / wordCount) * 100 : 0;
    return { count, percent: Number(percent.toFixed(2)) };
  }, [primaryKeyword, cleanContent, wordCount]);

  const localSeoScore = useMemo(() => {
    let score = 0;
    if (title.length >= 35 && title.length <= 70) score += 20;
    if (summary.length >= 120 && summary.length <= 250) score += 20;
    if (wordCount >= 700) score += 20;
    
    // Density score
    if (density.percent >= 0.5 && density.percent <= 2.5) score += 20;
    
    // Keyword in title
    if (primaryKeyword && title.toLowerCase().includes(primaryKeyword.toLowerCase())) score += 20;
    
    return score;
  }, [title, summary, wordCount, density, primaryKeyword]);

  const handleAudit = async () => {
    if (!title || content.length < 100) {
      toast.error("Audit failed: Article must have a title and at least 100 characters of content.");
      return;
    }
    if (primaryKeyword.trim().length < 2) {
      toast.error("Audit failed: Target SEO keyword must be at least 2 characters.");
      return;
    }

    setIsAuditing(true);
    try {
      const result = await auditExistingArticleWithAi({
        currentTitle: title,
        currentContentHtml: content,
        primaryKeyword: primaryKeyword.trim(),
      });
      
      // Inject auto tag suggestions into result based on content matching or AI feedback
      const suggestedTags = Array.from(
        new Set(
          [
            primaryKeyword.toLowerCase(),
            ...(title.toLowerCase().match(/\b(next\.js|supabase|react|tailwind|css|html|js|ts|node|postgresql|auth|api|seo|ai|security)\b/gi) || [])
          ]
        )
      ).slice(0, 5);

      setAuditResult({
        ...result,
        suggestedTags,
      });

      toast.success("AI Content Audit Complete! Checklist generated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "AI Audit failed.");
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <Card className="relative overflow-hidden rounded-none border border-primary/25 bg-card/90 shadow-[0_0_35px_hsl(var(--primary)/0.04)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.06),transparent_40%)] pointer-events-none" />
      <CardHeader className="relative border-b border-border/40 pb-4">
        <CardTitle className="flex items-center font-orbitron text-primary text-base">
          <Sparkles className="mr-2 h-4 w-4 animate-pulse text-primary" />
          AI_SEO_INTELLIGENCE
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative space-y-6 pt-5">
        <div className="grid gap-4 md:grid-cols-[1fr_180px]">
          <div className="space-y-2">
            <Label htmlFor="target-keyword" className="font-mono text-xs text-muted-foreground uppercase tracking-wider">TARGET_SEO_KEYWORD</Label>
            <div className="flex gap-2">
              <Input
                id="target-keyword"
                value={primaryKeyword}
                onChange={(e) => setPrimaryKeyword(e.target.value)}
                className="rounded-none border-primary/30 bg-secondary/50 font-mono text-xs h-10"
                placeholder="e.g. Next.js 16, Supabase RLS"
              />
              <Button
                type="button"
                onClick={handleAudit}
                disabled={isAuditing || primaryKeyword.trim().length < 2}
                className="rounded-none bg-primary font-mono text-xs text-primary-foreground hover:bg-primary/90 h-10 px-4 shrink-0"
              >
                {isAuditing ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    AUDITING...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-3.5 w-3.5" />
                    RUN_AUDIT
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="border border-border/50 bg-background/40 p-3 flex flex-col justify-center text-center font-mono">
            <div className="text-[10px] text-muted-foreground uppercase">LOCAL_SEO_SCORE</div>
            <div className="text-2xl font-bold font-orbitron text-primary mt-1">{localSeoScore}/100</div>
          </div>
        </div>

        {/* Live Metrics */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 font-mono text-xs">
          <div className="border border-border/50 bg-background/20 p-2.5">
            <div className="text-muted-foreground text-[10px]">WORD_COUNT</div>
            <div className="text-foreground font-semibold mt-0.5">{wordCount}</div>
          </div>
          <div className="border border-border/50 bg-background/20 p-2.5">
            <div className="text-muted-foreground text-[10px]">KEYWORD_DENSITY</div>
            <div className="text-foreground font-semibold mt-0.5">
              {density.count} times ({density.percent}%)
            </div>
          </div>
          <div className="border border-border/50 bg-background/20 p-2.5">
            <div className="text-muted-foreground text-[10px]">DENSITY_STATUS</div>
            <div className={`font-semibold mt-0.5 ${
              density.percent >= 0.5 && density.percent <= 2.5 
                ? "text-emerald-400" 
                : density.percent > 2.5 
                  ? "text-red-400" 
                  : "text-amber-400"
            }`}>
              {density.percent >= 0.5 && density.percent <= 2.5 
                ? "OPTIMIZED" 
                : density.percent > 2.5 
                  ? "OVERSTUFFED" 
                  : "LOW_DENSITY"}
            </div>
          </div>
          <div className="border border-border/50 bg-background/20 p-2.5">
            <div className="text-muted-foreground text-[10px]">READ_READINESS</div>
            <div className="text-foreground font-semibold mt-0.5">
              {wordCount >= 700 ? "HIGH_DEPTH" : wordCount >= 300 ? "STANDARD" : "THIN_CONTENT"}
            </div>
          </div>
        </div>

        {/* AI Results */}
        {auditResult && (
          <div className="space-y-4 border-t border-border/50 pt-4 font-mono text-xs">
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 border border-primary/20 bg-primary/10 px-2 py-0.5 text-[9px] uppercase font-mono text-primary font-bold">
                AI_SEO_CRITIQUE_FEEDBACK
              </span>
              <div className="border border-border/40 bg-secondary/30 p-3 text-muted-foreground leading-relaxed whitespace-pre-line text-justify">
                {auditResult.seoScoreFeedback}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[9px] uppercase font-mono text-amber-400 font-bold">
                <AlertTriangle className="h-3 w-3" /> SUGGESTED_IMPROVEMENTS
              </span>
              <ul className="space-y-1.5 border border-border/40 bg-secondary/20 p-3">
                {auditResult.suggestedImprovements.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-muted-foreground leading-relaxed">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] uppercase font-mono text-emerald-400 font-bold">
                    OPTIMIZED_META_DESCRIPTION
                  </span>
                  {onApplyMetaDescription && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onApplyMetaDescription(auditResult.optimizedMetaDescription);
                        toast.success("Applied optimized meta description to form field!");
                      }}
                      className="h-6 rounded-none border-emerald-500/40 px-2 text-[9px] text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-400"
                    >
                      <Check className="mr-1 h-3 w-3" />
                      APPLY
                    </Button>
                  )}
                </div>
                <div className="border border-border/40 bg-secondary/30 p-3 text-muted-foreground leading-relaxed min-h-20">
                  {auditResult.optimizedMetaDescription}
                </div>
              </div>

              {auditResult.suggestedTags && auditResult.suggestedTags.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-[9px] uppercase font-mono text-violet-400 font-bold">
                      SUGGESTED_TAGS
                    </span>
                    {onApplyTags && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          onApplyTags(auditResult.suggestedTags!.join(", "));
                          toast.success("Applied suggested tags to tags form field!");
                        }}
                        className="h-6 rounded-none border-violet-500/40 px-2 text-[9px] text-violet-400 hover:bg-violet-500/10 hover:text-violet-400"
                      >
                        <Check className="mr-1 h-3 w-3" />
                        APPLY
                      </Button>
                    )}
                  </div>
                  <div className="border border-border/40 bg-secondary/30 p-3 flex flex-wrap gap-1.5 min-h-20 items-start">
                    {auditResult.suggestedTags.map((tag) => (
                      <span
                        key={tag}
                        className="border border-primary/20 bg-primary/5 px-2 py-1 text-[10px] text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
