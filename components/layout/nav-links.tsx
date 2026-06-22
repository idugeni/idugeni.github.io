import { FiCode, FiBriefcase, FiSmartphone, FiCloud, FiCpu, FiMessageSquare, FiFolder, FiStar, FiGitBranch, FiImage, FiVideo, FiAward, FiBookOpen, FiTrendingUp, FiLayers } from "react-icons/fi";

export type MegaMenuItem = {
  href: string;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
};

export type NavItem = {
  href: string;
  label: string;
  megaMenu?: MegaMenuItem[];
};

export const navLinks: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  {
    href: "/projects",
    label: "Projects",
    megaMenu: [
      { href: "/projects", label: "All Projects", desc: "Lihat semua portfolio proyek", icon: FiFolder },
      { href: "/projects?status=completed", label: "Completed", desc: "Proyek yang telah selesai", icon: FiStar },
      { href: "/projects?category=Web App", label: "Web Apps", desc: "Aplikasi web full-stack", icon: FiCode },
      { href: "/projects?category=Mobile App", label: "Mobile Apps", desc: "Aplikasi iOS & Android", icon: FiSmartphone },
      { href: "/projects?category=AI", label: "AI / ML", desc: "Machine learning & AI projects", icon: FiCpu },
      { href: "/projects?status=ongoing", label: "Ongoing", desc: "Proyek yang sedang berjalan", icon: FiGitBranch },
    ],
  },
  {
    href: "/services",
    label: "Services",
    megaMenu: [
      { href: "/services/web-development", label: "Web Development", desc: "Aplikasi web modern & scalable", icon: FiCode },
      { href: "/services/ai-ml-integration", label: "AI & ML Integration", desc: "Chatbot, NLP, dan predictive analytics", icon: FiCpu },
      { href: "/services/ui-ux-design", label: "UI/UX Design", desc: "Desain antarmuka yang beautiful", icon: FiBriefcase },
      { href: "/services/mobile-development", label: "Mobile Development", desc: "Cross-platform iOS & Android", icon: FiSmartphone },
      { href: "/services/devops-cloud", label: "DevOps & Cloud", desc: "Infrastructure & CI/CD pipeline", icon: FiCloud },
      { href: "/services/technical-consulting", label: "Technical Consulting", desc: "Arsitektur & code review", icon: FiMessageSquare },
    ],
  },
  {
    href: "/blog",
    label: "Blog",
    megaMenu: [
      { href: "/blog", label: "All Articles", desc: "Semua artikel & tutorial", icon: FiBookOpen },
      { href: "/blog?cat=web-development", label: "Web Development", desc: "Tips & tutorial web dev", icon: FiCode },
      { href: "/blog?cat=artificial-intelligence", label: "AI & Machine Learning", desc: "Eksplorasi dunia AI", icon: FiCpu },
      { href: "/blog?cat=ui-ux-design", label: "UI/UX Design", desc: "Design tips & trends", icon: FiLayers },
      { href: "/blog?cat=devops-cloud", label: "DevOps & Cloud", desc: "Infrastructure & deployment", icon: FiCloud },
      { href: "/blog?cat=mobile-development", label: "Mobile Dev", desc: "React Native & Flutter", icon: FiSmartphone },
    ],
  },
  {
    href: "/gallery",
    label: "Gallery",
    megaMenu: [
      { href: "/gallery", label: "All Media", desc: "Semua foto & video", icon: FiImage },
      { href: "/gallery?filter=workspace", label: "Workspace", desc: "Setup & environment kerja", icon: FiFolder },
      { href: "/gallery?filter=event", label: "Events", desc: "Conference & workshop", icon: FiTrendingUp },
      { href: "/gallery?filter=achievement", label: "Achievements", desc: "Penghargaan & sertifikasi", icon: FiAward },
      { href: "/gallery?filter=team", label: "Team", desc: "Kolaborasi & team building", icon: FiBriefcase },
      { href: "/gallery?filter=video", label: "Videos", desc: "Demo & presentasi video", icon: FiVideo },
    ],
  },
];
