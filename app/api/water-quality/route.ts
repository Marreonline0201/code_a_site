import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { searchWaterSystems, type EchoWaterSystem } from "@/lib/epa/client";

export const dynamic = "force-dynamic";

// Simple in-memory cache
const cache = new Map<string, { data: unknown; expiresAt: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function getCached(key: string) {
  const entry = cache.get(key);
  if (!entry || Date.now() > entry.expiresAt) { cache.delete(key); return null; }
  return entry.data;
}

function setCache(key: string, data: unknown) {
  if (cache.size > 500) {
    const now = Date.now();
    for (const [k, v] of cache) { if (now > v.expiresAt) cache.delete(k); }
  }
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

/** Normalize ECHO data into a cleaner shape for the frontend */
function normalizeSystem(s: EchoWaterSystem) {
  const populationServed = s.PopulationServedCount ? parseInt(s.PopulationServedCount, 10) : null;
  const qtrsWithVio = parseInt(s.QtrsWithVio ?? "0", 10);
  const rulesVio3yr = parseInt(s.RulesVio3yr ?? "0", 10);
  const hasHealthViolation = s.HealthFlag === "Yes";
  const isSeriousViolator = s.SeriousViolator === "Yes";
  const hasCurrentViolation = s.CurrVioFlag === "1";
  const leadViolation = s.PbViol && s.PbViol !== "0" && s.PbViol !== "";
  const copperViolation = s.CuViol && s.CuViol !== "0" && s.CuViol !== "";

  let status: "good" | "watch" | "alert" = "good";
  if (isSeriousViolator || hasHealthViolation) status = "alert";
  else if (hasCurrentViolation || qtrsWithVio > 4) status = "watch";

  return {
    pwsid: s.PWSId,
    name: s.PWSName,
    type: s.PWSTypeDesc,
    source: s.PrimarySourceDesc,
    populationServed,
    state: s.StateCode,
    citiesServed: s.CitiesServed,
    countiesServed: s.CountiesServed,
    owner: s.OwnerDesc,
    serviceArea: s.ServiceAreaTypeDesc,
    status,
    isSeriousViolator,
    hasHealthViolation,
    hasCurrentViolation,
    leadViolation: !!leadViolation,
    copperViolation: !!copperViolation,
    quartersWithViolations: qtrsWithVio,
    rulesViolated3yr: rulesVio3yr,
    contaminantsInCurrentViolation: s.SDWAContaminantsInCurViol?.split(",").filter(Boolean) ?? [],
    contaminantsInViolation3yr: s.SDWAContaminantsInViol3yr?.split(",").filter(Boolean) ?? [],
    violationCategories: s.ViolationCategories?.split(",").filter(Boolean) ?? [],
    complianceHistory: s.SDWA3yrComplQtrsHistory,
    detailUrl: s.DfrUrl,
  };
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
  const { allowed, retryAfterMs } = rateLimit(`epa-search:${ip}`, { limit: 30, windowMs: 60_000 });

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } },
    );
  }

  const { searchParams } = request.nextUrl;
  const state = searchParams.get("state")?.trim().toUpperCase();
  const county = searchParams.get("county")?.trim();
  const city = searchParams.get("city")?.trim();

  if (!state) {
    return NextResponse.json(
      { error: "Provide a ?state=NY query parameter. Optionally add &county=NEW+YORK or &city=BROOKLYN." },
      { status: 400 },
    );
  }

  if (!/^[A-Z]{2}$/.test(state)) {
    return NextResponse.json({ error: "State must be a 2-letter code (e.g. NY, CA)." }, { status: 400 });
  }

  const cacheKey = `${state}:${county ?? ""}:${city ?? ""}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return NextResponse.json(cached, { headers: { "X-Cache": "HIT" } });
  }

  try {
    const systems = await searchWaterSystems({ state, county: county ?? undefined, city: city ?? undefined, limit: 25 });
    const normalized = systems.map(normalizeSystem);

    // Sort: alerts first, then by population
    normalized.sort((a, b) => {
      const priority = { alert: 0, watch: 1, good: 2 };
      const p = priority[a.status] - priority[b.status];
      if (p !== 0) return p;
      return (b.populationServed ?? 0) - (a.populationServed ?? 0);
    });

    const result = {
      systems: normalized,
      query: { state, county, city },
      totalSystems: normalized.length,
      timestamp: new Date().toISOString(),
    };

    setCache(cacheKey, result);

    return NextResponse.json(result, {
      headers: { "X-Cache": "MISS", "Cache-Control": "public, s-maxage=86400" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to query EPA water quality data. Please try again." },
      { status: 502 },
    );
  }
}
