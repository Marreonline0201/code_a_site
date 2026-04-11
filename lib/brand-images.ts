/** Map brand slugs to their local image paths */
const BRAND_IMAGES: Record<string, string> = {
  "evian": "/images/evian.png",
  "fiji": "/images/fiji.png",
  "gerolsteiner": "/images/gerolsteiner.png",
  "san-pellegrino": "/images/san-pellegrino.png",
  "perrier": "/images/perrier.png",
  "voss": "/images/voss.png",
  "essentia": "/images/essentia.png",
  "smartwater": "/images/smartwater.png",
  "topo-chico": "/images/topo-chico.png",
  "mountain-valley": "/images/mountain-valley.png",
  "acqua-panna": "/images/acqua-panna.png",
  "waiakea": "/images/waiakea.png",
  "icelandic-glacial": "/images/icelandic.png",
  "liquid-death": "/images/liquid-death.png",
  "flow": "/images/flow.png",
};

export function getBrandImage(slug: string): string | null {
  return BRAND_IMAGES[slug] ?? null;
}
