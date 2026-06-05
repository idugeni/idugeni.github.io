import Link from "next/link";
import { PublicLayout } from "@/components/layout/public-layout";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { NeonBorder } from "@/components/ui/neon-border";
import { PageHeader } from "@/components/ui/page-header";
import { resumeData } from "@/lib/data/resume";
import { Briefcase, Download, ExternalLink, Globe, Mail, MonitorUp, Sparkles, Terminal } from "@/lib/icons";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-6 flex items-center gap-2 font-orbitron text-xl font-bold text-primary">
      <span className="h-2 w-2 animate-pulse bg-primary shadow-[0_0_12px_hsl(var(--primary))]" />
      {children}
    </h2>
  );
}

function SkillPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-sm border border-border/50 bg-secondary/70 px-2.5 py-1 font-mono text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
      {children}
    </span>
  );
}

export default function Resume() {
  return (
    <PublicLayout>
      <main className="min-h-screen pt-4 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PageHeader
            badge="Career Dossier"
            badgeIcon={<Terminal className="h-3 w-3" />}
            title="SYSTEM // RESUME"
            description="Resume profesional Eliyanto Sarage — full stack engineering, UI/UX systems, AI automation, dan production-ready web architecture."
          />

          <ScrollReveal>
            <NeonBorder className="mb-12 overflow-hidden">
              <section className="relative p-6 md:p-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.16),transparent_34%),linear-gradient(135deg,hsl(var(--card)/0.95),hsl(var(--background)/0.9))]" />
                <div className="relative grid gap-8 lg:grid-cols-[1.45fr_0.55fr] lg:items-end">
                  <div>
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.24em] text-primary">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                      Open for selected collaborations
                    </div>
                    <h1 className="font-orbitron text-4xl font-black tracking-tight text-foreground md:text-6xl">
                      {resumeData.owner}
                    </h1>
                    <p className="mt-3 font-mono text-sm uppercase tracking-[0.18em] text-primary md:text-base">
                      {resumeData.headline}
                    </p>
                    <p className="mt-6 max-w-3xl font-mono text-sm leading-7 text-muted-foreground md:text-base">
                      {resumeData.summary}
                    </p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                      <Button asChild className="rounded-none bg-primary font-mono text-primary-foreground shadow-[0_0_22px_hsl(var(--primary)/0.35)] hover:bg-primary/90">
                        <a href="/resume/download" download>
                          <Download className="mr-2 h-4 w-4" /> DOWNLOAD_PDF
                        </a>
                      </Button>
                      <Button asChild variant="outline" className="rounded-none border-primary/40 bg-background/40 font-mono text-primary hover:bg-primary/10">
                        <Link href="/contact">
                          <Mail className="mr-2 h-4 w-4" /> CONTACT_ME
                        </Link>
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-primary/20 bg-black/20 p-5 backdrop-blur-sm">
                    <div className="mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary">
                      <MonitorUp className="h-4 w-4" /> Signal Stats
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {resumeData.metrics.map((metric) => (
                        <div key={metric.label} className="rounded-lg border border-border/30 bg-card/70 p-4 text-center">
                          <div className="font-orbitron text-2xl font-bold text-primary">{metric.value}</div>
                          <div className="mt-1 font-mono text-[10px] uppercase text-muted-foreground">{metric.label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 space-y-2 border-t border-border/30 pt-5 font-mono text-xs text-muted-foreground">
                      <p className="flex items-center gap-2"><span className="text-primary">&gt;</span>{resumeData.location}</p>
                      <p className="flex items-center gap-2"><span className="text-primary">&gt;</span>{resumeData.email}</p>
                      <p className="flex items-center gap-2"><span className="text-primary">&gt;</span>{resumeData.website}</p>
                    </div>
                  </div>
                </div>
              </section>
            </NeonBorder>
          </ScrollReveal>

          <div className="grid gap-8 lg:grid-cols-[1.5fr_0.75fr]">
            <div className="space-y-8">
              <ScrollReveal>
                <NeonBorder>
                  <section className="p-6 md:p-8">
                    <SectionTitle>EXPERIENCE_TIMELINE</SectionTitle>
                    <div className="space-y-8">
                      {resumeData.experience.map((item) => (
                        <article key={`${item.role}-${item.company}`} className="relative border-l border-primary/30 pl-6">
                          <span className="absolute -left-[6.5px] top-1.5 h-3 w-3 rounded-full border border-primary bg-background shadow-[0_0_12px_hsl(var(--primary)/0.4)]" />
                          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                            <div>
                              <h3 className="font-orbitron text-lg font-bold text-foreground">{item.role}</h3>
                              <p className="font-mono text-sm text-primary">{item.company} // {item.period}</p>
                            </div>
                            <span className="w-fit rounded-full border border-border/40 bg-secondary/60 px-3 py-1 font-mono text-[10px] uppercase text-muted-foreground">
                              {item.location}
                            </span>
                          </div>
                          <p className="mt-4 font-mono text-sm leading-7 text-muted-foreground">{item.description}</p>
                          <ul className="mt-4 space-y-2">
                            {item.highlights.map((highlight) => (
                              <li key={highlight} className="flex gap-2 font-mono text-sm leading-6 text-muted-foreground">
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-primary" />
                                {highlight}
                              </li>
                            ))}
                          </ul>
                        </article>
                      ))}
                    </div>
                  </section>
                </NeonBorder>
              </ScrollReveal>

              <ScrollReveal>
                <NeonBorder>
                  <section className="p-6 md:p-8">
                    <SectionTitle>PROJECT_IMPACT</SectionTitle>
                    <div className="grid gap-4 md:grid-cols-3">
                      {resumeData.projects.map((project) => (
                        <article key={project.name} className="rounded-xl border border-border/30 bg-card/70 p-5 transition-all hover:border-primary/40 hover:shadow-[0_0_24px_hsl(var(--primary)/0.12)]">
                          <Briefcase className="mb-4 h-5 w-5 text-primary" />
                          <h3 className="font-orbitron text-sm font-bold text-foreground">{project.name}</h3>
                          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-primary">{project.category}</p>
                          <p className="mt-4 font-mono text-xs leading-6 text-muted-foreground">{project.impact}</p>
                        </article>
                      ))}
                    </div>
                  </section>
                </NeonBorder>
              </ScrollReveal>

              <ScrollReveal>
                <NeonBorder>
                  <section className="p-6 md:p-8">
                    <SectionTitle>CAPABILITY_MATRIX</SectionTitle>
                    <div className="grid gap-4 md:grid-cols-2">
                      {resumeData.capabilities.map((capability) => (
                        <article key={capability.title} className="rounded-xl border border-border/30 bg-secondary/30 p-5">
                          <Sparkles className="mb-3 h-5 w-5 text-primary" />
                          <h3 className="font-orbitron text-sm font-bold text-foreground">{capability.title}</h3>
                          <p className="mt-3 font-mono text-xs leading-6 text-muted-foreground">{capability.description}</p>
                        </article>
                      ))}
                    </div>
                  </section>
                </NeonBorder>
              </ScrollReveal>
            </div>

            <aside className="space-y-8">
              <ScrollReveal delay={120}>
                <NeonBorder>
                  <section className="p-6">
                    <SectionTitle>CORE_FOCUS</SectionTitle>
                    <ul className="space-y-3">
                      {resumeData.focusAreas.map((focus) => (
                        <li key={focus} className="flex gap-2 font-mono text-xs leading-6 text-muted-foreground">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-primary" />
                          {focus}
                        </li>
                      ))}
                    </ul>
                  </section>
                </NeonBorder>
              </ScrollReveal>

              <ScrollReveal delay={160}>
                <NeonBorder>
                  <section className="p-6">
                    <SectionTitle>TECH_STACK</SectionTitle>
                    <div className="space-y-5">
                      {resumeData.skillGroups.map((group) => (
                        <div key={group.label}>
                          <h3 className="mb-2 font-mono text-xs uppercase tracking-widest text-primary">{group.label}</h3>
                          <div className="flex flex-wrap gap-2">
                            {group.skills.map((skill) => (
                              <SkillPill key={skill}>{skill}</SkillPill>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </NeonBorder>
              </ScrollReveal>

              <ScrollReveal delay={200}>
                <NeonBorder>
                  <section className="p-6">
                    <SectionTitle>EDUCATION</SectionTitle>
                    <div className="space-y-5">
                      {resumeData.education.map((item) => (
                        <article key={item.title}>
                          <h3 className="font-orbitron text-sm font-bold text-foreground">{item.title}</h3>
                          <p className="mt-1 font-mono text-xs text-primary">{item.institution} // {item.period}</p>
                          <p className="mt-2 font-mono text-xs leading-6 text-muted-foreground">{item.description}</p>
                        </article>
                      ))}
                    </div>
                  </section>
                </NeonBorder>
              </ScrollReveal>

              <ScrollReveal delay={240}>
                <NeonBorder>
                  <section className="p-6">
                    <SectionTitle>CONTACT_LINKS</SectionTitle>
                    <div className="space-y-3 font-mono text-sm">
                      <a href={`mailto:${resumeData.email}`} className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary">
                        <Mail className="h-4 w-4 text-primary" /> {resumeData.email}
                      </a>
                      <a href={`https://${resumeData.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary">
                        <ExternalLink className="h-4 w-4 text-primary" /> {resumeData.github}
                      </a>
                      <Link href="/" className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary">
                        <Globe className="h-4 w-4 text-primary" /> {resumeData.website}
                      </Link>
                    </div>
                    <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-4 font-mono text-xs leading-6 text-muted-foreground">
                      {resumeData.availability}
                    </div>
                  </section>
                </NeonBorder>
              </ScrollReveal>
            </aside>
          </div>
        </div>
      </main>
    </PublicLayout>
  );
}
