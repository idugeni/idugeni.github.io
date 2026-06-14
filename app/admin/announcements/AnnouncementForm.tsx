"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAnnouncement, updateAnnouncement, type Announcement } from "@/actions/announcements";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { AlertTriangle, Calendar, CheckCircle, Info, Link as LinkIcon, Save, Sparkles, X } from "@/lib/icons";

interface AnnouncementFormProps {
  initialData?: Announcement;
  mode: "create" | "edit";
}

export function AnnouncementForm({ initialData, mode }: AnnouncementFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    content: initialData?.content || "",
    type: initialData?.type || "info",
    placement: initialData?.placement || "banner",
    is_active: initialData?.is_active ?? true,
    starts_at: initialData?.starts_at ? initialData.starts_at.slice(0, 16) : "",
    ends_at: initialData?.ends_at ? initialData.ends_at.slice(0, 16) : "",
    target_page: initialData?.target_page || "*",
    dismissible: initialData?.dismissible ?? true,
    cta_label: initialData?.cta_label || "",
    cta_url: initialData?.cta_url || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Title is required.");
      return;
    }
    if (!formData.content.trim()) {
      toast.error("Content is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "create") {
        await createAnnouncement(formData);
        toast.success("Announcement created successfully!");
      } else {
        await updateAnnouncement(initialData!.id, formData);
        toast.success("Announcement updated successfully!");
      }
      router.push("/admin/announcements");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save announcement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPreviewStyles = () => {
    switch (formData.type) {
      case "info": return "border-cyan-500/30 bg-cyan-950/20 text-cyan-400";
      case "warning": return "border-amber-500/30 bg-amber-950/20 text-amber-400";
      case "success": return "border-emerald-500/30 bg-emerald-950/20 text-emerald-400";
      case "danger": return "border-red-500/30 bg-red-950/20 text-red-400";
      case "primary": return "border-primary/30 bg-primary/5 text-primary";
      default: return "border-border/40 bg-secondary/30 text-muted-foreground";
    }
  };

  const getPreviewIcon = () => {
    switch (formData.type) {
      case "success": return <CheckCircle className="h-4 w-4 shrink-0" />;
      case "warning":
      case "danger":
        return <AlertTriangle className="h-4 w-4 shrink-0" />;
      default: return <Info className="h-4 w-4 shrink-0" />;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_450px]">
      {/* Form Fields Column */}
      <div className="min-w-0 space-y-6">
        <Card className="admin-panel">
          <CardHeader>
            <CardTitle className="font-orbitron text-primary">
              <Sparkles className="mr-2 inline h-5 w-5" />
              ANNOUNCEMENT_DETAILS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="font-mono text-xs text-muted-foreground">TITLE *</Label>
              <Input
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Maintenance Alert, New Feature Release"
                className="rounded-none border-primary/30 bg-secondary/50 font-mono text-xs h-10"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-mono text-xs text-muted-foreground">CONTENT / MESSAGE *</Label>
              <Textarea
                required
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your announcement content here. Supports raw text message."
                className="min-h-32 rounded-none border-primary/30 bg-secondary/50 font-mono text-xs"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="font-mono text-xs text-muted-foreground">ANNOUNCEMENT_TYPE</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(["info", "warning", "success", "danger", "primary"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: t })}
                      className={`py-2 text-[10px] font-mono border text-center transition-colors uppercase ${
                        formData.type === t
                          ? "border-primary bg-primary/10 text-primary font-bold"
                          : "border-border/50 text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-mono text-xs text-muted-foreground">PLACEMENT</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(["banner", "modal", "card"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData({ ...formData, placement: p })}
                      className={`py-2 text-[10px] font-mono border text-center transition-colors uppercase ${
                        formData.placement === p
                          ? "border-primary bg-primary/10 text-primary font-bold"
                          : "border-border/50 text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="font-mono text-xs text-muted-foreground">TARGET_PAGE_ROUTE</Label>
                <Input
                  value={formData.target_page}
                  onChange={(e) => setFormData({ ...formData, target_page: e.target.value })}
                  placeholder="e.g. *, /blog, /contact"
                  className="rounded-none border-primary/30 bg-secondary/50 font-mono text-xs h-10"
                />
                <p className="text-[10px] text-muted-foreground">* matches all website paths</p>
              </div>

              <div className="space-y-2 flex flex-col justify-center">
                <label className="flex items-center gap-3 cursor-pointer border border-border/40 p-2.5 mt-2.5 bg-secondary/20">
                  <input
                    type="checkbox"
                    checked={formData.dismissible}
                    onChange={(e) => setFormData({ ...formData, dismissible: e.target.checked })}
                    className="cursor-pointer"
                  />
                  <div>
                    <p className="font-mono text-xs font-semibold uppercase">DISMISSIBLE</p>
                    <p className="text-[10px] text-muted-foreground leading-normal">Allows visitors to close</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="font-mono text-xs text-muted-foreground">CTA_BUTTON_LABEL (optional)</Label>
                <Input
                  value={formData.cta_label}
                  onChange={(e) => setFormData({ ...formData, cta_label: e.target.value })}
                  placeholder="e.g. Read Details"
                  className="rounded-none border-primary/30 bg-secondary/50 font-mono text-xs h-10"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-mono text-xs text-muted-foreground">CTA_BUTTON_URL (optional)</Label>
                <Input
                  type="url"
                  value={formData.cta_url}
                  onChange={(e) => setFormData({ ...formData, cta_url: e.target.value })}
                  placeholder="https://..."
                  className="rounded-none border-primary/30 bg-secondary/50 font-mono text-xs h-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scheduling Card */}
        <Card className="admin-panel">
          <CardHeader>
            <CardTitle className="font-orbitron text-primary">
              <Calendar className="mr-2 inline h-5 w-5" />
              TIMELINE_SCHEDULING
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="font-mono text-xs text-muted-foreground">STARTS_AT (optional)</Label>
                <Input
                  type="datetime-local"
                  value={formData.starts_at}
                  onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                  className="rounded-none border-primary/30 bg-secondary/50 font-mono text-xs"
                />
                <p className="text-[10px] text-muted-foreground">Leaves empty to activate immediately</p>
              </div>

              <div className="space-y-2">
                <Label className="font-mono text-xs text-muted-foreground">ENDS_AT (optional)</Label>
                <Input
                  type="datetime-local"
                  value={formData.ends_at}
                  onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
                  className="rounded-none border-primary/30 bg-secondary/50 font-mono text-xs"
                />
                <p className="text-[10px] text-muted-foreground">Leaves empty for permanent display</p>
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer border border-border/40 p-3 bg-secondary/20 mt-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="cursor-pointer"
              />
              <div>
                <p className="font-mono text-xs font-semibold uppercase">PUBLISH_STATUS_ACTIVE</p>
                <p className="text-[10px] text-muted-foreground">Draft mode is hidden regardless of timing</p>
              </div>
            </label>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar Live Preview & Action buttons */}
      <aside className="min-w-0 space-y-6 xl:sticky xl:top-24 xl:self-start">
        {/* Actions Card */}
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
              disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}
              className="w-full rounded-none bg-primary font-mono text-xs text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? "SAVING..." : mode === "create" ? "CREATE_ANNOUNCEMENT" : "UPDATE_ANNOUNCEMENT"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="w-full rounded-none font-mono text-xs"
            >
              CANCEL
            </Button>
          </CardContent>
        </Card>

        {/* Live Widget Preview */}
        <Card className="admin-panel">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="font-orbitron text-xs uppercase tracking-wider text-muted-foreground">
              LIVE_WIDGET_PREVIEW
            </CardTitle>
            <CardDescription className="font-mono text-[9px] text-muted-foreground">
              Simulated rendering of placement: <span className="text-primary uppercase font-bold">{formData.placement}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 font-mono text-xs space-y-4">
            {formData.placement === "banner" && (
              <div className={`border p-3 flex items-start justify-between gap-3 text-xs break-words ${getPreviewStyles()}`}>
                <div className="flex items-center gap-2 min-w-0 flex-wrap">
                  {getPreviewIcon()}
                  <span className="font-bold shrink-0">{formData.title}:</span>
                  <span className="opacity-90 break-words">{formData.content}</span>
                  {formData.cta_label && formData.cta_url && (
                    <span className="underline ml-2 font-bold cursor-pointer shrink-0">{formData.cta_label}</span>
                  )}
                </div>
                {formData.dismissible && <X className="h-3.5 w-3.5 opacity-60 cursor-pointer shrink-0 mt-0.5" />}
              </div>
            )}

            {formData.placement === "card" && (
              <div className={`border p-4 space-y-3 ${getPreviewStyles()}`}>
                <div className="flex items-center gap-2 border-b border-current/20 pb-2">
                  {getPreviewIcon()}
                  <h4 className="font-bold uppercase tracking-wider">{formData.title}</h4>
                </div>
                <p className="opacity-90 text-[11px] leading-relaxed">{formData.content}</p>
                {formData.cta_label && formData.cta_url && (
                  <Button type="button" variant="outline" className="h-7 text-[10px] px-2 rounded-none border-current hover:bg-current/10">
                    <LinkIcon className="mr-1 h-3 w-3" />
                    {formData.cta_label}
                  </Button>
                )}
              </div>
            )}

            {formData.placement === "modal" && (
              <div className="border border-border/40 bg-black/60 p-4 space-y-4 text-center max-w-sm mx-auto shadow-2xl relative">
                {formData.dismissible && (
                  <button type="button" className="absolute top-2 right-2 text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                )}
                <div className={`mx-auto w-10 h-10 border flex items-center justify-center rounded-full ${getPreviewStyles()}`}>
                  {getPreviewIcon()}
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold font-orbitron uppercase text-foreground">{formData.title}</h4>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{formData.content}</p>
                </div>
                {formData.cta_label && formData.cta_url && (
                  <Button type="button" size="sm" className="rounded-none bg-primary text-primary-foreground font-mono text-[10px] w-full">
                    {formData.cta_label}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </aside>
    </form>
  );
}
