import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { getAllPosts } from "@/lib/blog";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mineralwater.com";

// Best-for category slugs (must match app/best/[slug]/page.tsx)
const bestForSlugs = [
  "calcium",
  "magnesium",
  "sodium",
  "low-sodium",
  "athletes",
  "alkaline",
  "sparkling",
  "budget",
  "silica",
  "potassium",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  // Fetch brand slugs and mineral slugs in parallel
  const [brandsResult, mineralsResult] = await Promise.all([
    supabase.from("brands").select("slug, updated_at"),
    supabase.from("minerals").select("slug"),
  ]);

  const brands = brandsResult.data ?? [];
  const minerals = mineralsResult.data ?? [];

  // Get blog posts from filesystem
  const posts = getAllPosts();

  const now = new Date().toISOString();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/brands`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/minerals`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/compare`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  // Brand detail pages
  const brandPages: MetadataRoute.Sitemap = brands.map((brand) => ({
    url: `${BASE_URL}/brands/${brand.slug}`,
    lastModified: brand.updated_at ?? now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Mineral detail pages
  const mineralPages: MetadataRoute.Sitemap = minerals.map((mineral) => ({
    url: `${BASE_URL}/minerals/${mineral.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Best-for category pages
  const bestForPages: MetadataRoute.Sitemap = bestForSlugs.map((slug) => ({
    url: `${BASE_URL}/best/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Blog post pages
  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.date || now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...brandPages,
    ...mineralPages,
    ...bestForPages,
    ...blogPages,
  ];
}
