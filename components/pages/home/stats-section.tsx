import { HiOutlineBolt } from "react-icons/hi2";
import { IoRocketOutline } from "react-icons/io5";
import { FiUsers } from "react-icons/fi";
import { VscTools } from "react-icons/vsc";

const stats = [
  { label: "YEARS_EXP", value: "05", suffix: "+", desc: "Pengalaman profesional", icon: <HiOutlineBolt className="w-6 h-6 text-primary" /> },
  { label: "PROJECTS", value: "50", suffix: "+", desc: "Project delivered", icon: <IoRocketOutline className="w-6 h-6 text-primary" /> },
  { label: "CLIENTS", value: "30", suffix: "+", desc: "Klien terlayani", icon: <FiUsers className="w-6 h-6 text-primary" /> },
  { label: "TECH_STACK", value: "25", suffix: "+", desc: "Teknologi dikuasai", icon: <VscTools className="w-6 h-6 text-primary" /> },
];

export function StatsSection() {
  return (
    <section className="py-24 relative section-fade bg-gradient-to-b from-background via-card/40 to-background before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,hsl(var(--primary)/0.03),transparent)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="sr-reveal">
          <div className="text-center mb-16">
            <span className="font-mono text-xs text-primary/70 tracking-widest">// PERFORMANCE OVERVIEW</span>
            <h2 className="text-3xl md:text-4xl font-orbitron font-bold neon-text mt-2">SYSTEM_METRICS</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="sr-reveal" style={{ transitionDelay: `${i * 100}ms` }}>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/5 rounded-sm opacity-0 group-hover:opacity-100 blur transition-opacity duration-500" />
                <div className="relative bg-background border border-border/50 group-hover:border-primary/50 p-6 md:p-8 text-center transition-all duration-300">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-10 h-10 mx-auto mb-3 rounded bg-primary/10 border border-primary/30 flex items-center justify-center">{stat.icon}</div>
                  <div className="flex items-baseline justify-center gap-1 mb-1">
                    <span className="text-4xl md:text-5xl font-orbitron font-bold text-primary group-hover:drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)] transition-all">{stat.value}</span>
                    <span className="text-xl md:text-2xl font-orbitron font-bold text-primary/60">{stat.suffix}</span>
                  </div>
                  <div className="font-mono text-[10px] tracking-widest text-primary/80 mb-1">{stat.label}</div>
                  <div className="font-mono text-[10px] text-muted-foreground/60">{stat.desc}</div>
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-primary/20 group-hover:border-primary/50 transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
