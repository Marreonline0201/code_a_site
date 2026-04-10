import { createClient } from "@/lib/supabase/server";
import { OceanHeroSection } from "@/components/hero/OceanHeroSection";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import { StaggerGrid } from "@/components/animation/StaggerGrid";
import { WaveDivider } from "@/components/animation/WaveDivider";
import { ProductCard } from "@/components/ProductCard";
import Link from "next/link";
import type { Brand } from "@/lib/types";

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch top-rated brands for "Top Picks"
  const { data: topBrands } = await supabase
    .from("brands")
    .select("*")
    .order("rating", { ascending: false })
    .limit(3);

  // Fetch minerals for quick links
  const { data: minerals } = await supabase
    .from("minerals")
    .select("slug, name, symbol, benefits")
    .order("name")
    .limit(6);

  return (
    <>
      {/* Ocean Hero — full viewport */}
      <OceanHeroSection />

      <WaveDivider variant="gentle" />

      {/* Top Picks Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Top Picks
          </h2>
          <p className="text-center text-muted-foreground max-w-xl mx-auto mb-12">
            Our highest-rated mineral water brands based on mineral content, taste, and value.
          </p>
        </ScrollReveal>
        <StaggerGrid className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(topBrands ?? []).map((brand) => (
            <ProductCard
              key={brand.slug}
              brand={brand as Brand}
              showAffiliate
            />
          ))}
        </StaggerGrid>
        <ScrollReveal delay={0.3}>
          <div className="text-center mt-10">
            <Link
              href="/brands"
              className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
            >
              View All Brands →
            </Link>
          </div>
        </ScrollReveal>
      </section>

      <WaveDivider variant="choppy" />

      {/* Minerals Quick Links */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Essential Minerals
          </h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
            Every mineral water has a unique profile. Learn what each mineral
            does for your body and which brands deliver the most.
          </p>
        </ScrollReveal>
        <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {(minerals ?? []).map((mineral) => (
            <Link key={mineral.slug} href={`/minerals/${mineral.slug}`}>
              <div className="glass-card p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                <div className="flex items-center gap-3 mb-3">
                  {mineral.symbol && (
                    <span className="w-10 h-10 rounded-full bg-ocean-surface/20 flex items-center justify-center text-sm font-bold text-ocean-surface">
                      {mineral.symbol}
                    </span>
                  )}
                  <h3 className="text-lg font-bold group-hover:text-ocean-surface transition-colors">
                    {mineral.name}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {mineral.benefits?.[0]
                    ? `${mineral.benefits[0]}${mineral.benefits[1] ? `, ${mineral.benefits[1].toLowerCase()}` : ""}`
                    : "Essential for your health"}
                </p>
              </div>
            </Link>
          ))}
        </StaggerGrid>
        <ScrollReveal delay={0.3}>
          <div className="text-center mt-10">
            <Link
              href="/minerals"
              className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
            >
              Explore All Minerals →
            </Link>
          </div>
        </ScrollReveal>
      </section>

      <WaveDivider variant="deep" />

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Track Your Hydration
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Log your daily water intake, set personalized goals, and get smart
            reminders. Know exactly what minerals you&apos;re drinking.
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            Create Free Account
          </Link>
        </ScrollReveal>
      </section>
    </>
  );
}
