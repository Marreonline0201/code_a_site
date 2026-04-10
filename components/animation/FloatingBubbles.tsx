"use client";

import { useState } from "react";

interface FloatingBubblesProps {
  count?: number;
  className?: string;
}

export function FloatingBubbles({
  count = 15,
  className,
}: FloatingBubblesProps) {
  const [bubbles] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      size: 4 + Math.random() * 16,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 4 + Math.random() * 6,
      opacity: 0.05 + Math.random() * 0.2,
    }))
  );

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className ?? ""}`}
      aria-hidden="true"
    >
      {bubbles.map((b) => (
        <div
          key={b.id}
          className="absolute rounded-full bg-white/20 animate-bubble"
          style={{
            width: b.size,
            height: b.size,
            left: `${b.left}%`,
            bottom: "-20px",
            opacity: b.opacity,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
