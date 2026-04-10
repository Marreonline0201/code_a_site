"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";

/* ── Bottle data with real product images ── */
const bottles = [
  { name: "Evian", image: "https://m.media-amazon.com/images/I/61rSQRSCIhL._AC_SL1500_.jpg", x: 6, y: 48, rotation: -15, scale: 0.85 },
  { name: "Fiji", image: "https://m.media-amazon.com/images/I/61l2q0W3a5L._AC_SL1500_.jpg", x: 22, y: 60, rotation: 10, scale: 0.9 },
  { name: "Gerolsteiner", image: "https://m.media-amazon.com/images/I/61CkN1RqcrL._AC_SL1500_.jpg", x: 40, y: 45, rotation: -8, scale: 0.8 },
  { name: "Perrier", image: "https://m.media-amazon.com/images/I/71AW4q2E9cL._AC_SL1500_.jpg", x: 58, y: 58, rotation: 12, scale: 1.05 },
  { name: "Voss", image: "https://m.media-amazon.com/images/I/51A4s+NZBGL._AC_SL1500_.jpg", x: 74, y: 46, rotation: -20, scale: 0.82 },
  { name: "S.Pellegrino", image: "https://m.media-amazon.com/images/I/71QBEbpuiNL._AC_SL1500_.jpg", x: 88, y: 55, rotation: 8, scale: 0.85 },
];

const CYCLE_MS = 3200;
const FADE_MS = 900;
const TOTAL_FRAMES = 30; // 30 frames = fast extraction, still smooth
const FRAME_W = 960;
const FRAME_H = 540;

/* ── Floating Bottle ── */
function FloatingBottle({ name, image, style, opacity }: {
  name: string; image: string; style: React.CSSProperties; opacity: number;
}) {
  return (
    <div className="absolute pointer-events-none select-none" style={{
      ...style, opacity, transition: `opacity ${FADE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
      filter: "drop-shadow(0 8px 25px rgba(0,0,0,0.4))",
    }}>
      <Image src={image} alt={`${name} water bottle`} width={80} height={200}
        className="object-contain max-h-[160px] sm:max-h-[200px]" unoptimized />
    </div>
  );
}

/* ── Main Hero ── */
export function OceanHeroSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [opacities, setOpacities] = useState(() => bottles.map((_, i) => (i === 0 ? 1 : 0)));
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<ImageBitmap[]>([]);
  const [loadProgress, setLoadProgress] = useState(0); // 0 to 1
  const currentFrameRef = useRef(0);
  const rafRef = useRef<number>(0);

  // Extract frames progressively — show first frame ASAP
  useEffect(() => {
    const video = document.createElement("video");
    video.src = "/videos/ocean-hero.mp4";
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.crossOrigin = "anonymous";

    const extract = async () => {
      const duration = video.duration;
      if (!duration || !isFinite(duration)) return;

      const offscreen = document.createElement("canvas");
      offscreen.width = FRAME_W;
      offscreen.height = FRAME_H;
      const ctx = offscreen.getContext("2d")!;

      // Set canvas size once
      const mainCanvas = canvasRef.current;
      if (mainCanvas) {
        mainCanvas.width = FRAME_W;
        mainCanvas.height = FRAME_H;
      }

      for (let i = 0; i < TOTAL_FRAMES; i++) {
        video.currentTime = (i / TOTAL_FRAMES) * duration;
        await new Promise<void>((r) =>
          video.addEventListener("seeked", () => r(), { once: true })
        );
        ctx.drawImage(video, 0, 0, FRAME_W, FRAME_H);
        const bitmap = await createImageBitmap(offscreen);
        framesRef.current.push(bitmap);

        // Draw first frame immediately so user sees something
        if (i === 0 && mainCanvas) {
          const mainCtx = mainCanvas.getContext("2d");
          mainCtx?.drawImage(bitmap, 0, 0);
        }

        setLoadProgress((i + 1) / TOTAL_FRAMES);
      }
    };

    if (video.readyState >= 1) {
      extract();
    } else {
      video.addEventListener("loadeddata", extract, { once: true });
    }

    return () => { video.pause(); video.src = ""; };
  }, []);

  // Scroll-driven canvas scrubbing
  useEffect(() => {
    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const section = sectionRef.current;
        const canvas = canvasRef.current;
        const frames = framesRef.current;
        if (!section || !canvas || frames.length === 0) return;

        const rect = section.getBoundingClientRect();
        const scrollRange = section.offsetHeight - window.innerHeight;
        const progress = Math.max(0, Math.min(1, -rect.top / scrollRange));
        const frameIndex = Math.min(
          Math.floor(progress * frames.length),
          frames.length - 1
        );

        if (frameIndex !== currentFrameRef.current && frames[frameIndex]) {
          currentFrameRef.current = frameIndex;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(frames[frameIndex], 0, 0);
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Bottle phase-in / phase-out
  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      setOpacities((prev) => { const n = [...prev]; n[current] = 0; return n; });
      setTimeout(() => {
        current = (current + 1) % bottles.length;
        setActiveIndex(current);
        setOpacities((prev) => { const n = [...prev]; n[current] = 1; return n; });
      }, FADE_MS);
    }, CYCLE_MS);
    return () => clearInterval(interval);
  }, []);

  const loaded = loadProgress >= 1;

  return (
    <>
      {/* Preload the video for faster download */}
      <Head>
        <link rel="preload" href="/videos/ocean-hero.mp4" as="video" type="video/mp4" />
      </Head>

      <section ref={sectionRef} className="relative w-full h-[300svh]">
        <div className="sticky top-0 h-[100svh] min-h-[600px] max-h-[1100px] overflow-hidden">

          {/* ── Canvas ── */}
          <canvas ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ zIndex: 1 }} />

          {/* ── Gradient fallback + loading shimmer ── */}
          <div className="absolute inset-0" style={{
            background: `linear-gradient(180deg, #87CEEB 0%, #5BB8E6 18%, #2E9BD6 35%, #1a8ac4 48%, #0d7ab3 55%, #0a6fa6 62%, #085d8e 72%, #064d78 82%, #043d62 92%, #022d4f 100%)`,
            transition: "opacity 0.5s ease",
            opacity: loaded ? 0 : 1,
          }}>
            {!loaded && (
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/5 to-transparent"
                  style={{ animation: "shimmer 2s ease-in-out infinite" }} />
              </div>
            )}
          </div>

          {/* ── Overlay ── */}
          <div className="absolute inset-0" style={{
            background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, transparent 40%, rgba(2,30,50,0.3) 100%)",
            zIndex: 2,
          }} />

          {/* ── Bottles ── */}
          <div className="absolute inset-0" style={{ zIndex: 5 }} aria-hidden="true">
            {bottles.map((bottle, i) => (
              <FloatingBottle key={bottle.name} name={bottle.name} image={bottle.image}
                opacity={opacities[i]} style={{
                  left: `${bottle.x}%`, top: `${bottle.y}%`,
                  transform: `rotate(${bottle.rotation}deg) scale(${bottle.scale})`,
                  animation: `bottleFloat ${4 + i * 0.5}s ease-in-out infinite`,
                  animationDelay: `${i * 0.4}s`,
                }} />
            ))}
          </div>

          {/* ── Content ── */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4" style={{ zIndex: 10 }}>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              Find Your Perfect<br />
              <span className="bg-clip-text text-transparent" style={{
                backgroundImage: "linear-gradient(135deg, #7dd3fc, #38bdf8, #0ea5e9, #0284c7)",
                WebkitBackgroundClip: "text",
              }}>Water</span>
            </h1>
            <p className="mt-6 max-w-xl text-base sm:text-lg text-white/85 leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
              Compare mineral water brands by mineral content.
              <br className="hidden sm:block" />
              Track your hydration. Discover what&apos;s in every bottle.
            </p>
            <div className="mt-4 h-6 overflow-hidden">
              <span className="text-sm font-medium tracking-[0.2em] uppercase text-white/50"
                style={{ opacity: opacities[activeIndex], transition: `opacity ${FADE_MS}ms ease` }}>
                {bottles[activeIndex].name}
              </span>
            </div>
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <Link href="/brands" className="px-8 py-3.5 bg-white text-[#053d66] font-semibold rounded-full transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105">
                Explore Brands
              </Link>
              <Link href="/tracker" className="px-8 py-3.5 border-2 border-white/30 text-white font-semibold rounded-full backdrop-blur-sm transition-all duration-300 hover:bg-white/15 hover:border-white/50 hover:scale-105">
                Start Tracking
              </Link>
            </div>
          </div>

          {/* ── Bottom fade ── */}
          <div className="absolute bottom-0 left-0 right-0 h-32" style={{
            background: "linear-gradient(to bottom, transparent, var(--background))", zIndex: 15,
          }} />

          {/* ── Scroll hint ── */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" style={{ zIndex: 20 }}>
            <span className="text-xs text-white/50 tracking-widest uppercase">Scroll to explore</span>
            <div className="w-5 h-8 rounded-full border-2 border-white/30 flex items-start justify-center p-1">
              <div className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" />
            </div>
          </div>

          {/* ── Loading bar ── */}
          {!loaded && (
            <div className="absolute bottom-0 left-0 right-0 h-1" style={{ zIndex: 25 }}>
              <div className="h-full bg-white/40 transition-all duration-300 ease-out"
                style={{ width: `${loadProgress * 100}%` }} />
            </div>
          )}

        </div>
      </section>
    </>
  );
}
