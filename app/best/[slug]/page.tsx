import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import { StaggerGrid } from "@/components/animation/StaggerGrid";
import { CountUp } from "@/components/animation/CountUp";
import { WaveDivider } from "@/components/animation/WaveDivider";
import { ParallaxLayer } from "@/components/animation/ParallaxLayer";
import { FloatingBubbles } from "@/components/animation/FloatingBubbles";
import { ProductCard } from "@/components/ProductCard";
import Link from "next/link";
import type { Brand } from "@/lib/types";
import type { Metadata } from "next";

interface BestForDetailPageProps {
  params: Promise<{ slug: string }>;
}

// Define the categories and their query strategies
interface CategoryConfig {
  title: string;
  description: string;
  icon: string;
  sortColumn: keyof Brand | null;
  ascending: boolean;
  filter?: (brand: Brand) => boolean;
  explanation: string;
}

function getCategoryConfig(slug: string): CategoryConfig | null {
  const configs: Record<string, CategoryConfig> = {
    calcium: {
      title: "Best Mineral Water for Calcium",
      description:
        "These brands have the highest calcium content, supporting bone health, muscle function, and nerve signaling.",
      icon: "Ca",
      sortColumn: "calcium",
      ascending: false,
      explanation:
        "Ranked by calcium content in mg/L. The daily recommended value is 1000mg. While mineral water alone won't meet your daily needs, high-calcium waters can meaningfully supplement your dietary intake.",
    },
    magnesium: {
      title: "Best Mineral Water for Magnesium",
      description:
        "Waters richest in magnesium — crucial for sleep quality, muscle recovery, energy production, and bone health.",
      icon: "Mg",
      sortColumn: "magnesium",
      ascending: false,
      explanation:
        "Ranked by magnesium content in mg/L. The daily recommended value is 420mg. Magnesium-rich mineral waters can provide a bioavailable supplemental source.",
    },
    sodium: {
      title: "Best Mineral Water for Sodium",
      description:
        "Brands with notable sodium content for electrolyte replenishment and fluid balance.",
      icon: "Na",
      sortColumn: "sodium",
      ascending: false,
      explanation:
        "Ranked by sodium content in mg/L. While most people get enough sodium from food, athletes and those in hot climates may benefit from sodium-containing mineral waters for electrolyte balance.",
    },
    "low-sodium": {
      title: "Best Low-Sodium Mineral Water",
      description:
        "For those on sodium-restricted diets, these brands have the lowest sodium content.",
      icon: "Na",
      sortColumn: "sodium",
      ascending: true,
      explanation:
        "Ranked by lowest sodium content. If your doctor has recommended a low-sodium diet, these waters are safe choices that still provide other beneficial minerals.",
    },
    athletes: {
      title: "Best Mineral Water for Athletes",
      description:
        "High in key electrolytes (sodium, potassium, magnesium) for hydration during and after exercise.",
      icon: "E+",
      sortColumn: "tds",
      ascending: false,
      filter: (b: Brand) => b.sodium + b.potassium + b.magnesium > 30,
      explanation:
        "Ranked by total dissolved solids (TDS), filtered for waters with meaningful electrolyte content (sodium + potassium + magnesium > 30 mg/L). Higher TDS generally means more electrolytes for recovery.",
    },
    alkaline: {
      title: "Best Alkaline Mineral Water",
      description:
        "Waters with the highest pH for those seeking alkaline hydration.",
      icon: "pH",
      sortColumn: "ph",
      ascending: false,
      explanation:
        "Ranked by pH level. Alkaline waters (pH > 7.5) are sought by some for their potential to neutralize acid in the body. Scientific evidence on health benefits varies.",
    },
    sparkling: {
      title: "Best Sparkling Mineral Water",
      description:
        "Top-rated sparkling waters with rich mineral profiles and satisfying carbonation.",
      icon: "CO2",
      sortColumn: "rating",
      ascending: false,
      filter: (b: Brand) => b.type === "sparkling" || b.type === "both",
      explanation:
        "Sparkling and dual-variety brands ranked by rating. Carbonation can enhance mineral absorption and provide a refreshing drinking experience.",
    },
    budget: {
      title: "Best Budget Mineral Water",
      description:
        "Affordable waters that deliver solid mineral content without the premium price.",
      icon: "$",
      sortColumn: "tds",
      ascending: false,
      filter: (b: Brand) => b.price_range === "$",
      explanation:
        "Budget-friendly waters ($ price range) ranked by TDS — more minerals for less money. You don't need to spend a lot to get quality mineral water.",
    },
    silica: {
      title: "Best Mineral Water for Skin & Hair",
      description:
        "High-silica waters that promote collagen production, skin elasticity, and stronger hair and nails.",
      icon: "Si",
      sortColumn: "silica",
      ascending: false,
      explanation:
        "Ranked by silica content in mg/L. Silica supports collagen production and has been studied for its role in maintaining skin, hair, and nail health.",
    },
    potassium: {
      title: "Best Mineral Water for Potassium",
      description:
        "Waters with the highest potassium for heart rhythm regulation and blood pressure control.",
      icon: "K",
      sortColumn: "potassium",
      ascending: false,
      explanation:
        "Ranked by potassium content in mg/L. While mineral water typically contains modest potassium levels compared to food sources, every bit contributes to your daily 2600mg recommended intake.",
    },
    bicarbonate: {
      title: "Best Mineral Water for Bicarbonate",
      description:
        "High-bicarbonate waters for digestive comfort, acid-base balance, and exercise recovery.",
      icon: "HCO3",
      sortColumn: "bicarbonate",
      ascending: false,
      explanation:
        "Ranked by bicarbonate content in mg/L. Bicarbonate-rich waters have been studied for digestive benefits and may help buffer lactic acid after intense exercise.",
    },
    sulfate: {
      title: "Best Mineral Water for Sulfate",
      description:
        "Waters rich in sulfate for digestive health, liver function, and joint support.",
      icon: "SO4",
      sortColumn: "sulfate",
      ascending: false,
      explanation:
        "Ranked by sulfate content in mg/L. Sulfate-rich waters have a long history of use in European spa traditions for digestive and liver health.",
    },
    chloride: {
      title: "Best Mineral Water for Chloride",
      description:
        "Waters with notable chloride content for fluid balance and digestive acid production.",
      icon: "Cl",
      sortColumn: "chloride",
      ascending: false,
      explanation:
        "Ranked by chloride content in mg/L. Chloride works with sodium to maintain proper fluid balance in the body.",
    },
    fluoride: {
      title: "Best Mineral Water for Fluoride",
      description:
        "Waters with fluoride for tooth enamel strengthening and cavity prevention.",
      icon: "F",
      sortColumn: "fluoride",
      ascending: false,
      explanation:
        "Ranked by fluoride content in mg/L. The recommended upper limit for fluoride in drinking water is 4 mg/L. Moderate fluoride intake supports dental health.",
    },
    tds: {
      title: "Highest TDS Mineral Water",
      description:
        "Waters with the highest total dissolved solids — an indicator of overall mineral richness.",
      icon: "TDS",
      sortColumn: "tds",
      ascending: false,
      explanation:
        "Ranked by TDS (Total Dissolved Solids) in mg/L. TDS measures all dissolved minerals combined. Higher TDS generally means more mineral-rich and more complex tasting.",
    },
  };
  return configs[slug] ?? null;
}

export async function generateMetadata({
  params,
}: BestForDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const config = getCategoryConfig(slug);
  if (!config) return { title: "Category Not Found" };

  return {
    title: `${config.title} — MineralWater`,
    description: config.description,
  };
}

export default async function BestForDetailPage({
  params,
}: BestForDetailPageProps) {
  const { slug } = await params;
  const config = getCategoryConfig(slug);
  if (!config) notFound();

  const supabase = await createClient();

  let query = supabase.from("brands").select("*");
  if (config.sortColumn) {
    query = query.order(config.sortColumn, {
      ascending: config.ascending,
    });
  }

  const { data: brandsData } = await query;
  let brands = (brandsData ?? []) as Brand[];

  if (config.filter) {
    brands = brands.filter(config.filter);
  }

  const topBrands = brands.slice(0, 5);

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[40vh] flex items-center justify-center overflow-hidden -mt-16">
        <ParallaxLayer speed={0.3} className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-ocean-deep via-ocean-mid to-ocean-surface" />
        </ParallaxLayer>
        <FloatingBubbles count={10} />
        <div className="relative z-10 text-center px-4 pt-16">
          <ScrollReveal>
            <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 text-xl font-bold text-white mb-6">
              {config.icon}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
              {config.title}
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              {config.description}
            </p>
          </ScrollReveal>
        </div>
      </section>

      <WaveDivider variant="gentle" />

      {/* Methodology */}
      <section className="max-w-3xl mx-auto px-4 py-8">
        <ScrollReveal>
          <div className="glass-card p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              How we ranked
            </h2>
            <p className="text-muted-foreground">{config.explanation}</p>
          </div>
        </ScrollReveal>
      </section>

      {/* Top 5 Picks */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <ScrollReveal>
          <h2 className="text-2xl font-bold mb-8">Top {topBrands.length} Picks</h2>
        </ScrollReveal>

        <div className="space-y-4">
          {topBrands.map((brand, index) => (
            <ScrollReveal key={brand.slug} delay={index * 0.1}>
              <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <span className="w-10 h-10 rounded-full bg-ocean-surface/20 flex items-center justify-center text-lg font-bold text-ocean-surface shrink-0">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      href={`/brands/${brand.slug}`}
                      className="text-lg font-bold hover:text-ocean-surface transition-colors"
                    >
                      {brand.name}
                    </Link>
                    <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                      {brand.type}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {brand.origin} &middot; {brand.price_range} &middot;{" "}
                    {brand.rating.toFixed(1)} ★
                  </p>
                </div>
                <div className="flex gap-4 shrink-0">
                  {config.sortColumn &&
                    config.sortColumn !== "rating" && (
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">
                          {String(config.sortColumn)}
                        </p>
                        <p className="text-xl font-bold text-ocean-surface">
                          <CountUp
                            end={
                              (brand[config.sortColumn] as number) ?? 0
                            }
                            decimals={
                              config.sortColumn === "ph"
                                ? 1
                                : (brand[config.sortColumn] as number) < 1
                                  ? 2
                                  : 0
                            }
                          />
                        </p>
                      </div>
                    )}
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">TDS</p>
                    <p className="text-xl font-bold">
                      <CountUp end={brand.tds} />
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <WaveDivider variant="choppy" />

      {/* All ranked brands */}
      {brands.length > 5 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <ScrollReveal>
            <h2 className="text-2xl font-bold mb-8">All Ranked Brands</h2>
          </ScrollReveal>
          <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {brands.slice(5).map((brand) => (
              <ProductCard key={brand.slug} brand={brand} />
            ))}
          </StaggerGrid>
        </section>
      )}

      {/* Navigation */}
      <section className="max-w-3xl mx-auto px-4 pb-12">
        <div className="flex justify-between">
          <Link
            href="/best"
            className="text-sm font-medium text-primary hover:underline"
          >
            ← All Categories
          </Link>
          <Link
            href="/compare"
            className="text-sm font-medium text-primary hover:underline"
          >
            Compare Brands →
          </Link>
        </div>
      </section>
    </>
  );
}
