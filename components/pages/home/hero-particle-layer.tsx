"use client";

import dynamic from "next/dynamic";

const ParticleBackground = dynamic(
  () => import("@/components/ui/particle-background").then((mod) => mod.ParticleBackground),
  {
    ssr: false,
    loading: () => <div className="pointer-events-none fixed inset-0 z-10 bg-[radial-gradient(circle_at_50%_20%,hsl(var(--primary)/0.10),transparent_42%)]" aria-hidden="true" />,
  }
);

export function HeroParticleLayer() {
  return <ParticleBackground />;
}
