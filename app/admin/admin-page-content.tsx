import { Suspense } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { getAdminDashboardOverview } from "@/actions/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, BarChart, Briefcase, Eye, FileText, ImageIcon, Loader2Icon, Mail, MessageSquare, Plus, Star, Target, Users } from "@/lib/icons";

function compact(value: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function ago(value: string | null | undefined) {
  if (!value) return "-";
  return formatDistanceToNow(new Date(value), { addSuffix: true });
}

function SectionFallback() {
  return <div className="h-24 animate-pulse rounded border border-border/50 bg-primary/5" />;
}

async function OverviewStats() {
  let overview;
  try {
    overview = await getAdminDashboardOverview();
  } catch {
    overview = {
      stats: { blog: { total: 0, published: 0, draft: 0 }, projects: { total: 0, active: 0, inactive: 0 }, messages: { total: 0, unread: 0 }, subscribers: 0 },
      analytics: { totalViews: 0, viewsThisMonth: 0, viewsPreviousMonth: 0, viewsThisWeek: 0, viewsToday: 0, growthPercent: 0, avgPerDay: 0, mostVisitedPage: "/", mostVisitedPageViews: 0 },
      topPages: [],
      latestMessages: [],
      latestArticles: [],
      latestProjects: [],
      newsletter: { total: 0, active: 0, inactive: 0 },
      testimonials: { total: 0, visible: 0, featured: 0, averageRating: 0 },
      services: { total: 0, active: 0, inactive: 0 },
      gallery: { total: 0 },
    };
  }

  const cards = [
    { label: "TOTAL_VIEWS", value: compact(overview.analytics.totalViews), icon: Eye, tone: "text-primary" },
    { label: "TODAY", value: compact(overview.analytics.viewsToday), icon: Activity, tone: "text-emerald-400" },
    { label: "MONTH", value: compact(overview.analytics.viewsThisMonth), icon: BarChart, tone: "text-blue-400" },
    { label: "UNREAD", value: compact(overview.stats.messages.unread), icon: MessageSquare, tone: "text-amber-400" },
    { label: "ARTICLES", value: compact(overview.stats.blog.total), icon: FileText, tone: "text-violet-400" },
    { label: "PROJECTS", value: compact(overview.stats.projects.total), icon: Briefcase, tone: "text-pink-400" },
    { label: "NEWSLETTER", value: compact(overview.newsletter.active), icon: Users, tone: "text-primary" },
    { label: "GALLERY", value: compact(overview.gallery.total), icon: ImageIcon, tone: "text-orange-400" },
  ];

  const health = [
    ["Database", "ONLINE", "text-emerald-400"],
    ["Analytics", overview.analytics.viewsToday > 0 ? "LIVE" : "IDLE", overview.analytics.viewsToday > 0 ? "text-emerald-400" : "text-amber-400"],
    ["Messages", overview.stats.messages.unread > 0 ? `${overview.stats.messages.unread} UNREAD` : "CLEAR", overview.stats.messages.unread > 0 ? "text-amber-400" : "text-emerald-400"],
    ["Content", `${overview.stats.blog.published}/${overview.stats.blog.total} PUBLISHED`, "text-primary"],
  ];

  return (
    <>
      <section className="relative overflow-hidden rounded-none border border-primary/20 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.18),transparent_35%),hsl(var(--card)/0.88)] p-4 md:p-6">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-xs uppercase tracking-[0.35em] text-primary">ADMIN_COMMAND_CENTER</p>
            <h1 className="mt-2 font-orbitron text-2xl font-black text-foreground md:text-3xl lg:text-4xl">SYSTEM_OVERVIEW</h1>
            <p className="mt-2 max-w-2xl font-mono text-xs text-muted-foreground sm:text-sm">Live operational telemetry, content status, messages, analytics, and quick controls from the production database.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 font-mono text-xs sm:grid-cols-4 lg:w-[520px] lg:shrink-0">
            {health.map(([label, value, tone]) => (
              <div key={label} className="border border-border/50 bg-background/40 p-3">
                <div className="text-muted-foreground">{label}</div>
                <div className={tone}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label} className="rounded-none border-border/50 bg-card/80">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-mono text-xs font-normal tracking-wider text-muted-foreground">{card.label}</CardTitle>
              <card.icon className={`h-4 w-4 ${card.tone}`} />
            </CardHeader>
            <CardContent>
              <div className="break-words font-orbitron text-3xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-none border-border/50 bg-card/80">
          <CardHeader><CardTitle className="font-orbitron text-primary">QUICK_ACTIONS</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Button asChild className="h-auto justify-start rounded-none p-4 font-mono"><Link href="/admin/blog/new"><Plus className="mr-2 h-4 w-4" />NEW_BLOG</Link></Button>
            <Button asChild variant="outline" className="h-auto justify-start rounded-none p-4 font-mono"><Link href="/admin/projects/new"><Plus className="mr-2 h-4 w-4" />NEW_PROJECT</Link></Button>
            <Button asChild variant="outline" className="h-auto justify-start rounded-none p-4 font-mono"><Link href="/admin/messages"><Mail className="mr-2 h-4 w-4" />READ_MESSAGES</Link></Button>
            <Button asChild variant="outline" className="h-auto justify-start rounded-none p-4 font-mono"><Link href="/admin/analytics"><BarChart className="mr-2 h-4 w-4" />ANALYTICS</Link></Button>
          </CardContent>
        </Card>
        <Card className="rounded-none border-border/50 bg-card/80">
          <CardHeader><CardTitle className="font-orbitron text-primary">TRAFFIC_SIGNAL</CardTitle></CardHeader>
          <CardContent className="space-y-3 font-mono text-sm">
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Most visited</span><span className="break-all text-right text-primary">{overview.analytics.mostVisitedPage}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Growth</span><span className={overview.analytics.growthPercent >= 0 ? "text-emerald-400" : "text-red-400"}>{overview.analytics.growthPercent}%</span></div>
            {overview.topPages.map((page) => (
              <div key={page.halaman} className="grid gap-1">
                <div className="flex justify-between gap-3 text-xs"><span className="break-all text-muted-foreground">{page.halaman}</span><span>{page.share}%</span></div>
                <div className="h-1 bg-secondary"><div className="h-full bg-primary" style={{ width: `${Math.min(Math.max(page.share, 0), 100)}%` }} /></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Card className="rounded-none border-border/50 bg-card/80">
          <CardHeader><CardTitle className="font-orbitron text-primary">RECENT_MESSAGES</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {overview.latestMessages.length === 0 ? <p className="font-mono text-sm text-muted-foreground">NO_MESSAGES</p> : overview.latestMessages.map((msg: { id: string; nama: string; subjek: string; dibaca: boolean; created_at: string }) => (
              <Link key={msg.id} href="/admin/messages" className="block border border-border/50 p-3 transition-colors hover:border-primary/40">
                <div className="flex justify-between gap-3 font-mono text-xs"><span className="break-words font-medium">{msg.subjek}</span><span className={msg.dibaca ? "text-muted-foreground" : "text-amber-400"}>{msg.dibaca ? "READ" : "UNREAD"}</span></div>
                <p className="mt-1 break-words font-mono text-xs text-muted-foreground">{msg.nama} · {ago(msg.created_at)}</p>
              </Link>
            ))}
          </CardContent>
        </Card>
        <Card className="rounded-none border-border/50 bg-card/80">
          <CardHeader><CardTitle className="font-orbitron text-primary">LATEST_ARTICLES</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {overview.latestArticles.map((article: { id: string; judul: string; slug: string; status: string; jumlah_view: number; created_at: string }) => (
              <Link key={article.id} href={`/admin/blog/${article.slug}/edit`} className="block border border-border/50 p-3 hover:border-primary/40">
                <div className="flex items-start gap-2 font-mono text-xs"><FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span className="break-words font-medium">{article.judul}</span></div>
                <p className="mt-1 font-mono text-xs text-muted-foreground">{article.status.toUpperCase()} · {compact(article.jumlah_view)} views · {ago(article.created_at)}</p>
              </Link>
            ))}
          </CardContent>
        </Card>
        <Card className="rounded-none border-border/50 bg-card/80">
          <CardHeader><CardTitle className="font-orbitron text-primary">LATEST_PROJECTS</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {overview.latestProjects.map((project: { id: string; nama: string; slug: string; status: string; created_at: string }) => (
              <Link key={project.id} href={`/admin/projects/${project.id}/edit`} className="block border border-border/50 p-3 hover:border-primary/40">
                <div className="flex items-start gap-2 font-mono text-xs"><Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span className="break-words font-medium">{project.nama}</span></div>
                <p className="mt-1 font-mono text-xs text-muted-foreground">{project.status} · {ago(project.created_at)}</p>
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-none border-border/50 bg-card/80"><CardHeader><CardTitle className="font-orbitron text-sm text-primary">NEWSLETTER</CardTitle></CardHeader><CardContent className="font-mono text-sm text-muted-foreground">{overview.newsletter.active} active / {overview.newsletter.total} total</CardContent></Card>
        <Card className="rounded-none border-border/50 bg-card/80"><CardHeader><CardTitle className="font-orbitron text-sm text-primary">TESTIMONIALS</CardTitle></CardHeader><CardContent className="font-mono text-sm text-muted-foreground">{overview.testimonials.visible} visible · {overview.testimonials.featured} featured · {overview.testimonials.averageRating}/5 avg <Star className="inline h-3 w-3 text-amber-400" /></CardContent></Card>
        <Card className="rounded-none border-border/50 bg-card/80"><CardHeader><CardTitle className="font-orbitron text-sm text-primary">SERVICES</CardTitle></CardHeader><CardContent className="font-mono text-sm text-muted-foreground">{overview.services.active} active / {overview.services.total} total</CardContent></Card>
      </section>
    </>
  );
}

export async function AdminPageContent() {
  return (
    <div className="space-y-8">
      <Suspense fallback={<SectionFallback />}>
        <OverviewStats />
      </Suspense>
    </div>
  );
}
