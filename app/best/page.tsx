import { createClient } from "@/lib/supabase/server";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import { StaggerGrid } from "@/components/animation/StaggerGrid";
import { WaveDivider } from "@/components/animation/WaveDivider";
import Link from "next/link";
import type { Mineral } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Best Mineral Water For... — MineralWater",
  description:
    "Find the best mineral water for calcium, magnesium, bone health, athletes, and more. Data-driven recommendations.",
};

const categories = [
  {
    slug: "calcium",
    title: "Best for Calcium",
    description:
      "Mineral waters highest in calcium for bone health and muscle function.",
    icon: "Ca",
  },
  {
    slug: "magnesium",
    title: "Best for Magnesium",
    description:
      "Top picks for magnesium — essential for sleep, energy, and recovery.",
    icon: "Mg",
  },
  {
    slug: "low-sodium",
    title: "Best Low-Sodium",
    description:
      "Waters with the lowest sodium content for sodium-restricted diets.",
    icon: "Na",
  },
  {
    slug: "athletes",
    title: "Best for Athletes",
    description:
      "High-electrolyte waters for hydration during and after exercise.",
    icon: "E+",
  },
  {
    slug: "alkaline",
    title: "Best Alkaline Water",
    description:
      "Waters with the highest pH levels for those seeking alkaline hydration.",
    icon: "pH",
  },
  {
    slug: "sparkling",
    title: "Best Sparkling Water",
    description:
      "Top-rated sparkling mineral waters with rich mineral profiles.",
    icon: "CO2",
  },
  {
    slug: "budget",
    title: "Best Budget Picks",
    description:
      "Affordable mineral waters that offer great mineral content for the price.",
    icon: "$",
  },
  {
    slug: "silica",
    title: "Best for Skin & Hair",
    description:
      "High-silica waters that support collagen production and skin elasticity.",
    icon: "Si",
  },
];

export default async function BestForPage() {
  const supabase = await createClient();
  const { data: minerals } = await supabase
    .from("minerals")
    .select("slug, name, symbol")
    .order("name");

  const allMinerals = (minerals ?? []) as Pick<
    Mineral,
    "slug" | "name" | "symbol"
  >[];

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 py-8">
        <ScrollReveal>
          <h1 className="text-4xl font-bold mb-2">Best Mineral Water For...</h1>
          <p className="text-muted-foreground mb-12 max-w-2xl">
            Data-driven recommendations based on actual mineral content. Find
            the perfect water for your specific health goals.
          </p>
        </ScrollReveal>

        <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link key={cat.slug} href={`/best/${cat.slug}`}>
              <div className="glass-card p-6 group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full">
                <span className="w-12 h-12 rounded-full bg-ocean-surface/20 flex items-center justify-center text-sm font-bold text-ocean-surface mb-4">
                  {cat.icon}
                </span>
                <h3 className="text-lg font-bold mb-2 group-hover:text-ocean-surface transition-colors">
                  {cat.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </StaggerGrid>
      </section>

      <WaveDivider variant="gentle" />

      {/* By specific mineral */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <ScrollReveal>
          <h2 className="text-2xl font-bold mb-6">By Mineral</h2>
          <p className="text-muted-foreground mb-8">
            Find brands with the highest content of a specific mineral.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.15}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {allMinerals.map((mineral) => (
              <Link
                key={mineral.slug}
                href={`/best/${mineral.slug}`}
                className="glass-card p-4 text-center group hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
              >
                <span className="block text-lg font-bold text-ocean-surface mb-1 group-hover:scale-110 transition-transform">
                  {mineral.symbol}
                </span>
                <span className="text-sm text-muted-foreground">
                  {mineral.name}
                </span>
              </Link>
            ))}
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
