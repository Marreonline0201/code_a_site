import { createClient } from "@/lib/supabase/server";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import { WaveDivider } from "@/components/animation/WaveDivider";
import { CompareSelector } from "./CompareSelector";
import { getBrandImage } from "@/lib/brand-images";
import Image from "next/image";
import type { Brand } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Mineral Water Brands — MineralWater",
  description:
    "Compare mineral water brands side by side. See how they stack up on calcium, magnesium, sodium, TDS, pH, and more.",
};

export default async function ComparePage() {
  const supabase = await createClient();
  const { data: brands } = await supabase
    .from("brands")
    .select("*")
    .order("name");

  const allBrands = (brands ?? []) as Brand[];

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 py-8">
        <ScrollReveal>
          <h1 className="text-4xl font-bold mb-2">Compare Brands</h1>
          <p className="text-muted-foreground mb-8 max-w-2xl">
            Select two or more brands to compare their mineral profiles side by
            side.
          </p>
        </ScrollReveal>

        <CompareSelector brands={allBrands} />
      </section>

      <WaveDivider variant="gentle" />

      {/* Popular comparisons */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <ScrollReveal>
          <h2 className="text-2xl font-bold mb-6">Popular Comparisons</h2>
        </ScrollReveal>
        <ScrollReveal delay={0.15}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { a: "evian", b: "fiji", label: "Evian vs Fiji" },
              {
                a: "san-pellegrino",
                b: "perrier",
                label: "San Pellegrino vs Perrier",
              },
              {
                a: "gerolsteiner",
                b: "topo-chico",
                label: "Gerolsteiner vs Topo Chico",
              },
              { a: "voss", b: "smartwater", label: "Voss vs Smartwater" },
            ].map((pair) => {
              const imgA = getBrandImage(pair.a);
              const imgB = getBrandImage(pair.b);
              return (
                <a
                  key={pair.label}
                  href={`/compare/${pair.a}-vs-${pair.b}`}
                  className="glass-card p-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex items-center gap-3 group"
                >
                  <div className="flex items-center gap-1 shrink-0">
                    {imgA && (
                      <Image
                        src={imgA}
                        alt={pair.a}
                        width={20}
                        height={50}
                        className="object-contain h-[40px] w-auto"
                        unoptimized
                      />
                    )}
                    <span className="text-xs text-muted-foreground mx-1">vs</span>
                    {imgB && (
                      <Image
                        src={imgB}
                        alt={pair.b}
                        width={20}
                        height={50}
                        className="object-contain h-[40px] w-auto"
                        unoptimized
                      />
                    )}
                  </div>
                  <span className="font-medium group-hover:text-ocean-surface transition-colors flex-1">
                    {pair.label}
                  </span>
                  <span className="text-sm text-primary shrink-0">Compare</span>
                </a>
              );
            })}
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
