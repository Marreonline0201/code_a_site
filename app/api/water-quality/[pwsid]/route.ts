import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { fetchWaterSystem, fetchViolations } from "@/lib/epa/client";
import {
  normalizeWaterSystem,
  normalizeViolation,
  filterRecentViolations,
} from "@/lib/epa/normalize";
import type { WaterSystemDetailResult } from "@/lib/epa/types";

export const dynamic = "force-dynamic";

// Simple in-memory cache
const cache = new Map<string, { data: WaterSystemDetailResult; expiresAt: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pwsid: string }> },
) {
  const { pwsid } = await params;

  // Rate limit
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "anonymous";
  const { allowed, retryAfterMs } = rateLimit(`epa-detail:${ip}`, {
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

  if (!pwsid || pwsid.length < 4 || pwsid.length > 12) {
    return NextResponse.json(
      { error: "Invalid PWSID format." },
      { status: 400 },
    );
  }

  // Check cache
  const cached = cache.get(pwsid);
  if (cached && Date.now() < cached.expiresAt) {
    return NextResponse.json(cached.data, {
      headers: { "X-Cache": "HIT" },
    });
  }

  try {
    // Fetch system info and violations in parallel
    const [rawSystem, rawViolations] = await Promise.all([
      fetchWaterSystem(pwsid),
      fetchViolations(pwsid, 200),
    ]);

    if (!rawSystem) {
      return NextResponse.json(
        { error: `Water system ${pwsid} not found.` },
        { status: 404 },
      );
    }

    const violations = rawViolations.map(normalizeViolation);
    const system = normalizeWaterSystem(rawSystem, rawViolations);
    const recentViolations = filterRecentViolations(violations);

    const result: WaterSystemDetailResult = {
      system,
      violations,
      recentViolations,
      timestamp: new Date().toISOString(),
    };

    // Cache
    if (cache.size > 500) {
      const now = Date.now();
      for (const [k, v] of cache) {
        if (now > v.expiresAt) cache.delete(k);
      }
    }
    cache.set(pwsid, { data: result, expiresAt: Date.now() + CACHE_TTL_MS });

    return NextResponse.json(result, {
      headers: {
        "X-Cache": "MISS",
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch water system details.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
