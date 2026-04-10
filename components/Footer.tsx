import Link from "next/link";
import { Droplets } from "lucide-react";

const navigateLinks = [
  { label: "Brands", href: "/brands" },
  { label: "Minerals", href: "/minerals" },
  { label: "Compare", href: "/compare" },
  { label: "Tracker", href: "/tracker" },
  { label: "Blog", href: "/blog" },
];

const legalLinks = [
  { label: "About", href: "/about" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <Droplets className="size-5 text-primary" />
              <h3 className="font-bold text-lg">MineralWater</h3>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The authoritative resource for mineral water information.
              Compare brands, track hydration, and find the perfect water for
              your health goals.
            </p>
          </div>

          {/* Navigate column */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Navigate</h4>
            <ul className="space-y-2">
              {navigateLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal column */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Legal</h4>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Affiliate disclaimer */}
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground leading-relaxed">
            As an Amazon Associate, we earn from qualifying purchases. Product
            prices and availability are accurate as of the date/time indicated
            and are subject to change. Any price and availability information
            displayed on Amazon at the time of purchase will apply to the
            purchase of the product.
          </p>
          <p className="text-xs text-muted-foreground mt-3">
            &copy; {new Date().getFullYear()} MineralWater. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
