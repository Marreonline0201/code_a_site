"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

const OceanHero = dynamic(() => import("./OceanHero"), { ssr: false });

function GradientFallback() {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-ocean-deep via-ocean-mid to-ocean-surface" />
  );
}

export function OceanHeroWrapper() {
  const [hasWebGL, setHasWebGL] = useState(false);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
      setHasWebGL(!!gl);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  return hasWebGL ? <OceanHero /> : <GradientFallback />;
}
