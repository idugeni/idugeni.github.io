"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import type { DisplayMode, Shortlink } from "@/actions/shortlinks";
import { createShortlink, updateShortlink } from "@/actions/shortlinks";
import { generateShortlinkAiContent } from "@/actions/shortlink-ai";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Eye, Lock, Link as LinkIcon, QrCode, Save, Shield, Sparkles, Loader2Icon } from "@/lib/icons";

interface ShortlinkFormProps {
  shortlink?: Shortlink;
  mode: "create" | "edit";
}

export function ShortlinkForm({ shortlink, mode }: ShortlinkFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<"settings" | "design">("settings");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [formData, setFormData] = useState({
    code: shortlink?.code || "",
    destination_url: shortlink?.destination_url || "",
    title: shortlink?.title || "",
    description: shortlink?.description || "",
    display_mode: (shortlink?.display_mode || "direct") as DisplayMode,
    is_active: shortlink?.is_active ?? true,
    expires_at: shortlink?.expires_at ? shortlink.expires_at.slice(0, 16) : "",
    activates_at: shortlink?.activates_at ? shortlink.activates_at.slice(0, 16) : "",
    click_limit: shortlink?.click_limit?.toString() || "",
    password: "",
    remove_password: false,
    // Mode configs
    countdown: (shortlink?.mode_config?.countdown as number) || 5,
    showAds: (shortlink?.mode_config?.showAds as boolean) || false,
    brandLogo: (shortlink?.mode_config?.brandLogo as string) || "",
    brandColor: (shortlink?.mode_config?.brandColor as string) || "#06b6d4",
    brandMessage: (shortlink?.mode_config?.brandMessage as string) || "",
    delay: (shortlink?.mode_config?.delay as number) || 2000,
    warningMessage: (shortlink?.mode_config?.warningMessage as string) || "",
    requireConfirmation: (shortlink?.mode_config?.requireConfirmation as boolean) || false,
    // AI Content fields
    ai_headline: (shortlink?.mode_config?.ai_headline as string) || "",
    ai_article_title: (shortlink?.mode_config?.ai_article_title as string) || "",
    ai_article_body: (shortlink?.mode_config?.ai_article_body as string) || "",
    ai_safety_analysis: (shortlink?.mode_config?.ai_safety_analysis as string) || "",
    ai_safety_score: (shortlink?.mode_config?.ai_safety_score as number) || 95,
    ai_trust_grade: (shortlink?.mode_config?.ai_trust_grade as string) || "A",
    ai_brand_color: (shortlink?.mode_config?.ai_brand_color as string) || "#06b6d4",
    ai_brand_message: (shortlink?.mode_config?.ai_brand_message as string) || "SSL SECURE CONNECTION STABLE",
    ai_generated: (shortlink?.mode_config?.ai_generated as boolean) || false,
    // Design studio
    qr_fg_color: shortlink?.qr_fg_color || "#000000",
    qr_bg_color: shortlink?.qr_bg_color || "#ffffff",
    qr_logo_text: shortlink?.qr_logo_text || "",
    splash_title: shortlink?.splash_title || "",
    splash_timer: shortlink?.splash_timer !== undefined ? shortlink.splash_timer : 5,
    splash_social_links: {
      github: (shortlink?.splash_social_links as any)?.github || "",
      twitter: (shortlink?.splash_social_links as any)?.twitter || "",
      website: (shortlink?.splash_social_links as any)?.website || "",
    },
  });

  // QR Canvas drawing hook
  useEffect(() => {
    if (activeTab === "design" && canvasRef.current) {
      const siteUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
      const codeToUse = formData.code || "preview";
      const shortUrl = `${siteUrl}/s/${codeToUse}`;

      QRCode.toCanvas(
        canvasRef.current,
        shortUrl,
        {
          width: 256,
          margin: 2,
          color: {
            dark: formData.qr_fg_color || "#000000",
            light: formData.qr_bg_color || "#ffffff",
          },
        },
        (error) => {
          if (error) {
            setError("QR preview could not be generated. Adjust the shortlink code or QR colors and try again.");
            return;
          }
          if (formData.qr_logo_text && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              const size = canvas.width;
              const boxSize = size * 0.24;
              const boxPos = (size - boxSize) / 2;
              
              // Center box background
              ctx.fillStyle = formData.qr_bg_color || "#ffffff";
              ctx.fillRect(boxPos, boxPos, boxSize, boxSize);
              
              // Center box border
              ctx.strokeStyle = formData.qr_fg_color || "#000000";
              ctx.lineWidth = 2;
              ctx.strokeRect(boxPos, boxPos, boxSize, boxSize);

              // Draw initials text
              ctx.fillStyle = formData.qr_fg_color || "#000000";
              ctx.font = `bold ${boxSize * 0.45}px monospace`;
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText(
                formData.qr_logo_text.slice(0, 3).toUpperCase(),
                size / 2,
                size / 2
              );
            }
          }
        }
      );
    }
  }, [
    activeTab,
    formData.code,
    formData.qr_fg_color,
    formData.qr_bg_color,
    formData.qr_logo_text,
  ]);

  const handleAiScrape = async () => {
    if (!formData.destination_url) return;
    setIsScraping(true);
    setError(null);
    try {
      const data = await generateShortlinkAiContent(formData.destination_url);
      setFormData((prev) => ({
        ...prev,
        title: prev.title || data.title,
        description: prev.description || data.description,
        ai_headline: data.safelink_headline,
        ai_article_title: data.safelink_article_title,
        ai_article_body: data.safelink_article_body,
        ai_safety_analysis: data.safelink_safety_analysis,
        ai_safety_score: data.safelink_safety_score,
        ai_trust_grade: data.safelink_trust_grade,
        ai_brand_color: data.brand_color,
        ai_brand_message: data.brand_message,
        ai_generated: true,
      }));
    } catch (err: any) {
      setError(err.message || "Failed to auto-scrape and generate AI content");
    } finally {
      setIsScraping(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let mode_config = {};
      switch (formData.display_mode) {
        case "safelink":
          mode_config = {
            countdown: formData.countdown,
            showAds: formData.showAds,
            ai_headline: formData.ai_headline || undefined,
            ai_article_title: formData.ai_article_title || undefined,
            ai_article_body: formData.ai_article_body || undefined,
            ai_safety_analysis: formData.ai_safety_analysis || undefined,
            ai_safety_score: formData.ai_safety_score || undefined,
            ai_trust_grade: formData.ai_trust_grade || undefined,
            ai_brand_color: formData.ai_brand_color || undefined,
            ai_brand_message: formData.ai_brand_message || undefined,
            ai_generated: formData.ai_generated || undefined,
          };
          break;
        case "splash":
          mode_config = {
            brandLogo: formData.brandLogo || undefined,
            brandColor: formData.brandColor,
            brandMessage: formData.brandMessage || undefined,
            delay: formData.delay,
          };
          break;
        case "warning":
          mode_config = {
            warningMessage: formData.warningMessage || undefined,
            requireConfirmation: formData.requireConfirmation,
          };
          break;
      }

      if (mode === "create") {
        await createShortlink({
          code: formData.code || undefined,
          destination_url: formData.destination_url,
          title: formData.title || undefined,
          description: formData.description || undefined,
          display_mode: formData.display_mode,
          mode_config,
          expires_at: formData.expires_at || undefined,
          activates_at: formData.activates_at || undefined,
          click_limit: formData.click_limit ? parseInt(formData.click_limit) : undefined,
          password: formData.password || undefined,
          qr_fg_color: formData.qr_fg_color,
          qr_bg_color: formData.qr_bg_color,
          qr_logo_text: formData.qr_logo_text || undefined,
          splash_title: formData.splash_title || undefined,
          splash_timer: formData.splash_timer,
          splash_social_links: formData.splash_social_links,
        });
        router.push("/admin/shortlinks");
      } else {
        await updateShortlink(shortlink!.id, {
          destination_url: formData.destination_url,
          title: formData.title || undefined,
          description: formData.description || undefined,
          display_mode: formData.display_mode,
          mode_config,
          is_active: formData.is_active,
          expires_at: formData.expires_at || undefined,
          activates_at: formData.activates_at || undefined,
          click_limit: formData.click_limit ? parseInt(formData.click_limit) : undefined,
          password: formData.password || undefined,
          remove_password: formData.remove_password,
          qr_fg_color: formData.qr_fg_color,
          qr_bg_color: formData.qr_bg_color,
          qr_logo_text: formData.qr_logo_text || undefined,
          splash_title: formData.splash_title || undefined,
          splash_timer: formData.splash_timer,
          splash_social_links: formData.splash_social_links,
        });
        router.push("/admin/shortlinks");
      }
    } catch (err: any) {
      setError(err.message || "Failed to save shortlink");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Card className="border-danger/30 bg-danger/5">
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertTriangle className="h-5 w-5 text-danger" />
            <p className="text-sm text-danger">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-border/40 font-mono text-xs mb-4">
        <button
          type="button"
          onClick={() => setActiveTab("settings")}
          className={`px-4 py-2 border-b-2 font-bold -mb-[2px] transition-colors uppercase ${
            activeTab === "settings"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          SETTINGS
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("design")}
          className={`px-4 py-2 border-b-2 font-bold -mb-[2px] transition-colors uppercase ${
            activeTab === "design"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          VISUAL_STUDIO
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
        {/* Main Form */}
        <div className="min-w-0 space-y-6">
          {activeTab === "settings" ? (
            <>
          {/* Link Details */}
          <Card className="admin-panel">
            <CardHeader>
              <CardTitle className="font-orbitron text-primary">
                <LinkIcon className="mr-2 inline h-5 w-5" />
                LINK_DETAILS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="font-mono text-xs text-muted-foreground flex justify-between items-center">
                  <span>DESTINATION_URL *</span>
                  {isScraping && (
                    <span className="text-[10px] text-primary animate-pulse font-bold tracking-wider">
                      AI_SCRAPING_ACTIVE
                    </span>
                  )}
                </Label>
                <div className="flex gap-2">
                  <Input
                    required
                    type="url"
                    value={formData.destination_url}
                    onChange={(e) => setFormData({ ...formData, destination_url: e.target.value })}
                    placeholder="https://example.com/long-url"
                    className="flex-1 rounded-none border-primary/30 bg-secondary/50 font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isScraping || !formData.destination_url}
                    onClick={handleAiScrape}
                    className="rounded-none border-primary/40 text-primary hover:bg-primary/10 hover:text-primary font-mono text-xs flex gap-2 items-center h-10 px-4"
                  >
                    {isScraping ? (
                      <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5" />
                    )}
                    {isScraping ? "ANALYZING..." : "AI_SCRAPE"}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-mono text-xs text-muted-foreground">
                  CUSTOM_CODE {mode === "create" && "(optional, auto-generated if empty)"}
                </Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="my-link"
                  disabled={mode === "edit"}
                  className="rounded-none border-primary/30 bg-secondary/50 font-mono"
                />
                {mode === "edit" && (
                  <p className="text-xs text-muted-foreground">Code cannot be changed after creation</p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="font-mono text-xs text-muted-foreground">TITLE</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="My Shortlink"
                    className="rounded-none border-primary/30 bg-secondary/50 font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-mono text-xs text-muted-foreground">CLICK_LIMIT (optional)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.click_limit}
                    onChange={(e) => setFormData({ ...formData, click_limit: e.target.value })}
                    placeholder="Unlimited"
                    className="rounded-none border-primary/30 bg-secondary/50 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-mono text-xs text-muted-foreground">DESCRIPTION</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                  className="min-h-20 rounded-none border-primary/30 bg-secondary/50 font-mono"
                />
              </div>
            </CardContent>
          </Card>

          {/* Scheduling */}
          <Card className="admin-panel">
            <CardHeader>
              <CardTitle className="font-orbitron text-primary">
                <Eye className="mr-2 inline h-5 w-5" />
                SCHEDULING
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="font-mono text-xs text-muted-foreground">ACTIVATES_AT (optional)</Label>
                  <Input
                    type="datetime-local"
                    value={formData.activates_at}
                    onChange={(e) => setFormData({ ...formData, activates_at: e.target.value })}
                    className="rounded-none border-primary/30 bg-secondary/50 font-mono"
                  />
                  <p className="text-xs text-muted-foreground">Link stays hidden until this time</p>
                </div>
                <div className="space-y-2">
                  <Label className="font-mono text-xs text-muted-foreground">EXPIRES_AT (optional)</Label>
                  <Input
                    type="datetime-local"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                    className="rounded-none border-primary/30 bg-secondary/50 font-mono"
                  />
                  <p className="text-xs text-muted-foreground">Link stops working after this time</p>
                </div>
              </div>

              {mode === "edit" && (
                <label className="flex items-center gap-3 border border-border/50 bg-secondary/30 p-4">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  <div>
                    <p className="font-mono text-sm font-medium">ACTIVE</p>
                    <p className="text-xs text-muted-foreground">Inactive links return 404</p>
                  </div>
                </label>
              )}
            </CardContent>
          </Card>

          {/* Password Protection */}
          <Card className="admin-panel">
            <CardHeader>
              <CardTitle className="font-orbitron text-primary">
                <Shield className="mr-2 inline h-5 w-5" />
                PASSWORD_PROTECTION
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mode === "edit" && shortlink?.password_hash && !formData.remove_password && (
                <div className="flex items-center justify-between border border-success/30 bg-success/5 p-3">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-success" />
                    <span className="font-mono text-sm text-success">Password is set</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData({ ...formData, remove_password: true })}
                    className="font-mono text-xs text-danger hover:text-danger"
                  >
                    REMOVE
                  </Button>
                </div>
              )}

              {(mode === "create" || !shortlink?.password_hash || formData.remove_password) && (
                <div className="space-y-2">
                  <Label className="font-mono text-xs text-muted-foreground">
                    {mode === "edit" && formData.remove_password ? "SET_NEW_PASSWORD" : "PASSWORD"} (optional)
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Leave empty for no password"
                      className="rounded-none border-primary/30 bg-secondary/50 pr-20 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-muted-foreground hover:text-primary"
                    >
                      {showPassword ? "HIDE" : "SHOW"}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Users must enter this password before being redirected
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Display Mode */}
          <Card className="admin-panel">
            <CardHeader>
              <CardTitle className="font-orbitron text-primary">
                <Sparkles className="mr-2 inline h-5 w-5" />
                DISPLAY_MODE
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                {(["direct", "safelink", "splash", "warning"] as const).map((m) => (
                  <label
                    key={m}
                    className={`cursor-pointer border p-4 transition-colors ${
                      formData.display_mode === m
                        ? "border-primary bg-primary/10"
                        : "border-border/50 hover:border-primary/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="display_mode"
                      value={m}
                      checked={formData.display_mode === m}
                      onChange={(e) =>
                        setFormData({ ...formData, display_mode: e.target.value as DisplayMode })
                      }
                      className="sr-only"
                    />
                    <p className="font-mono text-sm font-medium uppercase">{m}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {m === "direct" && "Instant redirect"}
                      {m === "safelink" && "Countdown with ads"}
                      {m === "splash" && "Branded landing"}
                      {m === "warning" && "Security warning"}
                    </p>
                  </label>
                ))}
              </div>

              {/* Safelink config */}
              {/* Safelink config */}
              {formData.display_mode === "safelink" && (
                <div className="space-y-4 border-t border-border/50 pt-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="font-mono text-xs text-muted-foreground">COUNTDOWN_SECONDS</Label>
                      <Input
                        type="number"
                        min="1"
                        max="60"
                        value={formData.countdown}
                        onChange={(e) => setFormData({ ...formData, countdown: parseInt(e.target.value) || 5 })}
                        className="rounded-none border-primary/30 bg-secondary/50 font-mono text-xs"
                      />
                    </div>
                    <div className="flex items-center pt-6">
                      <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formData.showAds}
                          onChange={(e) => setFormData({ ...formData, showAds: e.target.checked })}
                          className="accent-primary"
                        />
                        <span className="font-mono text-xs text-muted-foreground uppercase">Show ads placeholder</span>
                      </label>
                    </div>
                  </div>

                  {/* AI Generated Content Editor & Overrides */}
                  <div className="border border-primary/20 bg-primary/5 p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-primary/20 pb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                        <h4 className="font-orbitron text-xs font-bold text-primary uppercase tracking-wider">
                          AI_SAFELINK_CONTENT_GENERATOR
                        </h4>
                      </div>
                      {formData.ai_generated ? (
                        <span className="bg-primary/20 border border-primary/30 text-primary font-mono text-[9px] px-2 py-0.5 uppercase tracking-widest font-bold">
                          GENERATED_ACTIVE
                        </span>
                      ) : (
                        <span className="bg-muted text-muted-foreground font-mono text-[9px] px-2 py-0.5 uppercase tracking-widest">
                          NO_AI_DATA
                        </span>
                      )}
                    </div>

                    {!formData.ai_generated ? (
                      <div className="text-center py-4 space-y-3">
                        <p className="text-xs text-muted-foreground font-mono max-w-sm mx-auto">
                          Click "AI AUTO-FILL & SCRAPE" next to the Destination URL input to automatically fetch, analyze,
                          and build custom cybersecurity articles and safety certificates for this destination!
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isScraping || !formData.destination_url}
                          onClick={handleAiScrape}
                          className="rounded-none border-primary/40 text-primary hover:bg-primary/10 hover:text-primary font-mono text-xs flex gap-2 items-center mx-auto"
                        >
                          {isScraping ? (
                            <Loader2Icon className="h-3 w-3 animate-spin" />
                          ) : (
                            <Sparkles className="h-3 w-3" />
                          )}
                          Scrape & Build Safelink Content
                        </Button>
                    ) : (
                      <div className="space-y-4 font-mono text-xs text-left">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label className="text-muted-foreground">AI_BRAND_COLOR</Label>
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                value={formData.ai_brand_color}
                                onChange={(e) => setFormData({ ...formData, ai_brand_color: e.target.value })}
                                className="h-8 w-12 border-primary/30 bg-secondary/50 cursor-pointer p-0"
                              />
                              <Input
                                type="text"
                                value={formData.ai_brand_color}
                                onChange={(e) => setFormData({ ...formData, ai_brand_color: e.target.value })}
                                className="h-8 rounded-none border-primary/30 bg-secondary/50 font-mono text-xs uppercase"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-muted-foreground">AI_TRUST_GRADE & SCORE</Label>
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                type="text"
                                maxLength={3}
                                value={formData.ai_trust_grade}
                                onChange={(e) => setFormData({ ...formData, ai_trust_grade: e.target.value.toUpperCase() })}
                                placeholder="A+"
                                className="h-8 rounded-none border-primary/30 bg-secondary/50 font-mono text-xs text-center"
                              />
                              <Input
                                type="number"
                                min="1"
                                max="100"
                                value={formData.ai_safety_score}
                                onChange={(e) => setFormData({ ...formData, ai_safety_score: parseInt(e.target.value) || 95 })}
                                className="h-8 rounded-none border-primary/30 bg-secondary/50 font-mono text-xs text-center"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-muted-foreground">AI_BEACON_HEADLINE</Label>
                          <Input
                            value={formData.ai_headline}
                            onChange={(e) => setFormData({ ...formData, ai_headline: e.target.value })}
                            className="h-8 rounded-none border-primary/30 bg-secondary/50 font-mono text-xs"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-muted-foreground">AI_BRAND_STATUS_MESSAGE</Label>
                          <Input
                            value={formData.ai_brand_message}
                            onChange={(e) => setFormData({ ...formData, ai_brand_message: e.target.value })}
                            className="h-8 rounded-none border-primary/30 bg-secondary/50 font-mono text-xs"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-muted-foreground">AI_SAFETY_AUDIT_REPORT</Label>
                          <Textarea
                            value={formData.ai_safety_analysis}
                            onChange={(e) => setFormData({ ...formData, ai_safety_analysis: e.target.value })}
                            className="min-h-16 rounded-none border-primary/30 bg-secondary/50 font-mono text-xs"
                          />
                        </div>

                        <div className="space-y-2 border-t border-primary/10 pt-3">
                          <Label className="text-primary font-bold">AI_ARTICLE_HEADLINE</Label>
                          <Input
                            value={formData.ai_article_title}
                            onChange={(e) => setFormData({ ...formData, ai_article_title: e.target.value })}
                            className="h-8 rounded-none border-primary/30 bg-secondary/50 font-mono text-xs"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-muted-foreground">AI_ARTICLE_BODY (HTML FORMATTED)</Label>
                          <Textarea
                            value={formData.ai_article_body}
                            onChange={(e) => setFormData({ ...formData, ai_article_body: e.target.value })}
                            className="min-h-32 rounded-none border-primary/30 bg-secondary/50 font-mono text-xs"
                          />
                        </div>

                        <div className="border border-border/60 bg-slate-950 p-4 space-y-3">
                          <span className="text-[10px] text-primary tracking-widest font-bold uppercase">
                            LIVE_SAFELINK_HUD_PREVIEW
                          </span>
                          <div className="border-t border-border/30 pt-2 space-y-2">
                            <div className="flex justify-between items-center">
                              <span
                                className="font-orbitron font-extrabold tracking-wider text-sm"
                                style={{ color: formData.ai_brand_color }}
                              >
                                {formData.ai_headline || "SECURE PORTAL"}
                              </span>
                              <span
                                className="px-2 py-0.5 text-[9px] border font-bold bg-slate-900 animate-pulse"
                                style={{ color: formData.ai_brand_color, borderColor: formData.ai_brand_color }}
                              >
                                GRADE {formData.ai_trust_grade}
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground line-clamp-2">
                              {formData.ai_safety_analysis || "No security review active..."}
                            </p>
                            <div className="h-1 w-full bg-secondary overflow-hidden">
                              <div
                                className="h-full transition-all duration-500"
                                style={{
                                  width: `${formData.ai_safety_score}%`,
                                  backgroundColor: formData.ai_brand_color,
                                }}
                              />
                            </div>
                            <div className="pt-2 border-t border-border/20">
                              <span className="font-bold text-[10px] block" style={{ color: formData.ai_brand_color }}>
                                {formData.ai_article_title || "Article Preview Headline"}
                              </span>
                              <div
                                className="text-[9px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: formData.ai_article_body || "Article contents..." }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Splash config */}
              {formData.display_mode === "splash" && (
                <div className="space-y-4 border-t border-border/50 pt-4">
                  <div className="space-y-2">
                    <Label className="font-mono text-xs text-muted-foreground">BRAND_LOGO_URL</Label>
                    <Input
                      type="url"
                      value={formData.brandLogo}
                      onChange={(e) => setFormData({ ...formData, brandLogo: e.target.value })}
                      placeholder="https://..."
                      className="rounded-none border-primary/30 bg-secondary/50 font-mono"
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="font-mono text-xs text-muted-foreground">BRAND_COLOR</Label>
                      <Input
                        type="color"
                        value={formData.brandColor}
                        onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                        className="h-10 rounded-none border-primary/30 bg-secondary/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-mono text-xs text-muted-foreground">DELAY_MS</Label>
                      <Input
                        type="number" min="500" max="10000" step="500"
                        value={formData.delay}
                        onChange={(e) => setFormData({ ...formData, delay: parseInt(e.target.value) })}
                        className="rounded-none border-primary/30 bg-secondary/50 font-mono"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-mono text-xs text-muted-foreground">BRAND_MESSAGE</Label>
                    <Input
                      value={formData.brandMessage}
                      onChange={(e) => setFormData({ ...formData, brandMessage: e.target.value })}
                      placeholder="Redirecting..."
                      className="rounded-none border-primary/30 bg-secondary/50 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Warning config */}
              {formData.display_mode === "warning" && (
                <div className="space-y-4 border-t border-border/50 pt-4">
                  <div className="space-y-2">
                    <Label className="font-mono text-xs text-muted-foreground">WARNING_MESSAGE</Label>
                    <Textarea
                      value={formData.warningMessage}
                      onChange={(e) => setFormData({ ...formData, warningMessage: e.target.value })}
                      placeholder="This link leads to an external site..."
                      className="min-h-20 rounded-none border-primary/30 bg-secondary/50 font-mono"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.requireConfirmation}
                      onChange={(e) => setFormData({ ...formData, requireConfirmation: e.target.checked })}
                    />
                    Require user confirmation
                  </label>
                </div>
              )}
            </CardContent>
          </Card>
          </>
          ) : (
            <>
              {/* Design studio / QR Code & Splash Pages Customization */}
              <Card className="admin-panel animate-in fade-in duration-300">
                <CardHeader>
                  <CardTitle className="font-orbitron text-primary">
                    <QrCode className="mr-2 inline h-5 w-5 animate-pulse" />
                    QR_CODE_CUSTOMIZER
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-mono text-xs text-muted-foreground uppercase">FOREGROUND_COLOR</Label>
                        <div className="flex gap-3 items-center">
                          <Input
                            type="color"
                            value={formData.qr_fg_color}
                            onChange={(e) => setFormData({ ...formData, qr_fg_color: e.target.value })}
                            className="h-10 w-20 rounded-none border-primary/30 bg-secondary/50 cursor-pointer"
                          />
                          <Input
                            type="text"
                            value={formData.qr_fg_color}
                            onChange={(e) => setFormData({ ...formData, qr_fg_color: e.target.value })}
                            placeholder="#000000"
                            className="rounded-none border-primary/30 bg-secondary/50 font-mono text-xs uppercase"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-mono text-xs text-muted-foreground uppercase">BACKGROUND_COLOR</Label>
                        <div className="flex gap-3 items-center">
                          <Input
                            type="color"
                            value={formData.qr_bg_color}
                            onChange={(e) => setFormData({ ...formData, qr_bg_color: e.target.value })}
                            className="h-10 w-20 rounded-none border-primary/30 bg-secondary/50 cursor-pointer"
                          />
                          <Input
                            type="text"
                            value={formData.qr_bg_color}
                            onChange={(e) => setFormData({ ...formData, qr_bg_color: e.target.value })}
                            placeholder="#ffffff"
                            className="rounded-none border-primary/30 bg-secondary/50 font-mono text-xs uppercase"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-mono text-xs text-muted-foreground uppercase">CENTER_LOGO_INITIALS</Label>
                        <Input
                          type="text"
                          maxLength={3}
                          value={formData.qr_logo_text}
                          onChange={(e) => setFormData({ ...formData, qr_logo_text: e.target.value })}
                          placeholder="e.g. IRN (max 3 characters)"
                          className="rounded-none border-primary/30 bg-secondary/50 font-mono text-xs uppercase"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center border border-border/50 bg-secondary/10 p-6 space-y-4">
                      <Label className="font-mono text-xs text-muted-foreground uppercase tracking-wider">LIVE_QR_PREVIEW</Label>
                      <div className="p-3 bg-white shadow-lg border border-border/30 rounded-lg">
                        <canvas ref={canvasRef} className="max-w-[200px] h-[200px]" />
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono">Dynamic Canvas Render</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Splash Page Visual Settings */}
              {(formData.display_mode === "splash" || formData.display_mode === "safelink") && (
                <Card className="admin-panel animate-in fade-in duration-300">
                  <CardHeader>
                    <CardTitle className="font-orbitron text-primary">
                      <Sparkles className="mr-2 inline h-5 w-5" />
                      SPLASH_SAFELINK_LANDING_PAGE
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="font-mono text-xs text-muted-foreground uppercase">CUSTOM_SPLASH_TITLE</Label>
                      <Input
                        type="text"
                        value={formData.splash_title}
                        onChange={(e) => setFormData({ ...formData, splash_title: e.target.value })}
                        placeholder="e.g. Redirecting to your secure destination..."
                        className="rounded-none border-primary/30 bg-secondary/50 font-mono text-xs"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-mono text-xs text-muted-foreground uppercase">COUNTDOWN_TIMER_SECONDS</Label>
                      <Input
                        type="number"
                        min={1}
                        max={60}
                        value={formData.splash_timer}
                        onChange={(e) => setFormData({ ...formData, splash_timer: parseInt(e.target.value) || 5 })}
                        className="rounded-none border-primary/30 bg-secondary/50 font-mono text-xs"
                      />
                    </div>

                    <div className="space-y-3 pt-3 border-t border-border/40">
                      <Label className="font-mono text-xs text-primary uppercase font-bold tracking-wider">SOCIAL_NETWORKS_LINKS</Label>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label className="font-mono text-[10px] text-muted-foreground uppercase">GITHUB_URL</Label>
                          <Input
                            type="url"
                            value={formData.splash_social_links.github}
                            onChange={(e) => setFormData({
                              ...formData,
                              splash_social_links: {
                                ...formData.splash_social_links,
                                github: e.target.value,
                              }
                            })}
                            placeholder="https://github.com/..."
                            className="rounded-none border-primary/30 bg-secondary/50 font-mono text-xs"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-mono text-[10px] text-muted-foreground uppercase">TWITTER_URL</Label>
                          <Input
                            type="url"
                            value={formData.splash_social_links.twitter}
                            onChange={(e) => setFormData({
                              ...formData,
                              splash_social_links: {
                                ...formData.splash_social_links,
                                twitter: e.target.value,
                              }
                            })}
                            placeholder="https://twitter.com/..."
                            className="rounded-none border-primary/30 bg-secondary/50 font-mono text-xs"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-mono text-[10px] text-muted-foreground uppercase">WEBSITE_URL</Label>
                          <Input
                            type="url"
                            value={formData.splash_social_links.website}
                            onChange={(e) => setFormData({
                              ...formData,
                              splash_social_links: {
                                ...formData.splash_social_links,
                                website: e.target.value,
                              }
                            })}
                            placeholder="https://example.com"
                            className="rounded-none border-primary/30 bg-secondary/50 font-mono text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

        {/* Sidebar */}
        <aside className="min-w-0 space-y-6 xl:sticky xl:top-24 xl:self-start">
          <Card className="admin-panel-strong">
            <CardHeader>
              <CardTitle className="font-orbitron text-primary">
                <Save className="mr-2 inline h-5 w-5" />
                ACTIONS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-none bg-primary font-mono text-primary-foreground hover:bg-primary/90"
              >
                {isSubmitting ? "SAVING..." : mode === "create" ? "CREATE_SHORTLINK" : "UPDATE_SHORTLINK"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="w-full rounded-none font-mono"
              >
                CANCEL
              </Button>

              {mode === "create" && (
                <div className="border-t border-border/50 pt-3">
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <QrCode className="h-4 w-4" />
                    QR code will be generated automatically
                  </p>
                </div>
              )}

              {mode === "edit" && shortlink && (
                <div className="space-y-2 border-t border-border/50 pt-3">
                  <div className="flex justify-between font-mono text-xs text-muted-foreground">
                    <span>CLICKS</span>
                    <span className="text-primary">{shortlink.click_count}{shortlink.click_limit ? ` / ${shortlink.click_limit}` : ""}</span>
                  </div>
                  {shortlink.password_hash && (
                    <div className="flex items-center gap-1 font-mono text-xs text-success">
                      <Lock className="h-3 w-3" />
                      PASSWORD_PROTECTED
                    </div>
                  )}
                  {shortlink.previous_codes?.length > 0 && (
                    <div className="space-y-1">
                      <p className="font-mono text-xs text-muted-foreground">SLUG_HISTORY</p>
                      {shortlink.previous_codes.map((c) => (
                        <code key={c} className="block text-xs text-muted-foreground">{c}</code>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </form>
  );
}
