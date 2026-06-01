import { PublicLayout } from "@/components/layout/public-layout";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { NeonBorder } from "@/components/ui/neon-border";
import { siteConfig } from "@/lib/config/site";
import { Download, Terminal } from "@/lib/icons";

export default function Resume() {
  return (
    <PublicLayout>
    <div className="pt-4 pb-16 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <h1 className="text-4xl md:text-5xl font-orbitron font-bold neon-text">SYSTEM // RESUME</h1>
            <Button className="font-mono bg-primary text-primary-foreground hover:bg-primary/90 rounded-none shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <Download className="mr-2 h-4 w-4" /> DOWNLOAD_PDF
            </Button>
          </div>
        </ScrollReveal>

        <NeonBorder className="mb-12">
          <div className="p-8 md:p-12">
            <div className="flex items-center gap-4 mb-8 border-b border-primary/20 pb-6">
              <Terminal className="w-8 h-8 text-primary" />
              <div>
                <h2 className="text-3xl font-orbitron font-bold text-primary">{siteConfig.owner.name.toUpperCase()}</h2>
                <p className="font-mono text-muted-foreground">FULL STACK DEVELOPER & AI ENGINEER</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="md:col-span-2 space-y-12">
                <section>
                  <h3 className="text-xl font-orbitron font-bold mb-6 text-primary flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary animate-pulse" /> EXPERIENCE
                  </h3>
                  <div className="space-y-8">
                    <div className="relative pl-6 border-l border-primary/30">
                      <div className="absolute w-3 h-3 bg-background border border-primary rounded-full -left-[6.5px] top-1.5" />
                      <h4 className="text-lg font-orbitron font-bold text-foreground">Senior Full Stack Developer</h4>
                      <p className="font-mono text-sm text-primary mb-2">TechCorp Indonesia // 2021 - Present</p>
                      <p className="font-mono text-sm text-muted-foreground">
                        Leading the development of highly scalable enterprise applications using React, Node.js, and PostgreSQL. Architecting microservices and implementing AI solutions to automate business processes.
                      </p>
                    </div>
                    <div className="relative pl-6 border-l border-primary/30">
                      <div className="absolute w-3 h-3 bg-background border border-primary rounded-full -left-[6.5px] top-1.5" />
                      <h4 className="text-lg font-orbitron font-bold text-foreground">UI/UX Designer</h4>
                      <p className="font-mono text-sm text-primary mb-2">CreativeStudio // 2019 - 2021</p>
                      <p className="font-mono text-sm text-muted-foreground">
                        Designed user interfaces for web and mobile applications with a focus on cyberpunk aesthetics and futuristic design systems.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-orbitron font-bold mb-6 text-primary flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary animate-pulse" /> EDUCATION
                  </h3>
                  <div className="space-y-8">
                    <div className="relative pl-6 border-l border-primary/30">
                      <div className="absolute w-3 h-3 bg-background border border-primary rounded-full -left-[6.5px] top-1.5" />
                      <h4 className="text-lg font-orbitron font-bold text-foreground">Bachelor of Computer Science</h4>
                      <p className="font-mono text-sm text-primary mb-2">University of Indonesia // 2015 - 2019</p>
                      <p className="font-mono text-sm text-muted-foreground">
                        Focus on Software Engineering and Artificial Intelligence. Graduated with Honors.
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              <div className="space-y-12">
                <section>
                  <h3 className="text-xl font-orbitron font-bold mb-6 text-primary flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary animate-pulse" /> SKILLS
                  </h3>
                  <div className="space-y-4 font-mono text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">FRONTEND</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-secondary px-2 py-1 border border-border">React</span>
                        <span className="bg-secondary px-2 py-1 border border-border">Next.js</span>
                        <span className="bg-secondary px-2 py-1 border border-border">Tailwind</span>
                        <span className="bg-secondary px-2 py-1 border border-border">TypeScript</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">BACKEND</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-secondary px-2 py-1 border border-border">Node.js</span>
                        <span className="bg-secondary px-2 py-1 border border-border">Express</span>
                        <span className="bg-secondary px-2 py-1 border border-border">PostgreSQL</span>
                        <span className="bg-secondary px-2 py-1 border border-border">Redis</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">AI/ML</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-secondary px-2 py-1 border border-border">Python</span>
                        <span className="bg-secondary px-2 py-1 border border-border">TensorFlow</span>
                        <span className="bg-secondary px-2 py-1 border border-border">OpenAI</span>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-orbitron font-bold mb-6 text-primary flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary animate-pulse" /> CONTACT
                  </h3>
                  <div className="space-y-2 font-mono text-sm text-muted-foreground">
                    <p className="flex items-center gap-2"><span className="text-primary">&gt;</span> {siteConfig.contact.email}</p>
                    <p className="flex items-center gap-2"><span className="text-primary">&gt;</span> {siteConfig.social.github.replace('https://', '')}</p>
                    <p className="flex items-center gap-2"><span className="text-primary">&gt;</span> {siteConfig.social.instagram.replace('https://www.', '')}</p>
                    <p className="flex items-center gap-2"><span className="text-primary">&gt;</span> {siteConfig.contact.address}</p>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </NeonBorder>
      </div>
    </div>
    </PublicLayout>
  );
}

