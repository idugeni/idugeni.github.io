import {
  SiTypescript,
  SiReact,
  SiNextdotjs,
  SiNodedotjs,
  SiPython,
  SiGo,
  SiPostgresql,
  SiSupabase,
  SiDocker,
  SiKubernetes,
  SiTailwindcss,
  SiFlutter,
  SiTensorflow,
  SiFigma,
  SiRedis,
} from "react-icons/si";
import { FaAws } from "react-icons/fa";

const techStack = [
  { name: "TypeScript", icon: SiTypescript, color: "#3178C6" },
  { name: "React", icon: SiReact, color: "#61DAFB" },
  { name: "Next.js", icon: SiNextdotjs, color: "#ffffff" },
  { name: "Node.js", icon: SiNodedotjs, color: "#339933" },
  { name: "Python", icon: SiPython, color: "#3776AB" },
  { name: "Go", icon: SiGo, color: "#00ADD8" },
  { name: "PostgreSQL", icon: SiPostgresql, color: "#4169E1" },
  { name: "Supabase", icon: SiSupabase, color: "#3FCF8E" },
  { name: "Docker", icon: SiDocker, color: "#2496ED" },
  { name: "Kubernetes", icon: SiKubernetes, color: "#326CE5" },
  { name: "AWS", icon: FaAws, color: "#FF9900" },
  { name: "Tailwind", icon: SiTailwindcss, color: "#06B6D4" },
  { name: "Flutter", icon: SiFlutter, color: "#02569B" },
  { name: "TensorFlow", icon: SiTensorflow, color: "#FF6F00" },
  { name: "Figma", icon: SiFigma, color: "#F24E1E" },
  { name: "Redis", icon: SiRedis, color: "#DC382D" },
];

function CircuitFlow() {
  const colors = [
    "#2EB9DF", "#06B6D4", "#3B82F6", "#A855F7",
    "#DF6CF6", "#FF4A81", "#FF7432", "#F7CC4B",
    "#10B981", "#34D399", "#8B5CF6", "#EC4899",
    "#0EA5E9", "#14B8A6", "#F59E0B", "#EF4444",
  ];

  // 16 paths — 2 per card column, all with unique zigzag routes, no overlapping
  // Each pair ends at offset x (col center ±8) so they never touch
  // Chip exits from y=82 (top side) and y=115 (bottom side), spread across x=358-442
  const paths = [
    // Col 1 — path A (end x=42): exits chip top-left, goes up, bends left, drops down, bends left again, drops to card
    { d: "M 358 82 L 280 82 C 277 82 275 84 275 87 L 275 120 C 275 123 273 125 270 125 L 47 125 C 44 125 42 127 42 130 L 42 200", dur: "3.4s", delay: "0s" },
    // Col 1 — path B (end x=58): exits chip bottom-left, drops, bends left, goes horizontal, bends down, horizontal again, drops
    { d: "M 365 115 L 365 148 C 365 151 363 153 360 153 L 120 153 C 117 153 115 155 115 158 L 115 172 C 115 175 113 177 110 177 L 63 177 C 60 177 58 179 58 182 L 58 200", dur: "4.5s", delay: "1.8s" },
    // Col 2 — path A (end x=143): exits chip top, bends left, drops, bends left, drops to card
    { d: "M 362 78 L 220 78 C 217 78 215 80 215 83 L 215 108 C 215 111 213 113 210 113 L 148 113 C 145 113 143 115 143 118 L 143 200", dur: "3s", delay: "0.6s" },
    // Col 2 — path B (end x=157): exits chip bottom, drops, bends left, horizontal, bends down, bends left, drops
    { d: "M 372 115 L 372 135 C 372 138 370 140 367 140 L 195 140 C 192 140 190 142 190 145 L 190 162 C 190 165 188 167 185 167 L 162 167 C 159 167 157 169 157 172 L 157 200", dur: "4s", delay: "2.4s" },
    // Col 3 — path A (end x=243): exits chip top, short horizontal left, drops, bends left, drops
    { d: "M 368 75 L 310 75 C 307 75 305 77 305 80 L 305 98 C 305 101 303 103 300 103 L 248 103 C 245 103 243 105 243 108 L 243 200", dur: "2.8s", delay: "0.9s" },
    // Col 3 — path B (end x=257): exits chip bottom, drops, bends left, horizontal, drops, bends left, drops
    { d: "M 378 115 L 378 130 C 378 133 376 135 373 135 L 295 135 C 292 135 290 137 290 140 L 290 158 C 290 161 288 163 285 163 L 262 163 C 259 163 257 165 257 168 L 257 200", dur: "3.6s", delay: "2.7s" },
    // Col 4 — path A (end x=343): exits chip top, goes up, bends left, drops all the way
    { d: "M 380 82 L 380 65 C 380 62 378 60 375 60 L 348 60 C 345 60 343 62 343 65 L 343 200", dur: "2.5s", delay: "1.3s" },
    // Col 4 — path B (end x=357): exits chip bottom, drops, bends left slightly, drops
    { d: "M 388 115 L 388 138 C 388 141 386 143 383 143 L 362 143 C 359 143 357 145 357 148 L 357 200", dur: "2.8s", delay: "0.4s" },
    // Col 5 — path A (end x=443): exits chip bottom, drops, bends right slightly, drops
    { d: "M 412 115 L 412 138 C 412 141 414 143 417 143 L 438 143 C 441 143 443 145 443 148 L 443 200", dur: "2.8s", delay: "1.6s" },
    // Col 5 — path B (end x=457): exits chip top, goes up, bends right, drops all the way
    { d: "M 420 82 L 420 65 C 420 62 422 60 425 60 L 452 60 C 455 60 457 62 457 65 L 457 200", dur: "2.5s", delay: "0.5s" },
    // Col 6 — path A (end x=543): exits chip bottom, drops, bends right, horizontal, drops, bends right, drops
    { d: "M 422 115 L 422 130 C 422 133 424 135 427 135 L 505 135 C 508 135 510 137 510 140 L 510 158 C 510 161 512 163 515 163 L 538 163 C 541 163 543 165 543 168 L 543 200", dur: "3.6s", delay: "2.9s" },
    // Col 6 — path B (end x=557): exits chip top, short horizontal right, drops, bends right, drops
    { d: "M 432 75 L 490 75 C 493 75 495 77 495 80 L 495 98 C 495 101 497 103 500 103 L 552 103 C 555 103 557 105 557 108 L 557 200", dur: "2.8s", delay: "1.1s" },
    // Col 7 — path A (end x=643): exits chip bottom, drops, bends right, horizontal, bends down, bends right, drops
    { d: "M 428 115 L 428 135 C 428 138 430 140 433 140 L 605 140 C 608 140 610 142 610 145 L 610 162 C 610 165 612 167 615 167 L 638 167 C 641 167 643 169 643 172 L 643 200", dur: "4s", delay: "2.2s" },
    // Col 7 — path B (end x=657): exits chip top, horizontal right, drops, bends right, drops to card
    { d: "M 438 78 L 580 78 C 583 78 585 80 585 83 L 585 108 C 585 111 587 113 590 113 L 652 113 C 655 113 657 115 657 118 L 657 200", dur: "3s", delay: "0.3s" },
    // Col 8 — path A (end x=742): exits chip bottom, drops, bends right, horizontal, bends down, horizontal, bends down, drops
    { d: "M 435 115 L 435 148 C 435 151 437 153 440 153 L 680 153 C 683 153 685 155 685 158 L 685 172 C 685 175 687 177 690 177 L 737 177 C 740 177 742 179 742 182 L 742 200", dur: "4.5s", delay: "2s" },
    // Col 8 — path B (end x=758): exits chip top-right, horizontal, drops, bends right, horizontal, bends down, drops
    { d: "M 442 82 L 520 82 C 523 82 525 84 525 87 L 525 120 C 525 123 527 125 530 125 L 753 125 C 756 125 758 127 758 130 L 758 200", dur: "3.4s", delay: "0.8s" },
  ];

  return (
    <div className="relative w-full my-8 flex flex-col items-center justify-center">
      <svg
        className="w-full max-w-7xl px-4 overflow-hidden"
        fill="none"
        viewBox="0 0 800 200"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {paths.map((_, i) => (
            <linearGradient key={`grad-${i}`} id={`beam-grad-${i}`} gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={colors[i]} stopOpacity="0" />
              <stop offset="65%" stopColor={colors[i]} stopOpacity="0.6" />
              <stop offset="100%" stopColor={colors[i]} stopOpacity="1" />
            </linearGradient>
          ))}
        </defs>

        {/* Static subtle paths */}
        {paths.map((p, i) => (
          <path key={`static-${i}`} d={p.d} stroke="currentColor" strokeOpacity="0.05" className="text-foreground" />
        ))}

        {/* Animated beam paths */}
        {paths.map((p, i) => (
          <path
            key={`beam-${i}`}
            d={p.d}
            stroke={`url(#beam-grad-${i})`}
            strokeWidth="1.5"
            strokeLinecap="round"
            pathLength="1"
            strokeDasharray="0.1 0.9"
            strokeDashoffset="1"
          >
            <animate
              attributeName="stroke-dashoffset"
              values="1;0"
              dur={p.dur}
              begin={p.delay}
              repeatCount="indefinite"
            />
          </path>
        ))}
      </svg>

      {/* CPU Chip */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%]">
        <div className="relative flex flex-col items-center">
          <div className="flex gap-1 mb-0.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={`top-${i}`} className="w-1.5 h-2 bg-foreground/20 rounded-sm" />
            ))}
          </div>
          <div className="relative flex items-center px-5 py-2.5 bg-card border border-foreground/10 rounded-md">
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 flex flex-col gap-1">
              <span className="w-2 h-1.5 bg-foreground/20 rounded-sm" />
              <span className="w-2 h-1.5 bg-foreground/20 rounded-sm" />
              <span className="w-2 h-1.5 bg-foreground/20 rounded-sm" />
            </div>
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1">
              <span className="w-2 h-1.5 bg-foreground/20 rounded-sm" />
              <span className="w-2 h-1.5 bg-foreground/20 rounded-sm" />
              <span className="w-2 h-1.5 bg-foreground/20 rounded-sm" />
            </div>
            <div className="absolute inset-0 rounded-md bg-gradient-to-br from-white/5 to-transparent" />
            <span className="font-mono text-xs text-foreground/70 tracking-wider">STACK</span>
          </div>
          <div className="flex gap-1 mt-0.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={`bot-${i}`} className="w-1.5 h-2 bg-foreground/20 rounded-sm" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TechStackSection() {
  return (
    <section className="py-24 relative overflow-hidden bg-[radial-gradient(ellipse_150%_100%_at_50%_10%,hsl(var(--card)/0.8),hsl(var(--background)))] before:absolute before:inset-0 before:bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,hsl(var(--primary)/0.02)_60deg,transparent_120deg,hsl(var(--accent)/0.02)_180deg,transparent_240deg,hsl(var(--primary)/0.02)_300deg,transparent_360deg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="sr-reveal">
          <div className="text-center mb-4">
            <span className="font-mono text-[10px] text-primary/70 tracking-widest">// CORE TECHNOLOGIES</span>
            <h2 className="text-3xl md:text-4xl font-orbitron font-bold neon-text mt-2">TECH_ARSENAL</h2>
            <p className="text-muted-foreground font-mono text-sm max-w-xl mx-auto mt-3">Tools dan teknologi yang saya kuasai untuk membangun solusi berkualitas tinggi.</p>
          </div>
        </div>

        <div className="sr-reveal" style={{ transitionDelay: "100ms" }}>
          <div className="hidden md:block"><CircuitFlow /></div>
        </div>

        <div className="sr-reveal" style={{ transitionDelay: "200ms" }}>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
            {techStack.map((tech) => (
              <div key={tech.name} className="flex flex-col items-center justify-center p-4 border border-border/50 bg-secondary/30 hover:border-primary/50 hover:bg-primary/5 transition-all group cursor-default rounded-sm">
                <tech.icon className="w-6 h-6 mb-3 opacity-60 group-hover:opacity-100 transition-all" style={{ color: tech.color }} />
                <span className="font-mono text-[10px] text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight">{tech.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
