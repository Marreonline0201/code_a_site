import { createClient } from "@/lib/supabase/server";
import { BrandFilters } from "@/components/BrandFilters";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import type { Brand } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Mineral Water Brands — MineralWater",
  description:
    "Browse and compare mineral water brands by mineral content, taste, and price.",
};

export default async function BrandsPage() {
  const supabase = await createClient();
  const { data: brands } = await supabase
    .from("brands")
    .select("*")
    .order("name");

  const allBrands = (brands ?? []) as Brand[];

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <ScrollReveal>
        <h1 className="text-4xl font-bold mb-2">Mineral Water Brands</h1>
        <p className="text-muted-foreground mb-4">
          Compare {allBrands.length} brands by mineral content, taste, and price.
        </p>
      </ScrollReveal>

      <BrandFilters brands={allBrands} />
    </section>
  );
}
