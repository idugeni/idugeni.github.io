import { PublicLayout } from "@/components/layout/public-layout";
import { JsonLdAbout } from "@/components/seo/json-ld";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { PageHeader } from "@/components/ui/page-header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Tentang Eliyanto Sarage — Full Stack Developer, UI/UX Designer & AI Engineer dengan 5+ tahun pengalaman membangun solusi digital premium.",
};
import {
  HiOutlineAcademicCap,
  HiOutlineBriefcase,
  HiOutlineCommandLine,
  HiOutlineEnvelope,
  HiOutlineCpuChip,
  HiOutlineSparkles,
  HiOutlineRocketLaunch,
  HiOutlineTrophy,
  HiOutlineGlobeAlt,
  HiOutlineLightBulb,
  HiOutlineCheckBadge,
} from "react-icons/hi2";
import {
  FiCode,
  FiDatabase,
  FiServer,
  FiLayout,
  FiGitBranch,
  FiCloud,
  FiLayers,
  FiPenTool,
} from "react-icons/fi";
import {
  SiTypescript,
  SiReact,
  SiNextdotjs,
  SiNodedotjs,
  SiPython,
  SiTailwindcss,
  SiDocker,
  SiKubernetes,
  SiTensorflow,
  SiPostgresql,
  SiFigma,
  SiFlutter,
  SiGo,
  SiRedis,
  SiSupabase,
  SiGooglecloud,
  SiPytorch,
  SiMongodb,
} from "react-icons/si";
import Link from "next/link";

const skills = {
  frontend: {
    label: "Frontend Development",
    icon: FiLayout,
    items: [
      { name: "React / Next.js", icon: SiReact },
      { name: "TypeScript", icon: SiTypescript },
      { name: "Tailwind CSS", icon: SiTailwindcss },
      { name: "Flutter", icon: SiFlutter },
    ],
  },
  backend: {
    label: "Backend Development",
    icon: FiServer,
    items: [
      { name: "Node.js", icon: SiNodedotjs },
      { name: "Python", icon: SiPython },
      { name: "Go", icon: SiGo },
      { name: "PostgreSQL", icon: SiPostgresql },
    ],
  },
  aiml: {
    label: "AI & Machine Learning",
    icon: HiOutlineCpuChip,
    items: [
      { name: "TensorFlow", icon: SiTensorflow },
      { name: "PyTorch", icon: SiPytorch },
      { name: "NLP & LLMs", icon: HiOutlineSparkles },
      { name: "Computer Vision", icon: HiOutlineLightBulb },
    ],
  },
  devops: {
    label: "DevOps & Cloud",
    icon: FiCloud,
    items: [
      { name: "Docker", icon: SiDocker },
      { name: "Kubernetes", icon: SiKubernetes },
      { name: "Google Cloud", icon: SiGooglecloud },
      { name: "CI/CD Pipelines", icon: FiGitBranch },
    ],
  },
  design: {
    label: "UI/UX Design",
    icon: FiPenTool,
    items: [
      { name: "Figma", icon: SiFigma },
      { name: "Design Systems", icon: FiLayers },
      { name: "Prototyping", icon: FiCode },
      { name: "User Research", icon: HiOutlineGlobeAlt },
    ],
  },
};

const experiences = [
  {
    period: "2022 — Sekarang",
    role: "Senior Full Stack Developer & AI Engineer",
    company: "Freelance / Independent Consultant",
    description:
      "Membangun solusi end-to-end untuk klien enterprise, termasuk AI-powered applications, custom dashboards, dan scalable microservices architecture. Fokus pada integrasi LLM dan automation workflows.",
    tech: ["Next.js", "Python", "TensorFlow", "GCP", "Docker"],
  },
  {
    period: "2020 — 2022",
    role: "Full Stack Developer",
    company: "Tech Startup, Jakarta",
    description:
      "Lead developer untuk platform SaaS dengan 50K+ pengguna aktif. Merancang dan mengimplementasikan arsitektur microservices, real-time features, dan payment integration.",
    tech: ["React", "Node.js", "PostgreSQL", "Redis", "Kubernetes"],
  },
  {
    period: "2019 — 2020",
    role: "Frontend Developer & UI/UX Designer",
    company: "Digital Agency, Surabaya",
    description:
      "Bertanggung jawab atas design system dan frontend architecture untuk 10+ client projects. Meningkatkan conversion rate rata-rata 35% melalui data-driven UI improvements.",
    tech: ["React", "TypeScript", "Figma", "Tailwind CSS", "Flutter"],
  },
  {
    period: "2018 — 2019",
    role: "Junior Web Developer",
    company: "Software House, Bandung",
    description:
      "Memulai karir profesional dengan fokus pada web development. Berkontribusi pada berbagai proyek client mulai dari company profile hingga e-commerce platform.",
    tech: ["JavaScript", "PHP", "MySQL", "Laravel", "Vue.js"],
  },
];

const education = [
  {
    degree: "Machine Learning Specialization",
    institution: "Stanford Online (Coursera)",
    year: "2021",
    note: "Deep Learning & Neural Networks",
  },
  {
    degree: "Self-Taught Developer",
    institution: "Online Courses & Open Source",
    year: "2018 — Sekarang",
    note: "Continuous learning & building",
  },
];

const certifications = [
  {
    name: "Google Cloud Professional Cloud Architect",
    issuer: "Google Cloud",
    year: "2023",
  },
  {
    name: "AWS Certified Solutions Architect",
    issuer: "Amazon Web Services",
    year: "2022",
  },
  {
    name: "TensorFlow Developer Certificate",
    issuer: "Google",
    year: "2022",
  },
  {
    name: "Meta Front-End Developer Professional Certificate",
    issuer: "Meta",
    year: "2021",
  },
];

export default function About() {
  return (
    <PublicLayout>
      <JsonLdAbout />
      <div className="pt-4 pb-20 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Header */}
          <PageHeader
            badge="~/about --profile"
            badgeIcon={<HiOutlineCommandLine className="w-4 h-4" />}
            title="ABOUT_ME"
            description="Full Stack Developer • UI/UX Designer • AI Engineer — 5+ tahun pengalaman membangun solusi digital."
          />

          {/* Bio Section */}
          <ScrollReveal direction="up" delay={100}>
            <section className="glass-card p-6 md:p-8 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <HiOutlineSparkles className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl md:text-2xl font-orbitron text-primary">
                  SYSTEM.INIT
                </h2>
              </div>
              <div className="font-mono text-sm md:text-base text-muted-foreground leading-relaxed space-y-4">
                <p>
                  Halo! Saya Eliyanto Sarage — seorang developer yang passionate
                  dalam membangun digital experiences yang tidak hanya fungsional,
                  tapi juga memukau secara visual. Dengan lebih dari 5 tahun
                  pengalaman di industri teknologi, saya menggabungkan keahlian
                  dalam full-stack development, AI engineering, dan UI/UX design
                  untuk menciptakan solusi yang truly impactful.
                </p>
                <p>
                  Saya percaya bahwa teknologi terbaik adalah yang invisible —
                  bekerja seamlessly di balik layar sambil memberikan pengalaman
                  yang intuitive bagi pengguna. Dari architecting scalable backend
                  systems hingga crafting pixel-perfect interfaces, setiap line of
                  code yang saya tulis bertujuan untuk solve real problems.
                </p>
                <p>
                  Currently exploring the intersection of AI dan human-centered
                  design, building tools yang empower people to do more with less
                  effort.
                </p>
              </div>
            </section>
          </ScrollReveal>

          {/* Skills & Expertise */}
          <ScrollReveal direction="up" delay={150}>
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <FiCode className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl md:text-2xl font-orbitron text-primary">
                  TECH_STACK
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(skills).map(([key, category]) => (
                  <div
                    key={key}
                    className="glass-card p-5 hover:border-primary/40 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <category.icon className="w-5 h-5 text-primary group-hover:text-primary/80 transition-colors" />
                      <h3 className="font-orbitron text-sm text-primary/90">
                        {category.label}
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {category.items.map((item) => (
                        <div
                          key={item.name}
                          className="flex items-center gap-2.5 text-sm font-mono text-muted-foreground"
                        >
                          <item.icon className="w-4 h-4 text-primary/70" />
                          <span>{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </ScrollReveal>

          {/* Experience Timeline */}
          <ScrollReveal direction="up" delay={200}>
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <HiOutlineBriefcase className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl md:text-2xl font-orbitron text-primary">
                  EXPERIENCE_LOG
                </h2>
              </div>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[19px] top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent hidden md:block" />

                <div className="space-y-6">
                  {experiences.map((exp, index) => (
                    <ScrollReveal key={index} direction="left" delay={index * 100}>
                      <div className="glass-card p-5 md:p-6 md:ml-12 relative">
                        {/* Timeline dot */}
                        <div className="absolute -left-[calc(3rem+7px)] top-6 w-3.5 h-3.5 rounded-full bg-primary border-2 border-background shadow-glow-xs hidden md:block" />

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                          <h3 className="font-orbitron text-base text-primary">
                            {exp.role}
                          </h3>
                          <span className="text-xs font-mono text-primary/70 mt-1 md:mt-0">
                            {exp.period}
                          </span>
                        </div>
                        <p className="text-sm font-mono text-primary/60 mb-3">
                          @ {exp.company}
                        </p>
                        <p className="text-sm font-mono text-muted-foreground leading-relaxed mb-4">
                          {exp.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {exp.tech.map((t) => (
                            <span
                              key={t}
                              className="px-2.5 py-1 text-xs font-mono rounded-md bg-primary/10 border border-primary/20 text-primary/80"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </section>
          </ScrollReveal>

          {/* Education */}
          <ScrollReveal direction="up" delay={200}>
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <HiOutlineAcademicCap className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl md:text-2xl font-orbitron text-primary">
                  EDUCATION
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {education.map((edu, index) => (
                  <div key={index} className="glass-card p-5 md:p-6">
                    <h3 className="font-orbitron text-sm text-primary mb-1">
                      {edu.degree}
                    </h3>
                    <p className="text-sm font-mono text-primary/60 mb-2">
                      {edu.institution}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-muted-foreground">
                        {edu.note}
                      </span>
                      <span className="text-xs font-mono text-primary/50">
                        {edu.year}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </ScrollReveal>

          {/* Certifications */}
          <ScrollReveal direction="up" delay={200}>
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <HiOutlineTrophy className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl md:text-2xl font-orbitron text-primary">
                  CERTIFICATIONS
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certifications.map((cert, index) => (
                  <div
                    key={index}
                    className="glass-card p-5 flex items-start gap-4 hover:border-primary/40 transition-all duration-300"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <HiOutlineCheckBadge className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-mono text-sm text-primary/90 font-medium">
                        {cert.name}
                      </h3>
                      <p className="text-xs font-mono text-muted-foreground mt-1">
                        {cert.issuer}{" "}
                        <span className="text-primary/50">• {cert.year}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </ScrollReveal>

          {/* Philosophy */}
          <ScrollReveal direction="up" delay={200}>
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <HiOutlineLightBulb className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl md:text-2xl font-orbitron text-primary">
                  PHILOSOPHY
                </h2>
              </div>
              <div className="glass-card p-6 md:p-8">
                <div className="font-mono text-sm md:text-base text-muted-foreground leading-relaxed space-y-4">
                  <p className="text-primary/80 italic border-l-2 border-primary/40 pl-4">
                    &quot;Code is poetry written for machines to execute and humans to
                    understand. The best software is invisible — it just works.&quot;
                  </p>
                  <p>
                    Pendekatan saya dalam development selalu dimulai dari{" "}
                    <span className="text-primary">empathy</span> — memahami
                    kebutuhan user sebelum menulis satu baris kode pun. Saya
                    menerapkan prinsip{" "}
                    <span className="text-primary">iterative refinement</span>,
                    dimana setiap solusi terus disempurnakan berdasarkan feedback
                    dan data.
                  </p>
                  <p>
                    Saya percaya pada kekuatan{" "}
                    <span className="text-primary">open source</span> dan
                    knowledge sharing. Teknologi berkembang paling cepat ketika kita
                    berkolaborasi, bukan berkompetisi. Setiap project adalah
                    kesempatan untuk belajar sesuatu yang baru dan push the
                    boundaries of what&apos;s possible.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-primary/10">
                    <div className="text-center">
                      <div className="text-2xl font-orbitron text-primary mb-1">
                        50+
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Projects Delivered
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-orbitron text-primary mb-1">
                        30+
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Happy Clients
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-orbitron text-primary mb-1">
                        5+
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Years of Experience
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </ScrollReveal>

          {/* CTA */}
          <ScrollReveal direction="up" delay={250}>
            <section className="text-center py-8">
              <div className="glass-card p-8 md:p-12 relative overflow-hidden">
                {/* Background glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

                <div className="relative z-10">
                  <HiOutlineRocketLaunch className="w-10 h-10 text-primary mx-auto mb-4" />
                  <h2 className="text-2xl md:text-3xl font-orbitron text-primary mb-3">
                    READY TO BUILD?
                  </h2>
                  <p className="font-mono text-sm md:text-base text-muted-foreground max-w-lg mx-auto mb-6">
                    Punya project menarik atau ingin berkolaborasi? Let&apos;s
                    connect dan wujudkan ide Anda menjadi kenyataan digital.
                  </p>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary/10 border border-primary/40 text-primary font-mono text-sm hover:bg-primary/20 hover:border-primary/60 hover:shadow-glow-sm transition-all duration-300"
                  >
                    <HiOutlineEnvelope className="w-4 h-4" />
                    <span>INITIATE_CONTACT</span>
                  </Link>
                </div>
              </div>
            </section>
          </ScrollReveal>
        </div>
      </div>
    </PublicLayout>
  );
}
