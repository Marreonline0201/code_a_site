"use client";

import dynamic from "next/dynamic";
import type { WaterQualityMapSystem } from "@/lib/epa/coverage-map";

interface WaterQualityMapProps {
  systems: WaterQualityMapSystem[];
  stateCode: string;
}

const MapInner = dynamic(() => import("./WaterQualityMapInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] rounded-xl bg-muted/50 flex items-center justify-center">
      <p className="text-sm text-muted-foreground">Loading map...</p>
    </div>
  ),
});

export function WaterQualityMap({ systems, stateCode }: WaterQualityMapProps) {
  return (
    <div className="glass-card overflow-hidden mb-8">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold">Water Systems Map</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {systems.length} systems · real coordinates when available, approximate fallback when needed
        </p>
      </div>
      <MapInner systems={systems} stateCode={stateCode} />
    </div>
  );
}

export type { WaterQualityMapSystem };
