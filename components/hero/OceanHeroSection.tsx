"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

/* ── Bottle data — positioned across the hero ── */
const bottles = [
  { name: "Evian", color: "#e84b8a", x: 6, y: 52, rotation: -18, scale: 0.9 },
  { name: "Fiji", color: "#0099d8", x: 20, y: 64, rotation: 12, scale: 1 },
  { name: "Gerolsteiner", color: "#006633", x: 38, y: 48, rotation: -8, scale: 0.85 },
  { name: "Perrier", color: "#00693e", x: 56, y: 60, rotation: 15, scale: 1.05 },
  { name: "Voss", color: "#8b9fad", x: 72, y: 50, rotation: -22, scale: 0.88 },
  { name: "S.Pellegrino", color: "#cc0000", x: 88, y: 58, rotation: 10, scale: 0.92 },
];

const CYCLE_DURATION = 3000; // ms each bottle stays visible
const FADE_DURATION = 800; // ms for fade transition

/* ── SVG Water Bottle ── */
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
      className="absolute pointer-events-none select-none"
      style={{
        ...style,
        opacity,
        transition: `opacity ${FADE_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`,
      }}
    >
      <svg
        width="44"
        height="130"
        viewBox="0 0 44 130"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_6px_20px_rgba(0,0,0,0.4)]"
        aria-label={`${name} bottle`}
      >
        <rect x="15" y="0" width="14" height="10" rx="3" fill={color} />
        <rect x="17" y="10" width="10" height="16" rx="2" fill="rgba(255,255,255,0.9)" />
        <rect x="6" y="26" width="32" height="86" rx="6" fill="rgba(255,255,255,0.8)" />
        <rect x="8" y="44" width="28" height="32" rx="3" fill={color} opacity="0.9" />
        <text x="22" y="64" textAnchor="middle" fill="white" fontSize="6.5" fontWeight="700" fontFamily="system-ui">
          {name.length > 10 ? name.slice(0, 10) : name}
        </text>
        <rect x="8" y="80" width="28" height="30" rx="0" fill="rgba(100,200,255,0.25)" />
        <rect x="6" y="110" width="32" height="4" rx="2" fill="rgba(255,255,255,0.5)" />
        <rect x="12" y="30" width="3" height="45" rx="1.5" fill="rgba(255,255,255,0.3)" />
      </svg>
    </div>
  );
}

/* ── Main Hero ── */
export function OceanHeroSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [opacities, setOpacities] = useState(() =>
    bottles.map((_, i) => (i === 0 ? 1 : 0))
  );
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sequential bottle fade in/out
  useEffect(() => {
    let current = 0;

    const interval = setInterval(() => {
      // Fade out current
      setOpacities((prev) => {
        const next = [...prev];
        next[current] = 0;
        return next;
      });

      setTimeout(() => {
        current = (current + 1) % bottles.length;
        setActiveIndex(current);
        setOpacities((prev) => {
          const next = [...prev];
          next[current] = 1;
          return next;
        });
      }, FADE_DURATION);
    }, CYCLE_DURATION);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full h-[100svh] min-h-[600px] max-h-[1100px] overflow-hidden">
      {/* ── Video background ── */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        poster="/images/ocean-poster.jpg"
      >
        {/* WebM for smaller file size where supported */}
        <source src="/videos/ocean-hero.webm" type="video/webm" />
        {/* MP4 fallback */}
        <source src="/videos/ocean-hero.mp4" type="video/mp4" />
      </video>

      {/* ── Gradient fallback if video fails ── */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg,
            #6CB4EE 0%,
            #4A9FDE 20%,
            #1E7FBF 40%,
            #0d6eaa 50%,
            #095d94 60%,
            #074d7d 70%,
            #053d66 80%,
            #032d4f 100%)`,
          zIndex: -1,
        }}
      />

      {/* ── Color overlay for text readability ── */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40"
        style={{ zIndex: 1 }}
      />

      {/* ── Underwater tint on bottom half ── */}
      <div
        className="absolute inset-x-0 bottom-0 h-[55%]"
        style={{
          background: "linear-gradient(to bottom, transparent, rgba(2, 40, 70, 0.3))",
          zIndex: 1,
        }}
      />

      {/* ── Floating bottles ── */}
      <div className="absolute inset-0" style={{ zIndex: 5 }} aria-hidden="true">
        {bottles.map((bottle, i) => (
          <WaterBottle
            key={bottle.name}
            name={bottle.name}
            color={bottle.color}
            opacity={opacities[i]}
            style={{
              left: `${bottle.x}%`,
              top: `${bottle.y}%`,
              transform: `rotate(${bottle.rotation}deg) scale(${bottle.scale})`,
              animation: `bottleFloat ${4 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
      </div>

      {/* ── Content ── */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
        style={{ zIndex: 10 }}
      >
        <h1
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
        >
          Find Your Perfect
          <br />
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(135deg, #7dd3fc, #38bdf8, #0ea5e9, #0284c7)",
              WebkitBackgroundClip: "text",
            }}
          >
            Water
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-base sm:text-lg text-white/85 leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
          Compare mineral water brands by mineral content.
          <br className="hidden sm:block" />
          Track your hydration. Discover what&apos;s in every bottle.
        </p>

        {/* Active bottle indicator */}
        <div className="mt-4 h-6 overflow-hidden">
          <span
            className="text-sm font-medium tracking-[0.2em] uppercase text-white/40"
            style={{
              opacity: opacities[activeIndex],
              transition: `opacity ${FADE_DURATION}ms ease`,
            }}
          >
            {bottles[activeIndex].name}
          </span>
        </div>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Link
            href="/brands"
            className="px-8 py-3.5 bg-white text-[#053d66] font-semibold rounded-full transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105"
          >
            Explore Brands
          </Link>
          <Link
            href="/tracker"
            className="px-8 py-3.5 border-2 border-white/30 text-white font-semibold rounded-full backdrop-blur-sm transition-all duration-300 hover:bg-white/15 hover:border-white/50 hover:scale-105"
          >
            Start Tracking
          </Link>
        </div>
      </div>

      {/* ── Bottom fade to page ── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32"
        style={{
          background: "linear-gradient(to bottom, transparent, var(--background))",
          zIndex: 15,
        }}
      />
    </section>
  );
}
