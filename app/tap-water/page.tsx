import type { Metadata } from "next";
import { TapWaterPageClient } from "./tap-water-page-client";

export const metadata: Metadata = {
  title: "NYC Tap Water Lookup — MineralWater",
  description:
    "Search NYC tap water samples by ZIP code or location and review nearby water quality summaries.",
};

export default function TapWaterPage() {
  return <TapWaterPageClient />;
}
