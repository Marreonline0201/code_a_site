"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const OceanHero = dynamic(() => import("./OceanHero"), { ssr: false });

function GradientFallback() {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-ocean-deep via-ocean-mid to-ocean-surface" />
  );
}

export function OceanHeroWrapper() {
  const [hasWebGL] = useState(() => {
    try {
      const canvas = document.createElement("canvas");
      return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
    } catch {
      return false;
    }
  });

  return hasWebGL ? <OceanHero /> : <GradientFallback />;
}
