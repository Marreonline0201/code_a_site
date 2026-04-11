import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { getBrandImage } from "@/lib/brand-images";
import type { Brand } from "@/lib/types";

interface ProductCardProps {
  brand: Brand;
  showAffiliate?: boolean;
}

export function ProductCard({ brand, showAffiliate = false }: ProductCardProps) {
  const mineralHighlight = [
    { label: "Ca", value: brand.calcium },
    { label: "Mg", value: brand.magnesium },
    { label: "Na", value: brand.sodium },
  ];
  const brandImage = getBrandImage(brand.slug);

  return (
    <div className="glass-card p-5 group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <Link href={`/brands/${brand.slug}`}>
        <div className="flex justify-between items-start mb-3">
          <Badge variant="secondary" className="text-xs">
            {brand.type}
          </Badge>
          <span className="text-sm font-semibold text-ocean-surface">
            {brand.rating.toFixed(1)} ★
          </span>
        </div>

        {/* Bottle image */}
        {brandImage && (
          <div className="flex justify-center my-4">
            <Image
              src={brandImage}
              alt={`${brand.name} bottle`}
              width={60}
              height={150}
              className="object-contain h-[120px] drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)] group-hover:scale-105 transition-transform duration-300"
              unoptimized
            />
          </div>
        )}

        <h3 className="text-lg font-bold mb-1 group-hover:text-ocean-surface transition-colors">
          {brand.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-3">{brand.origin}</p>

        <div className="flex gap-3 mb-4">
          {mineralHighlight.map((m) => (
            <div key={m.label} className="text-center">
              <span className="text-xs text-muted-foreground">{m.label}</span>
              <p className="text-sm font-semibold">{m.value}</p>
            </div>
          ))}
          <div className="text-center">
            <span className="text-xs text-muted-foreground">TDS</span>
            <p className="text-sm font-semibold">{brand.tds}</p>
          </div>
        </div>
      </Link>

      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          {brand.price_range}
        </span>
        {showAffiliate ? (
          <a
            href={`/go/${brand.slug}`}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-flex items-center gap-1.5 text-xs font-medium bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors"
          >
            <ShoppingCart className="size-3" />
            Amazon
          </a>
        ) : (
          <Link href={`/brands/${brand.slug}`} className="text-sm font-medium text-primary group-hover:underline">
            View Details →
          </Link>
        )}
      </div>
    </div>
  );
}
