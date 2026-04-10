import { OceanHeroWrapper } from "@/components/animation/OceanHeroWrapper";
import { FloatingBubbles } from "@/components/animation/FloatingBubbles";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import { WaveDivider } from "@/components/animation/WaveDivider";
import { StaggerGrid } from "@/components/animation/StaggerGrid";
import { createClient } from "@/lib/supabase/server";
import type { Brand } from "@/lib/types";
import Link from "next/link";

const mineralHighlights = [
  {
    slug: "calcium",
    symbol: "Ca",
    name: "Calcium",
    description: "Strengthens bones and teeth, supports muscle function",
  },
  {
    slug: "magnesium",
    symbol: "Mg",
    name: "Magnesium",
    description: "Improves sleep quality, energy production, muscle recovery",
  },
  {
    slug: "sodium",
    symbol: "Na",
    name: "Sodium",
    description: "Maintains fluid balance and nerve impulse transmission",
  },
  {
    slug: "potassium",
    symbol: "K",
    name: "Potassium",
    description: "Regulates heart rhythm and blood pressure",
  },
  {
    slug: "bicarbonate",
    symbol: "HCO3",
    name: "Bicarbonate",
    description: "Aids digestion and acid-base balance in the body",
  },
  {
    slug: "silica",
    symbol: "SiO2",
    name: "Silica",
    description: "Promotes skin elasticity, hair and nail strength",
  },
];

export default async function HomePage() {
  const supabase = await createClient();
  const { data: topBrands } = await supabase
    .from("brands")
    .select("*")
    .order("rating", { ascending: false })
    .limit(3);

  const brands = (topBrands ?? []) as Brand[];

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden -mt-16">
        <OceanHeroWrapper />
        <FloatingBubbles count={20} />
        <div className="relative z-10 text-center px-4 max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
            Find Your Perfect Water
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-8">
            Compare mineral water brands by mineral content. Track your
            hydration. Discover what&apos;s in every bottle.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/brands"
              className="px-6 py-3 bg-white text-ocean-deep font-semibold rounded-lg hover:bg-white/90 transition"
            >
              Explore Brands
            </Link>
            <Link
              href="/register"
              className="px-6 py-3 glass text-white font-semibold rounded-lg hover:bg-white/20 transition"
            >
              Start Tracking
            </Link>
          </div>
        </div>
      </section>

      <WaveDivider variant="gentle" />

      {/* Top Picks Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Top Picks
          </h2>
        </ScrollReveal>
        <StaggerGrid className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {brands.length > 0
            ? brands.map((brand) => (
                <Link key={brand.slug} href={`/brands/${brand.slug}`}>
                  <div className="glass-card p-6 group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="flex justify-between items-start mb-3">
                      <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                        {brand.type}
                      </span>
                      <span className="text-sm font-semibold text-ocean-surface">
                        {brand.rating.toFixed(1)} ★
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-1 group-hover:text-ocean-surface transition-colors">
                      {brand.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {brand.origin}
                    </p>
                    <div className="flex gap-4 mb-4">
                      <div className="text-center">
                        <span className="text-xs text-muted-foreground">
                          Ca
                        </span>
                        <p className="text-sm font-semibold">
                          {brand.calcium}
                        </p>
                      </div>
                      <div className="text-center">
                        <span className="text-xs text-muted-foreground">
                          Mg
                        </span>
                        <p className="text-sm font-semibold">
                          {brand.magnesium}
                        </p>
                      </div>
                      <div className="text-center">
                        <span className="text-xs text-muted-foreground">
                          TDS
                        </span>
                        <p className="text-sm font-semibold">{brand.tds}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {brand.tasting_notes}
                    </p>
                  </div>
                </Link>
              ))
            : Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="glass-card p-6 h-48 flex items-center justify-center text-muted-foreground"
                >
                  Brand cards loaded from Supabase
                </div>
              ))}
        </StaggerGrid>
        <div className="text-center mt-8">
          <Link
            href="/brands"
            className="inline-block px-6 py-3 border border-border rounded-lg font-medium hover:bg-secondary transition-colors"
          >
            View All Brands
          </Link>
        </div>
      </section>

      <WaveDivider variant="choppy" />

      {/* Minerals Quick Links */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Essential Minerals
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={0.2}>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
            Every mineral water has a unique profile. Learn what each mineral
            does for your body and which brands deliver the most.
          </p>
        </ScrollReveal>
        <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mineralHighlights.map((mineral) => (
            <Link key={mineral.slug} href={`/minerals/${mineral.slug}`}>
              <div className="glass-card p-6 group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-10 h-10 rounded-full bg-ocean-surface/20 flex items-center justify-center text-sm font-bold text-ocean-surface">
                    {mineral.symbol}
                  </span>
                  <h3 className="text-lg font-bold group-hover:text-ocean-surface transition-colors">
                    {mineral.name}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {mineral.description}
                </p>
              </div>
            </Link>
          ))}
        </StaggerGrid>
        <div className="text-center mt-8">
          <Link
            href="/minerals"
            className="inline-block px-6 py-3 border border-border rounded-lg font-medium hover:bg-secondary transition-colors"
          >
            Explore All Minerals
          </Link>
        </div>
      </section>

      <WaveDivider variant="deep" />

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Track Your Hydration
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Log your daily water intake, set personalized goals, and get smart
            reminders. Know exactly what minerals you&apos;re consuming.
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition"
          >
            Create Free Account
          </Link>
        </ScrollReveal>
      </section>
    </>
  );
}
