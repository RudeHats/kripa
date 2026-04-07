"use client";

import { useMemo, useState, useEffect } from "react";
import { getAQIColor } from "@/lib/aqi-data";

interface AQICharacterProps {
  aqi: number;
  isTyping?: boolean;
  isProcessing?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

type Mood = "ecstatic" | "happy" | "concerned" | "worried" | "distressed" | "critical" | "hazardous";

function getMood(aqi: number): Mood {
  if (aqi <= 30) return "ecstatic";
  if (aqi <= 50) return "happy";
  if (aqi <= 100) return "concerned";
  if (aqi <= 150) return "worried";
  if (aqi <= 200) return "distressed";
  if (aqi <= 300) return "critical";
  return "hazardous";
}

const sizeClasses = {
  sm: "w-12 h-12",
  md: "w-20 h-20",
  lg: "w-32 h-32",
  xl: "w-48 h-48",
};

export function AQICharacter({ aqi, isTyping = false, isProcessing = false, size = "md" }: AQICharacterProps) {
  const mood = useMemo(() => getMood(aqi), [aqi]);
  const color = getAQIColor(aqi);
  const [bounce, setBounce] = useState(false);
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });

  // Subtle eye movement
  useEffect(() => {
    const interval = setInterval(() => {
      setEyePosition({
        x: (Math.random() - 0.5) * 4,
        y: (Math.random() - 0.5) * 2,
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Occasional bounce
  useEffect(() => {
    const interval = setInterval(() => {
      if (mood === "ecstatic" || mood === "happy") {
        setBounce(true);
        setTimeout(() => setBounce(false), 500);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [mood]);

  const getBodyParts = () => {
    // Cute leaf/cloud creature with arms and accessories
    const baseOpacity = mood === "hazardous" ? 0.6 : 1;

    return (
      <>
        {/* Body gradient */}
        <defs>
          <radialGradient id={`bodyGrad-${mood}`} cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="70%" stopColor={color} stopOpacity="0.85" />
            <stop offset="100%" stopColor={color} stopOpacity="0.7" />
          </radialGradient>
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Little legs */}
        <ellipse cx="35" cy="88" rx="8" ry="5" fill={color} opacity={baseOpacity * 0.9} />
        <ellipse cx="65" cy="88" rx="8" ry="5" fill={color} opacity={baseOpacity * 0.9} />

        {/* Main body - cute blob shape */}
        <path
          d="M 50 15 
             C 75 15, 90 30, 90 50 
             C 90 70, 80 85, 50 85 
             C 20 85, 10 70, 10 50 
             C 10 30, 25 15, 50 15"
          fill={`url(#bodyGrad-${mood})`}
          filter="url(#dropShadow)"
          opacity={baseOpacity}
        />

        {/* Body highlight */}
        <ellipse cx="35" cy="35" rx="15" ry="10" fill="white" opacity="0.15" />

        {/* Little arms */}
        <ellipse
          cx="8" cy="55" rx="7" ry="10"
          fill={color}
          opacity={baseOpacity * 0.9}
          style={{
            transformOrigin: "15px 55px",
            transform: isTyping ? "rotate(-10deg)" : "rotate(0deg)",
            transition: "transform 0.3s ease",
          }}
        />
        <ellipse
          cx="92" cy="55" rx="7" ry="10"
          fill={color}
          opacity={baseOpacity * 0.9}
          style={{
            transformOrigin: "85px 55px",
            transform: isTyping ? "rotate(10deg)" : "rotate(0deg)",
            transition: "transform 0.3s ease",
          }}
        />
      </>
    );
  };

  const getFace = () => {
    const eyeX = eyePosition.x;
    const eyeY = eyePosition.y;

    switch (mood) {
      case "ecstatic":
        return (
          <>
            {/* Sparkle eyes */}
            <g transform={`translate(${eyeX}, ${eyeY})`}>
              {/* Star-shaped eyes */}
              <path d="M 35 42 L 37 38 L 39 42 L 43 42 L 40 45 L 41 49 L 37 47 L 33 49 L 34 45 L 31 42 Z" fill="#1e293b" />
              <path d="M 65 42 L 67 38 L 69 42 L 73 42 L 70 45 L 71 49 L 67 47 L 63 49 L 64 45 L 61 42 Z" fill="#1e293b" />
              <circle cx="36" cy="41" r="2" fill="white" opacity="0.9" />
              <circle cx="66" cy="41" r="2" fill="white" opacity="0.9" />
            </g>
            {/* Big happy open mouth */}
            <ellipse cx="50" cy="65" rx="15" ry="10" fill="#1e293b" />
            <ellipse cx="50" cy="63" rx="10" ry="5" fill="#ff6b8a" />
            <ellipse cx="50" cy="70" rx="6" ry="3" fill="#ff8fab" />
            {/* Rosy cheeks */}
            <circle cx="22" cy="55" r="7" fill="#fca5a5" opacity="0.6" />
            <circle cx="78" cy="55" r="7" fill="#fca5a5" opacity="0.6" />
            {/* Sparkles around */}
            <text x="15" y="25" fontSize="8" fill="#fbbf24">&#10022;</text>
            <text x="80" y="30" fontSize="6" fill="#fbbf24">&#10022;</text>
          </>
        );
      case "happy":
        return (
          <>
            <g transform={`translate(${eyeX}, ${eyeY})`}>
              <ellipse cx="35" cy="42" rx="8" ry="9" fill="#1e293b" className="animate-blink origin-center" style={{ transformBox: 'fill-box' }} />
              <ellipse cx="65" cy="42" rx="8" ry="9" fill="#1e293b" className="animate-blink origin-center" style={{ transformBox: 'fill-box' }} />
              <circle cx="37" cy="39" r="3" fill="white" opacity="0.9" />
              <circle cx="67" cy="39" r="3" fill="white" opacity="0.9" />
            </g>
            <path d="M 32 62 Q 50 78 68 62" stroke="#1e293b" strokeWidth="4" fill="none" strokeLinecap="round" />
            <circle cx="22" cy="55" r="6" fill="#fca5a5" opacity="0.5" />
            <circle cx="78" cy="55" r="6" fill="#fca5a5" opacity="0.5" />
          </>
        );
      case "concerned":
        return (
          <>
            <g transform={`translate(${eyeX}, ${eyeY})`}>
              <ellipse cx="35" cy="43" rx="7" ry="8" fill="#1e293b" className="animate-blink origin-center" style={{ transformBox: 'fill-box' }} />
              <ellipse cx="65" cy="43" rx="7" ry="8" fill="#1e293b" className="animate-blink origin-center" style={{ transformBox: 'fill-box' }} />
              <circle cx="36" cy="41" r="2.5" fill="white" opacity="0.8" />
              <circle cx="66" cy="41" r="2.5" fill="white" opacity="0.8" />
            </g>
            <path d="M 35 65 Q 50 68 65 65" stroke="#1e293b" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M 28 32 Q 35 30 42 34" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 72 34 Q 65 30 58 32" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </>
        );
      case "worried":
        return (
          <>
            <g transform={`translate(${eyeX}, ${eyeY})`}>
              <ellipse cx="35" cy="44" rx="6" ry="7" fill="#1e293b" className="animate-blink origin-center" style={{ transformBox: 'fill-box' }} />
              <ellipse cx="65" cy="44" rx="6" ry="7" fill="#1e293b" className="animate-blink origin-center" style={{ transformBox: 'fill-box' }} />
              <circle cx="36" cy="42" r="2" fill="white" opacity="0.7" />
              <circle cx="66" cy="42" r="2" fill="white" opacity="0.7" />
            </g>
            <path d="M 38 65 Q 45 62 50 65 Q 55 68 62 65" stroke="#1e293b" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 26 34 Q 35 26 44 34" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 74 34 Q 65 26 56 34" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            {/* Sweat drop */}
            <ellipse cx="82" cy="38" rx="4" ry="6" fill="#60a5fa" opacity="0.7" />
          </>
        );
      case "distressed":
        return (
          <>
            <g transform={`translate(${eyeX * 0.5}, ${eyeY * 0.5})`}>
              <ellipse cx="35" cy="44" rx="5" ry="5" fill="#1e293b" />
              <ellipse cx="65" cy="44" rx="5" ry="5" fill="#1e293b" />
              <circle cx="36" cy="43" r="1.5" fill="white" opacity="0.6" />
              <circle cx="66" cy="43" r="1.5" fill="white" opacity="0.6" />
            </g>
            {/* Open distressed mouth */}
            <ellipse cx="50" cy="67" rx="10" ry="7" fill="#1e293b" />
            <ellipse cx="50" cy="65" rx="6" ry="3" fill="#4a1e1e" />
            <path d="M 24 32 Q 35 22 46 32" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 76 32 Q 65 22 54 32" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            {/* Multiple sweat drops */}
            <ellipse cx="84" cy="35" rx="3" ry="5" fill="#60a5fa" opacity="0.8" />
            <ellipse cx="16" cy="38" rx="2.5" ry="4" fill="#60a5fa" opacity="0.6" />
          </>
        );
      case "critical":
        return (
          <>
            {/* Squinting/closed eyes */}
            <path d="M 28 42 Q 35 47 42 42" stroke="#1e293b" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M 58 42 Q 65 47 72 42" stroke="#1e293b" strokeWidth="4" fill="none" strokeLinecap="round" />
            {/* N95 mask */}
            <path
              d="M 25 52 Q 25 72 50 75 Q 75 72 75 52 L 75 58 Q 75 75 50 78 Q 25 75 25 58 Z"
              fill="white"
              opacity="0.95"
              stroke="#94a3b8"
              strokeWidth="1"
            />
            <line x1="30" y1="60" x2="70" y2="60" stroke="#d1d5db" strokeWidth="1.5" />
            <line x1="30" y1="67" x2="70" y2="67" stroke="#d1d5db" strokeWidth="1.5" />
            {/* Ear straps */}
            <path d="M 25 55 Q 12 52 15 42" stroke="#94a3b8" strokeWidth="2" fill="none" />
            <path d="M 75 55 Q 88 52 85 42" stroke="#94a3b8" strokeWidth="2" fill="none" />
            {/* Worried eyebrows */}
            <path d="M 22 35 Q 35 25 48 35" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 78 35 Q 65 25 52 35" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </>
        );
      case "hazardous":
        return (
          <>
            {/* X eyes */}
            <line x1="30" y1="37" x2="40" y2="47" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
            <line x1="40" y1="37" x2="30" y2="47" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
            <line x1="60" y1="37" x2="70" y2="47" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
            <line x1="70" y1="37" x2="60" y2="47" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
            {/* Full gas mask */}
            <ellipse cx="50" cy="62" rx="28" ry="20" fill="#374151" />
            <circle cx="38" cy="58" r="10" fill="#1f2937" stroke="#4b5563" strokeWidth="2" />
            <circle cx="62" cy="58" r="10" fill="#1f2937" stroke="#4b5563" strokeWidth="2" />
            <ellipse cx="50" cy="70" rx="8" ry="5" fill="#4b5563" />
            {/* Filter canisters */}
            <rect x="8" y="55" width="12" height="18" rx="4" fill="#374151" stroke="#4b5563" strokeWidth="1" />
            <rect x="80" y="55" width="12" height="18" rx="4" fill="#374151" stroke="#4b5563" strokeWidth="1" />
            {/* Danger symbols */}
            <text x="85" y="20" fontSize="10" fill="#ef4444">!</text>
          </>
        );
      default:
        return null;
    }
  };

  const getAnimationClass = () => {
    if (isProcessing) return "animate-pulse";
    if (isTyping) return "animate-wiggle";
    if (bounce) return "animate-bounce";
    switch (mood) {
      case "ecstatic": return "animate-bounce";
      case "happy": return "animate-breathe";
      case "concerned": return "animate-breathe";
      case "distressed": return "animate-cough";
      default: return "";
    }
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${getAnimationClass()} transition-transform duration-300`}>
      {/* Outer glow */}
      <div
        className="absolute inset-0 rounded-full animate-pulse-glow"
        style={{
          background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
          transform: 'scale(1.5)',
        }}
      />

      {/* Character SVG */}
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg relative z-10">
        {getBodyParts()}
        {getFace()}
      </svg>

      {/* Processing indicator */}
      {isProcessing && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
          <div
            className="absolute inset-2 rounded-full border-t-2 border-primary animate-spin"
            style={{ animationDuration: "1s" }}
          />
        </div>
      )}

      {/* Typing indicator bubbles */}
      {isTyping && !isProcessing && (
        <div className="absolute -right-2 -bottom-1 flex gap-0.5">
          <div className="w-2 h-2 rounded-full bg-muted-foreground loading-dot" />
          <div className="w-2 h-2 rounded-full bg-muted-foreground loading-dot" />
          <div className="w-2 h-2 rounded-full bg-muted-foreground loading-dot" />
        </div>
      )}
    </div>
  );
}
