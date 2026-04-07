"use client";

import { useMemo } from "react";

interface AnimatedBackgroundProps {
  color: string;
  intensity?: "low" | "medium" | "high";
}

interface Particle {
  id: number;
  left: string;
  top: string;
  size: number;
  delay: string;
  duration: string;
  opacity: number;
}

export function AnimatedBackground({ color, intensity = "medium" }: AnimatedBackgroundProps) {
  // Generate consistent particles to avoid hydration issues
  const particles = useMemo(() => {
    const count = intensity === "low" ? 15 : intensity === "medium" ? 25 : 40;
    const particleData: Particle[] = [];

    // Use seeded pseudo-random values for consistency
    for (let i = 0; i < count; i++) {
      const seed = i * 137.5; // Golden angle for distribution
      particleData.push({
        id: i,
        left: `${(seed * 2.1) % 100}%`,
        top: `${(seed * 1.7) % 100}%`,
        size: 2 + (i % 4),
        delay: `${(i * 0.3) % 8}s`,
        duration: `${6 + (i % 6)}s`,
        opacity: 0.2 + ((i % 5) * 0.1),
      });
    }
    return particleData;
  }, [intensity]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Primary gradient orbs */}
      <div
        className="absolute w-[800px] h-[800px] rounded-full animate-aurora"
        style={{
          background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
          top: "-20%",
          right: "-10%",
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute w-[600px] h-[600px] rounded-full animate-aurora"
        style={{
          background: `radial-gradient(circle, ${color}10 0%, transparent 70%)`,
          bottom: "-15%",
          left: "-5%",
          filter: "blur(50px)",
          animationDelay: "2s",
        }}
      />
      <div
        className="absolute w-[500px] h-[500px] rounded-full animate-aurora"
        style={{
          background: `radial-gradient(circle, #3b82f620 0%, transparent 70%)`,
          top: "40%",
          left: "30%",
          filter: "blur(40px)",
          animationDelay: "4s",
        }}
      />

      {/* Floating particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full animate-particle"
          style={{
            left: particle.left,
            top: particle.top,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: color,
            opacity: particle.opacity,
            animationDelay: particle.delay,
            animationDuration: particle.duration,
            filter: "blur(1px)",
          }}
        />
      ))}

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(${color}20 1px, transparent 1px),
            linear-gradient(90deg, ${color}20 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Scan line effect */}
      <div
        className="absolute left-0 right-0 h-[2px] animate-ml-scan"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}40, transparent)`,
          animationDuration: "8s",
          filter: "blur(1px)",
        }}
      />

      {/* Vignette effect */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 0%, #0a0f1e 100%)",
          opacity: 0.4,
        }}
      />
    </div>
  );
}
