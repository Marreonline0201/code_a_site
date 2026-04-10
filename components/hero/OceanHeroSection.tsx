"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

/* ── bottle data ── */
const bottles = [
  { name: "Evian", color: "#e84b8a", x: 8, y: 58, rotation: -18, delay: 0, scale: 0.95 },
  { name: "Fiji", color: "#0099d8", x: 22, y: 68, rotation: 12, delay: 1.2, scale: 1 },
  { name: "Gerolsteiner", color: "#006633", x: 38, y: 55, rotation: -8, delay: 2.4, scale: 0.9 },
  { name: "Perrier", color: "#00693e", x: 55, y: 65, rotation: 15, delay: 3.6, scale: 1.05 },
  { name: "Voss", color: "#8b9fad", x: 70, y: 52, rotation: -22, delay: 4.8, scale: 0.88 },
  { name: "San Pellegrino", color: "#cc0000", x: 85, y: 62, rotation: 10, delay: 6, scale: 0.92 },
];

const CYCLE_DURATION = 3; // seconds each bottle is visible
const FADE_DURATION = 0.8; // seconds for fade in/out

/* ── SVG Bottle ── */
function WaterBottle({
  name,
  color,
  style,
  opacity,
}: {
  name: string;
  color: string;
  style: React.CSSProperties;
  opacity: number;
}) {
  return (
    <div
      className="absolute pointer-events-none select-none transition-opacity"
      style={{
        ...style,
        opacity,
        transitionDuration: `${FADE_DURATION}s`,
        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <svg
        width="48"
        height="140"
        viewBox="0 0 48 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
        aria-label={`${name} bottle`}
      >
        {/* Cap */}
        <rect x="17" y="0" width="14" height="12" rx="3" fill={color} />
        {/* Neck */}
        <rect x="19" y="12" width="10" height="18" rx="2" fill="rgba(255,255,255,0.85)" />
        {/* Body */}
        <rect x="8" y="30" width="32" height="90" rx="6" fill="rgba(255,255,255,0.75)" />
        {/* Label */}
        <rect x="10" y="50" width="28" height="35" rx="3" fill={color} opacity="0.85" />
        {/* Label text */}
        <text
          x="24"
          y="71"
          textAnchor="middle"
          fill="white"
          fontSize="7"
          fontWeight="600"
          fontFamily="system-ui"
        >
          {name.length > 8 ? name.slice(0, 8) : name}
        </text>
        {/* Water level inside bottle */}
        <rect x="10" y="88" width="28" height="30" rx="0 0 5 5" fill="rgba(100,200,255,0.3)" />
        {/* Base */}
        <rect x="8" y="118" width="32" height="4" rx="2" fill="rgba(255,255,255,0.6)" />
        {/* Shine highlight */}
        <rect x="14" y="34" width="4" height="50" rx="2" fill="rgba(255,255,255,0.35)" />
      </svg>
    </div>
  );
}

/* ── Wave SVG layer ── */
function WaveLayer({
  className,
  fill,
  d,
  animDuration,
}: {
  className?: string;
  fill: string;
  d: string;
  animDuration: string;
}) {
  return (
    <svg
      viewBox="0 0 2880 120"
      preserveAspectRatio="none"
      className={`absolute w-[200%] ${className ?? ""}`}
      style={{
        animation: `oceanSway ${animDuration} ease-in-out infinite alternate`,
      }}
    >
      <path d={d} fill={fill} />
    </svg>
  );
}

/* ── Main hero ── */
export function OceanHeroSection() {
  const [activeBottle, setActiveBottle] = useState(0);
  const [bottleOpacities, setBottleOpacities] = useState<number[]>(
    bottles.map((_, i) => (i === 0 ? 1 : 0))
  );
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let current = 0;

    // Initial: show first bottle
    setBottleOpacities(bottles.map((_, i) => (i === 0 ? 1 : 0)));

    intervalRef.current = setInterval(() => {
      // Fade out current
      setBottleOpacities((prev) => {
        const next = [...prev];
        next[current] = 0;
        return next;
      });

      // After fade-out, advance and fade in next
      setTimeout(() => {
        current = (current + 1) % bottles.length;
        setActiveBottle(current);
        setBottleOpacities((prev) => {
          const next = [...prev];
          next[current] = 1;
          return next;
        });
      }, FADE_DURATION * 1000);
    }, CYCLE_DURATION * 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <section className="relative w-full h-[100svh] min-h-[600px] max-h-[1000px] overflow-hidden">
      {/* ── Sky gradient (top portion) ── */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg,
            #87CEEB 0%,
            #5CB8E6 15%,
            #2E9BD6 30%,
            #1a8ac4 42%,
            #0d7ab3 50%,
            #0a6fa6 55%,
            #085d8e 65%,
            #064d78 75%,
            #043d62 85%,
            #022d4f 100%)`,
        }}
      />

      {/* ── Underwater light rays ── */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute top-[45%] opacity-[0.06]"
            style={{
              left: `${15 + i * 18}%`,
              width: `${60 + i * 20}px`,
              height: "120%",
              background: "linear-gradient(180deg, rgba(255,255,255,0.8), transparent)",
              transform: `rotate(${-8 + i * 4}deg)`,
              transformOrigin: "top center",
              animation: `lightRay ${6 + i}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.7}s`,
            }}
          />
        ))}
      </div>

      {/* ── Water surface line with waves ── */}
      <div
        className="absolute left-0 right-0"
        style={{ top: "42%", zIndex: 15 }}
      >
        {/* Back wave */}
        <WaveLayer
          className="top-[-20px]"
          fill="rgba(10,111,166,0.5)"
          d="M0,40 C240,80 480,10 720,50 C960,90 1200,20 1440,60 C1680,90 1920,30 2160,55 C2400,80 2640,15 2880,45 L2880,120 L0,120 Z"
          animDuration="7s"
        />
        {/* Middle wave */}
        <WaveLayer
          className="top-[-10px]"
          fill="rgba(13,122,179,0.6)"
          d="M0,50 C360,15 720,70 1080,30 C1440,70 1800,20 2160,55 C2520,80 2700,25 2880,50 L2880,120 L0,120 Z"
          animDuration="5s"
        />
        {/* Front wave */}
        <WaveLayer
          className="top-[0px]"
          fill="rgba(8,93,142,0.7)"
          d="M0,35 C300,70 600,15 900,50 C1200,80 1500,25 1800,55 C2100,75 2400,30 2880,40 L2880,120 L0,120 Z"
          animDuration="6s"
        />
      </div>

      {/* ── Floating bubbles ── */}
      <div className="absolute inset-0" aria-hidden="true" style={{ zIndex: 12 }}>
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${4 + Math.random() * 10}px`,
              height: `${4 + Math.random() * 10}px`,
              left: `${5 + Math.random() * 90}%`,
              bottom: `${-5}%`,
              background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5), rgba(255,255,255,0.1))",
              border: "1px solid rgba(255,255,255,0.2)",
              animation: `bubbleRise ${6 + Math.random() * 8}s ease-in infinite`,
              animationDelay: `${Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* ── Water bottles ── */}
      <div
        className="absolute inset-0"
        style={{ zIndex: 10 }}
        aria-hidden="true"
      >
        {bottles.map((bottle, index) => (
          <WaterBottle
            key={bottle.name}
            name={bottle.name}
            color={bottle.color}
            opacity={bottleOpacities[index]}
            style={{
              left: `${bottle.x}%`,
              top: `${bottle.y}%`,
              transform: `rotate(${bottle.rotation}deg) scale(${bottle.scale})`,
              animation: `bottleFloat ${4 + index * 0.5}s ease-in-out infinite`,
              animationDelay: `${index * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* ── Content overlay ── */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
        style={{ zIndex: 20 }}
      >
        <h1
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
        >
          Find Your Perfect
          <br />
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, #7dd3fc, #38bdf8, #0ea5e9, #0284c7)",
              WebkitBackgroundClip: "text",
            }}
          >
            Water
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-base sm:text-lg text-white/80 leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
          Compare mineral water brands by mineral content.
          <br className="hidden sm:block" />
          Track your hydration. Discover what&apos;s in every bottle.
        </p>

        {/* Active bottle name indicator */}
        <div className="mt-4 h-6">
          <span
            className="text-sm font-medium tracking-widest uppercase text-white/50 transition-opacity duration-500"
            style={{ opacity: bottleOpacities[activeBottle] }}
          >
            {bottles[activeBottle].name}
          </span>
        </div>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Link
            href="/brands"
            className="group relative px-8 py-3.5 bg-white text-ocean-deep font-semibold rounded-full overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105"
          >
            <span className="relative z-10">Explore Brands</span>
          </Link>
          <Link
            href="/tracker"
            className="px-8 py-3.5 border-2 border-white/30 text-white font-semibold rounded-full backdrop-blur-sm transition-all duration-300 hover:bg-white/15 hover:border-white/50 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]"
          >
            Start Tracking
          </Link>
        </div>
      </div>

      {/* ── Bottom gradient fade to page background ── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32"
        style={{
          background: "linear-gradient(to bottom, transparent, var(--background))",
          zIndex: 25,
        }}
      />
    </section>
  );
}
