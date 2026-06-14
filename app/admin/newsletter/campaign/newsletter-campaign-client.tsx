"use client";

import { useState, useMemo } from "react";
import { dispatchNewsletterCampaign } from "@/actions/newsletter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Eye, Loader2Icon, Mail, Send, Sparkles } from "@/lib/icons";

export default function NewsletterCampaignPage() {
  const [subject, setSubject] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const wrappedPreviewHtml = useMemo(() => {
    const defaultGreeting = "Halo [Nama Subscriber],";
    const defaultUnsubscribeUrl = "#";
    const body = contentHtml || "<p style='color: #9ca3af; font-style: italic;'>Tulis sesuatu untuk melihat pratinjau...</p>";

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Newsletter Preview</title>
          <style>
            body { margin: 0; padding: 0; background-color: #0b0f19; }
          </style>
        </head>
        <body>
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0f19; color: #f3f4f6; padding: 20px 10px; text-align: left; min-height: 100vh;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #111827; border: 1px solid #1f2937; padding: 30px; border-radius: 8px;">
              <div style="text-align: center; margin-bottom: 25px;">
                <span style="font-size: 20px; font-weight: bold; color: #06b6d4; font-family: monospace; letter-spacing: 2px;">IRNK_CODES</span>
              </div>
              <div style="font-size: 15px; line-height: 1.6; color: #d1d5db; margin-bottom: 30px;">
                <p style="margin-bottom: 20px; font-weight: 500;">${defaultGreeting}</p>
                ${body}
              </div>
              <hr style="border: 0; border-top: 1px solid #374151; margin: 30px 0;">
              <p style="font-size: 11px; color: #9ca3af; text-align: center; line-height: 1.5;">
                Anda menerima email ini karena Anda berlangganan buletin IRNK Codes.
                <br>
                <a href="${defaultUnsubscribeUrl}" style="color: #06b6d4; text-decoration: underline; font-weight: bold; margin-top: 8px; display: inline-block;">Berhenti Berlangganan (Unsubscribe)</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
  }, [contentHtml]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      toast.error("Subject is required.");
      return;
    }
    if (contentHtml.trim().length < 10) {
      toast.error("Content must be at least 10 characters.");
      return;
    }

    setIsSubmitting(true);
    setLog(["Initializing email campaign dispatcher...", "Fetching active subscribers..."]);

    try {
      const result = await dispatchNewsletterCampaign({
        subject: subject.trim(),
        contentHtml: contentHtml.trim(),
      });

      if (result.success) {
        setLog((prev) => [
          ...prev,
          `Active subscribers found: ${result.sentCount + result.failedCount}`,
          `Dispatch complete!`,
          `SUCCESSFUL: ${result.sentCount} emails sent`,
          `FAILED: ${result.failedCount} emails failed`,
        ]);
        toast.success("Newsletter campaign sent successfully!");
        setSubject("");
        setContentHtml("");
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Failed to dispatch newsletter campaign.";
      setLog((prev) => [...prev, `ERROR: ${errMsg}`]);
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-orbitron text-2xl font-bold uppercase tracking-wider text-primary">
          CAMPAIGN_DISPATCHER
        </h1>
        <p className="text-sm text-muted-foreground font-mono">
          Compose and broadcast HTML newsletters to active subscribers
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Left Column: Editor & Log */}
        <div className="space-y-6">
          <Card className="rounded-none border-primary/25 bg-card/90">
            <CardHeader>
              <CardTitle className="font-orbitron text-sm uppercase tracking-wider text-primary flex items-center">
                <Mail className="mr-2 h-4 w-4" />
                COMPOSE_NEWSLETTER
              </CardTitle>
              <CardDescription className="font-mono text-[10px] text-muted-foreground">
                Write email contents. Raw HTML tags are supported for custom layouts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject" className="font-mono text-xs text-muted-foreground uppercase">SUBJECT</Label>
                  <Input
                    id="subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Monthly Coding Updates and Tech Stacks"
                    required
                    className="rounded-none border-primary/30 bg-secondary/50 font-mono text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content" className="font-mono text-xs text-muted-foreground uppercase flex justify-between">
                    <span>CONTENT (HTML)</span>
                    <span className="text-[10px] text-muted-foreground normal-case font-normal">Supports &lt;p&gt;, &lt;h2&gt;, &lt;a&gt;, etc.</span>
                  </Label>
                  <Textarea
                    id="content"
                    value={contentHtml}
                    onChange={(e) => setContentHtml(e.target.value)}
                    placeholder="<p>Write your newsletter body contents here...</p>"
                    required
                    className="min-h-[250px] rounded-none border-primary/30 bg-secondary/50 font-mono text-xs"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || !subject.trim() || contentHtml.trim().length < 10}
                  className="w-full rounded-none bg-primary font-mono text-xs text-primary-foreground hover:bg-primary/90"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                      DISPATCHING_CAMPAIGN...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      SEND_CAMPAIGN_NOW
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Dispatch Logs */}
          {log.length > 0 && (
            <Card className="rounded-none border-primary/25 bg-card/90">
              <CardHeader className="pb-2">
                <CardTitle className="font-orbitron text-xs uppercase tracking-wider text-muted-foreground">
                  DISPATCH_STATUS_LOGS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-black/60 border border-border/40 p-4 font-mono text-[10px] text-muted-foreground space-y-1.5 max-h-[150px] overflow-y-auto rounded-none">
                  {log.map((item, idx) => (
                    <div
                      key={idx}
                      className={
                        item.startsWith("ERROR")
                          ? "text-red-400 font-semibold"
                          : item.startsWith("SUCCESSFUL") || item.includes("complete")
                          ? "text-emerald-400 font-semibold"
                          : "text-muted-foreground"
                      }
                    >
                      &gt; {item}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Live Preview */}
        <div className="space-y-6">
          <Card className="rounded-none border-primary/25 bg-card/90 h-full flex flex-col">
            <CardHeader className="border-b border-border/40">
              <CardTitle className="font-orbitron text-sm uppercase tracking-wider text-primary flex items-center">
                <Eye className="mr-2 h-4 w-4" />
                LIVE_EMAIL_PREVIEW
              </CardTitle>
              <CardDescription className="font-mono text-[10px] text-muted-foreground">
                Simulated view of the email exactly as it will land in the subscriber's inbox
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 flex-grow flex">
              <div className="w-full min-h-[400px] border border-border/40 bg-[#0b0f19] flex">
                <iframe
                  title="Newsletter Live Preview"
                  srcDoc={wrappedPreviewHtml}
                  sandbox="allow-same-origin"
                  className="w-full flex-grow border-0 rounded-none min-h-[400px]"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
