"use client";

import { useMemo } from "react";

export function OceanLoginBackground() {
  // Generate bubble positions once
  const bubbles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        size: 3 + Math.random() * 8,
        left: 5 + Math.random() * 90,
        delay: Math.random() * 12,
        duration: 8 + Math.random() * 10,
        opacity: 0.08 + Math.random() * 0.18,
      })),
    []
  );

  return (
    <>
      {/* Deep ocean gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(170deg,
            #0a1628 0%,
            #0c2340 15%,
            #0d3158 30%,
            #0a3d6e 45%,
            #084a7c 55%,
            #0b3d68 70%,
            #082c4f 85%,
            #061e38 100%)`,
        }}
      />

      {/* Underwater light caustics */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-[0.04]"
          style={{
            top: "10%",
            left: "20%",
            background: "radial-gradient(circle, #38bdf8, transparent 70%)",
            animation: "causticDrift 12s ease-in-out infinite alternate",
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full opacity-[0.05]"
          style={{
            top: "50%",
            right: "-5%",
            background: "radial-gradient(circle, #0ea5e9, transparent 70%)",
            animation: "causticDrift 9s ease-in-out infinite alternate-reverse",
          }}
        />
        <div
          className="absolute w-[300px] h-[300px] rounded-full opacity-[0.03]"
          style={{
            bottom: "15%",
            left: "10%",
            background: "radial-gradient(circle, #7dd3fc, transparent 70%)",
            animation: "causticDrift 15s ease-in-out infinite alternate",
            animationDelay: "3s",
          }}
        />
      </div>

      {/* Light rays from above */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="absolute top-0 opacity-[0.03]"
            style={{
              left: `${20 + i * 20}%`,
              width: `${40 + i * 15}px`,
              height: "100%",
              background: "linear-gradient(180deg, rgba(56,189,248,0.6) 0%, transparent 60%)",
              transform: `rotate(${-5 + i * 3}deg)`,
              transformOrigin: "top center",
              animation: `lightRay ${8 + i * 2}s ease-in-out infinite alternate`,
              animationDelay: `${i * 1.5}s`,
            }}
          />
        ))}
      </div>

      {/* Floating bubbles */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {bubbles.map((b) => (
          <div
            key={b.id}
            className="absolute rounded-full"
            style={{
              width: b.size,
              height: b.size,
              left: `${b.left}%`,
              bottom: "-20px",
              background:
                "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5), rgba(255,255,255,0.08))",
              border: "1px solid rgba(255,255,255,0.12)",
              opacity: b.opacity,
              animation: `bubbleRise ${b.duration}s ease-in infinite`,
              animationDelay: `${b.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />
    </>
  );
}
