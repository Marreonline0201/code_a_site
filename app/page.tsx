import { createClient } from "@/lib/supabase/server";
import { OceanHeroSection } from "@/components/hero/OceanHeroSection";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import { StaggerGrid } from "@/components/animation/StaggerGrid";
import { WaveDivider } from "@/components/animation/WaveDivider";
import { ProductCard } from "@/components/ProductCard";
import Link from "next/link";
import { Droplets, Heart, Shield, Zap, Brain, Bone } from "lucide-react";
import type { Brand } from "@/lib/types";

export default async function HomePage() {
  const supabase = await createClient();

  // Check auth status
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

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
      {/* Ocean Hero — full viewport scroll experience */}
      <OceanHeroSection />

      <WaveDivider variant="gentle" />

      {/* ── Section 1: Why Minerals Matter ── */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Why Minerals Matter
          </h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-14">
            The water you drink is more than just H₂O. Mineral content varies
            dramatically between brands — and those minerals directly impact your health.
          </p>
        </ScrollReveal>

        <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="glass-card p-6">
            <div className="w-12 h-12 rounded-xl bg-ocean-surface/10 flex items-center justify-center mb-4">
              <Bone className="size-6 text-ocean-surface" />
            </div>
            <h3 className="text-lg font-bold mb-2">Bone & Joint Health</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Calcium and magnesium in mineral water contribute to bone density. Some brands provide up to 15% of your daily calcium per liter.
            </p>
          </div>
          <div className="glass-card p-6">
            <div className="w-12 h-12 rounded-xl bg-ocean-surface/10 flex items-center justify-center mb-4">
              <Heart className="size-6 text-ocean-surface" />
            </div>
            <h3 className="text-lg font-bold mb-2">Heart & Blood Pressure</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Magnesium helps regulate blood pressure and heart rhythm. Low-sodium mineral waters are ideal for those watching salt intake.
            </p>
          </div>
          <div className="glass-card p-6">
            <div className="w-12 h-12 rounded-xl bg-ocean-surface/10 flex items-center justify-center mb-4">
              <Brain className="size-6 text-ocean-surface" />
            </div>
            <h3 className="text-lg font-bold mb-2">Energy & Recovery</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Bicarbonate-rich waters help neutralize lactic acid after exercise. Electrolyte balance speeds up muscle recovery and reduces fatigue.
            </p>
          </div>
        </StaggerGrid>
      </section>

      <WaveDivider variant="choppy" />

      {/* ── Section 2: Why It's Important ── */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Not All Water Is Equal
          </h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-14">
            Most people never check what&apos;s in their water. The difference between brands can be dramatic.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ScrollReveal delay={0.1}>
            <div className="glass-card p-8">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="size-6 text-ocean-surface" />
                <h3 className="text-lg font-bold">Know Your Source</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Tap water quality varies wildly by city. Some municipal systems have had lead or contaminant violations. Mineral water from natural springs bypasses many of these concerns.
              </p>
              <Link href="/tap-water" className="text-sm text-primary font-medium hover:underline">
                Check your tap water quality →
              </Link>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <div className="glass-card p-8">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="size-6 text-ocean-surface" />
                <h3 className="text-lg font-bold">TDS Tells a Story</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Total Dissolved Solids (TDS) ranges from 30 mg/L (Smartwater) to 2,479 mg/L (Gerolsteiner). Higher TDS means more minerals — which affects taste, health benefits, and who the water is best for.
              </p>
              <Link href="/compare" className="text-sm text-primary font-medium hover:underline">
                Compare brands side-by-side →
              </Link>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="glass-card p-8">
              <div className="flex items-center gap-3 mb-4">
                <Droplets className="size-6 text-ocean-surface" />
                <h3 className="text-lg font-bold">pH & Alkalinity</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                pH ranges from 5.5 (Perrier) to 9.5 (Essentia). Alkaline waters may help with acid reflux, while naturally acidic sparkling waters offer a crisp, refreshing taste.
              </p>
              <Link href="/best/alkaline" className="text-sm text-primary font-medium hover:underline">
                Best alkaline waters →
              </Link>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <div className="glass-card p-8">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="size-6 text-ocean-surface" />
                <h3 className="text-lg font-bold">Daily Hydration Goals</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                The average adult needs 2-3 liters daily, more with exercise or hot weather. Tracking intake helps you stay consistent and understand your hydration patterns.
              </p>
              <Link href="/tracker" className="text-sm text-primary font-medium hover:underline">
                Start tracking →
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <WaveDivider variant="gentle" />

      {/* ── Section 3: Essential Minerals ── */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Essential Minerals
          </h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-14">
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

      <WaveDivider variant="choppy" />

      {/* ── Section 4: Top Picks ── */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Top Picks
          </h2>
          <p className="text-center text-muted-foreground max-w-xl mx-auto mb-14">
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
              View All 15 Brands →
            </Link>
          </div>
        </ScrollReveal>
      </section>

      <WaveDivider variant="deep" />

      {/* ── Section 5: CTA — auth-aware ── */}
      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Track Your Hydration
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Log your daily water intake, set personalized goals, and get smart
            reminders. Know exactly what minerals you&apos;re drinking.
          </p>
          {isLoggedIn ? (
            <Link
              href="/tracker"
              className="inline-block px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              Go to Tracker
            </Link>
          ) : (
            <Link
              href="/register"
              className="inline-block px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              Create Free Account
            </Link>
          )}
        </ScrollReveal>
      </section>
    </>
  );
}
