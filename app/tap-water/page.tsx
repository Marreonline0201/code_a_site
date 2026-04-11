import type { Metadata } from "next";
import { TapWaterTabs } from "./tap-water-tabs";

export const metadata: Metadata = {
  title: "Tap Water Quality Lookup — MineralWater",
  description:
    "Search EPA drinking water data nationwide by ZIP code or state. Check violations, contaminants, and water system details. Plus NYC lead testing data.",
};

export default function TapWaterPage() {
  return <TapWaterTabs />;
}
