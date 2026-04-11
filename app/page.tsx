import { createClient } from "@/lib/supabase/server";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import { StaggerGrid } from "@/components/animation/StaggerGrid";
import { OceanHeroSection } from "@/components/hero/OceanHeroSection";
import { WaveDivider } from "@/components/animation/WaveDivider";
import { HomePinnedStory } from "@/components/home/HomePinnedStory";
import { ProductCard } from "@/components/ProductCard";
import Link from "next/link";
import type { Brand } from "@/lib/types";

export default async function HomePage() {
  const supabase = await createClient();

  let isLoggedIn = false;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isLoggedIn = !!user;
  } catch {
    // Continue rendering the page if auth state is unavailable.
  }

  const { data: topBrands } = await supabase
    .from("brands")
    .select("*")
    .order("rating", { ascending: false })
    .limit(3);

  return (
    <>
      {/* Ocean Hero - full viewport scroll experience */}
      <div className="-mt-16">
        <OceanHeroSection />
      </div>

      <WaveDivider variant="gentle" />

      <div className="pb-20 md:pb-28">
        <HomePinnedStory />
      </div>

      <WaveDivider variant="gentle" />

      <section className="mx-auto max-w-4xl px-4 py-20">
        <ScrollReveal>
          <div className="glass-card p-8 text-center md:p-10">
            <span className="mx-auto mb-4 block text-4xl">{"\u{1F6B0}"}</span>
            <h2 className="mb-3 text-2xl font-bold md:text-3xl">
              Is your tap water safe?
            </h2>
            <p className="mx-auto mb-6 max-w-lg text-muted-foreground">
              Check recent violations and system data in a few seconds.
            </p>
            <Link
              href="/tap-water"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90"
            >
              Look up your water system &rarr;
            </Link>
          </div>
        </ScrollReveal>
      </section>

      <WaveDivider variant="choppy" />

      <section className="mx-auto max-w-7xl px-4 py-20">
        <ScrollReveal>
          <h2 className="mb-4 text-center text-3xl font-bold md:text-4xl">
            Top Picks
          </h2>
          <p className="mx-auto mb-14 max-w-xl text-center text-muted-foreground">
            Highest rated by mineral content, taste, and value.
          </p>
        </ScrollReveal>

        <StaggerGrid className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {(topBrands ?? []).map((brand) => (
            <ProductCard
              key={brand.slug}
              brand={brand as Brand}
              showAffiliate
            />
          ))}
        </StaggerGrid>
      </section>

      <WaveDivider variant="deep" />

      <section className="mx-auto max-w-4xl px-4 py-20 text-center">
        <ScrollReveal>
          <h2 className="mb-6 text-3xl font-bold md:text-4xl">
            Track Your Hydration
          </h2>
          <p className="mx-auto mb-8 max-w-lg text-muted-foreground">
            Log intake, set goals, and keep your daily routine in one place.
          </p>
          <Link
            href={isLoggedIn ? "/tracker" : "/register"}
            className="inline-block rounded-full bg-primary px-8 py-4 font-semibold text-primary-foreground transition-all duration-300 hover:scale-105 hover:bg-primary/90 hover:shadow-lg"
          >
            {isLoggedIn ? "Go to Tracker" : "Create Free Account"}
          </Link>
        </ScrollReveal>
      </section>
    </>
  );
}
