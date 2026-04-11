import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import {
  fetchWaterSystemsByZip,
  fetchWaterSystemsByState,
  fetchViolations,
} from "@/lib/epa/client";
import { normalizeWaterSystem, normalizeViolation } from "@/lib/epa/normalize";
import type { WaterQualitySearchResult } from "@/lib/epa/types";

export const dynamic = "force-dynamic";

// Simple in-memory cache keyed by query string
const cache = new Map<string, { data: WaterQualitySearchResult; expiresAt: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function getCached(key: string): WaterQualitySearchResult | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: WaterQualitySearchResult): void {
  // Evict old entries if cache grows too large
  if (cache.size > 500) {
    const now = Date.now();
    for (const [k, v] of cache) {
      if (now > v.expiresAt) cache.delete(k);
    }
    // If still too big, clear oldest half
    if (cache.size > 500) {
      const keys = [...cache.keys()];
      for (let i = 0; i < keys.length / 2; i++) {
        cache.delete(keys[i]);
      }
    }
  }
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

export async function GET(request: NextRequest) {
  // Rate limit: 30 requests per minute per IP
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "anonymous";
  const { allowed, retryAfterMs } = rateLimit(`epa-search:${ip}`, {
    limit: 30,
    windowMs: 60_000,
  });

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) },
      },
    );
  }

  const { searchParams } = request.nextUrl;
  const zip = searchParams.get("zip")?.trim();
  const state = searchParams.get("state")?.trim()?.toUpperCase();

  if (!zip && !state) {
    return NextResponse.json(
      { error: "Provide a ?zip=12345 or ?state=NY query parameter." },
      { status: 400 },
    );
  }

  // Validate inputs
  if (zip && !/^\d{5}$/.test(zip)) {
    return NextResponse.json(
      { error: "ZIP code must be exactly 5 digits." },
      { status: 400 },
    );
  }
  if (state && !/^[A-Z]{2}$/.test(state)) {
    return NextResponse.json(
      { error: "State must be a 2-letter code (e.g. NY, CA)." },
      { status: 400 },
    );
  }

  const cacheKey = zip ? `zip:${zip}` : `state:${state}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: { "X-Cache": "HIT" },
    });
  }

  try {
    // Fetch water systems from EPA
    const rawSystems = zip
      ? await fetchWaterSystemsByZip(zip, 20)
      : await fetchWaterSystemsByState(state!, 20);

    // Fetch violations for each system (parallel, with concurrency limit)
    const systemsWithViolations = await Promise.allSettled(
      rawSystems.slice(0, 15).map(async (raw) => {
        const violations = await fetchViolations(raw.PWSID, 50);
        const normalizedViolations = violations.map(normalizeViolation);
        return normalizeWaterSystem(raw, violations);
      }),
    );

    const systems = systemsWithViolations
      .filter(
        (r): r is PromiseFulfilledResult<ReturnType<typeof normalizeWaterSystem>> =>
          r.status === "fulfilled",
      )
      .map((r) => r.value)
      .sort((a, b) => b.healthBasedViolationCount - a.healthBasedViolationCount);

    const result: WaterQualitySearchResult = {
      systems,
      query: zip ? { zip } : { state },
      totalSystems: systems.length,
      timestamp: new Date().toISOString(),
    };

    setCache(cacheKey, result);

    return NextResponse.json(result, {
      headers: {
        "X-Cache": "MISS",
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to query EPA SDWIS API.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
