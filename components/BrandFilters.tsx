"use client";

import { useState, useMemo } from "react";
import { ProductCard } from "@/components/ProductCard";
import type { Brand } from "@/lib/types";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";

type SortOption = "name" | "rating" | "price-low" | "price-high" | "tds" | "calcium" | "magnesium" | "ph";
type TypeFilter = "all" | "still" | "sparkling" | "both";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "name", label: "Name (A-Z)" },
  { value: "rating", label: "Rating (High-Low)" },
  { value: "price-low", label: "Price (Low-High)" },
  { value: "price-high", label: "Price (High-Low)" },
  { value: "tds", label: "TDS (High-Low)" },
  { value: "calcium", label: "Calcium (High-Low)" },
  { value: "magnesium", label: "Magnesium (High-Low)" },
  { value: "ph", label: "pH (High-Low)" },
];

const typeFilters: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "still", label: "Still" },
  { value: "sparkling", label: "Sparkling" },
  { value: "both", label: "Still & Sparkling" },
];

const priceMap: Record<string, number> = { "$": 1, "$$": 2, "$$$": 3 };

function sortBrands(brands: Brand[], sort: SortOption): Brand[] {
  const sorted = [...brands];
  switch (sort) {
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "rating":
      return sorted.sort((a, b) => b.rating - a.rating);
    case "price-low":
      return sorted.sort((a, b) => (priceMap[a.price_range] ?? 2) - (priceMap[b.price_range] ?? 2));
    case "price-high":
      return sorted.sort((a, b) => (priceMap[b.price_range] ?? 2) - (priceMap[a.price_range] ?? 2));
    case "tds":
      return sorted.sort((a, b) => b.tds - a.tds);
    case "calcium":
      return sorted.sort((a, b) => b.calcium - a.calcium);
    case "magnesium":
      return sorted.sort((a, b) => b.magnesium - a.magnesium);
    case "ph":
      return sorted.sort((a, b) => b.ph - a.ph);
    default:
      return sorted;
  }
}

export function BrandFilters({ brands }: { brands: Brand[] }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("rating");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = brands;

    // Type filter
    if (typeFilter !== "all") {
      result = result.filter((b) => b.type === typeFilter);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.origin.toLowerCase().includes(q) ||
          b.tasting_notes.toLowerCase().includes(q)
      );
    }

    // Sort
    return sortBrands(result, sort);
  }, [brands, search, sort, typeFilter]);

  return (
    <div>
      {/* ── Filter Bar ── */}
      <div className="sticky top-16 z-30 bg-background/80 backdrop-blur-lg border-b border-border py-4 -mx-4 px-4 mb-8">
        <div className="max-w-7xl mx-auto">
          {/* Top row: search + toggle */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search brands..."
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Filter toggle (mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden flex items-center gap-1.5 h-10 px-3 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-colors"
            >
              <SlidersHorizontal className="size-4" />
              Filters
            </button>

            {/* Desktop filters inline */}
            <div className="hidden sm:flex items-center gap-3">
              {/* Type chips */}
              <div className="flex items-center gap-1.5">
                {typeFilters.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTypeFilter(t.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      typeFilter === t.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Sort dropdown */}
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                  className="appearance-none h-10 pl-3 pr-8 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary cursor-pointer"
                >
                  {sortOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Mobile expanded filters */}
          {showFilters && (
            <div className="sm:hidden mt-3 flex flex-col gap-3">
              <div className="flex flex-wrap gap-1.5">
                {typeFilters.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTypeFilter(t.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      typeFilter === t.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                  className="appearance-none w-full h-10 pl-3 pr-8 rounded-xl border border-border bg-background text-sm outline-none"
                >
                  {sortOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      Sort: {o.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          )}

          {/* Result count */}
          <p className="text-xs text-muted-foreground mt-2">
            {filtered.length} brand{filtered.length !== 1 ? "s" : ""}
            {search && ` matching "${search}"`}
            {typeFilter !== "all" && ` · ${typeFilter}`}
            {` · sorted by ${sortOptions.find((o) => o.value === sort)?.label}`}
          </p>
        </div>
      </div>

      {/* ── Results Grid ── */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((brand) => (
            <ProductCard key={brand.slug} brand={brand} showAffiliate />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground">No brands found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your search or filters
          </p>
          <button
            onClick={() => { setSearch(""); setTypeFilter("all"); setSort("rating"); }}
            className="mt-4 text-sm text-primary hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
