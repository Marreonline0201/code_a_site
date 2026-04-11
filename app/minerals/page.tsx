import { createClient } from "@/lib/supabase/server";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import { StaggerGrid } from "@/components/animation/StaggerGrid";
import { WaveDivider } from "@/components/animation/WaveDivider";
import Link from "next/link";
import type { Mineral } from "@/lib/types";
import type { Metadata } from "next";

/** One-glance effect line per mineral (max ~10 words) */
const MINERAL_TAGLINES: Record<string, string> = {
  calcium: "Builds bones, supports muscles",
  magnesium: "Better sleep, more energy, fewer cramps",
  sodium: "Balances fluids, helps nerve signals",
  potassium: "Regulates heartbeat, reduces blood pressure",
  bicarbonate: "Neutralizes acid, aids digestion",
  sulfate: "Supports detox, aids digestion",
  chloride: "Maintains fluid balance and pH",
  silica: "Strengthens hair, skin, nails, and bones",
  fluoride: "Protects tooth enamel from decay",
  tds: "Total dissolved solids — overall mineral richness",
  ph: "Measures acidity or alkalinity of water",
};

export const metadata: Metadata = {
  title: "Minerals in Water — MineralWater",
  description:
    "Learn about the essential minerals found in mineral water: calcium, magnesium, sodium, potassium, and more.",
};

export default async function MineralsPage() {
  const supabase = await createClient();
  const { data: minerals } = await supabase
    .from("minerals")
    .select("*")
    .order("name");

  const allMinerals = (minerals ?? []) as Mineral[];

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 py-8">
        <ScrollReveal>
          <h1 className="text-4xl font-bold mb-2">Minerals in Water</h1>
          <p className="text-muted-foreground mb-12 max-w-2xl">
            Every mineral water has a unique composition. Understanding these
            minerals helps you choose the right water for your health goals.
          </p>
        </ScrollReveal>

        <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allMinerals.map((mineral) => (
            <Link key={mineral.slug} href={`/minerals/${mineral.slug}`}>
              <div className="glass-card p-6 group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-12 h-12 rounded-full bg-ocean-surface/20 flex items-center justify-center text-sm font-bold text-ocean-surface">
                    {mineral.symbol}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold group-hover:text-ocean-surface transition-colors">
                      {mineral.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {MINERAL_TAGLINES[mineral.slug] ?? mineral.benefits[0]}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-border/50">
                  {mineral.daily_value > 0 ? (
                    <span className="text-xs text-muted-foreground">
                      Daily value: {mineral.daily_value} {mineral.unit}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      No established daily value
                    </span>
                  )}
                  <span className="text-sm font-medium text-primary group-hover:underline">
                    Learn more →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </StaggerGrid>
      </section>

      <WaveDivider variant="gentle" />

      {/* Quick reference table */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <ScrollReveal>
          <h2 className="text-2xl font-bold mb-6">Quick Reference</h2>
        </ScrollReveal>
        <ScrollReveal delay={0.15}>
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold">
                    Mineral
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold">
                    Symbol
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold">
                    Daily Value
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold hidden sm:table-cell">
                    Low Threshold
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold hidden sm:table-cell">
                    High Threshold
                  </th>
                </tr>
              </thead>
              <tbody>
                {allMinerals.map((mineral) => (
                  <tr
                    key={mineral.slug}
                    className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <Link
                        href={`/minerals/${mineral.slug}`}
                        className="font-medium hover:text-ocean-surface transition-colors"
                      >
                        {mineral.name}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-center text-muted-foreground font-mono">
                      {mineral.symbol}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {mineral.daily_value > 0
                        ? `${mineral.daily_value} ${mineral.unit}`
                        : "—"}
                    </td>
                    <td className="py-3 px-4 text-right font-mono hidden sm:table-cell">
                      {mineral.low_threshold} {mineral.unit}
                    </td>
                    <td className="py-3 px-4 text-right font-mono hidden sm:table-cell">
                      {mineral.high_threshold} {mineral.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
