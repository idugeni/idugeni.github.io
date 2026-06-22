"use client";

interface Dot {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

const DOTS: Dot[] = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  x: Math.round(Math.random() * 100),
  y: Math.round(Math.random() * 100),
  size: Math.round(Math.random() * 3 + 1),
  duration: Math.round(Math.random() * 20 + 15),
  delay: Math.round(Math.random() * 10),
  opacity: Math.round((Math.random() * 0.4 + 0.2) * 100) / 100,
}));

export function ParticleBackground() {
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-10 overflow-hidden motion-reduce:hidden" aria-hidden="true">
      <style>{`
        @keyframes particle-drift {
          0% { transform: translate(0, 0); }
          25% { transform: translate(30px, -20px); }
          50% { transform: translate(-15px, 25px); }
          75% { transform: translate(20px, 10px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes particle-pulse {
          0%, 100% { opacity: var(--p-opacity); }
          50% { opacity: calc(var(--p-opacity) * 0.4); }
        }
      `}</style>
      {DOTS.map((dot) => (
        <div
          key={dot.id}
          className="absolute rounded-full"
          style={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            width: `${dot.size}px`,
            height: `${dot.size}px`,
            backgroundColor: `rgba(6, 182, 212, ${dot.opacity})`,
            boxShadow: `0 0 ${dot.size * 4}px rgba(6, 182, 212, ${dot.opacity * 0.5})`,
            ["--p-opacity" as string]: dot.opacity,
            animation: `particle-drift ${dot.duration}s ease-in-out ${dot.delay}s infinite, particle-pulse ${dot.duration * 0.6}s ease-in-out ${dot.delay}s infinite`,
          }}
        />
      ))}
      {/* Connection lines using SVG */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.08 }}>
        {DOTS.slice(0, 20).map((dot, i) => {
          const next = DOTS[(i + 1) % 20];
          if (Math.abs(dot.x - next.x) > 30 || Math.abs(dot.y - next.y) > 30) return null;
          return (
            <line
              key={i}
              x1={`${dot.x}%`}
              y1={`${dot.y}%`}
              x2={`${next.x}%`}
              y2={`${next.y}%`}
              stroke="rgb(6, 182, 212)"
              strokeWidth="0.5"
            />
          );
        })}
      </svg>
    </div>
  );
}
