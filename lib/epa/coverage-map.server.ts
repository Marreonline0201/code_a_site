import "server-only";

import { getApproximateCoveragePoint, STATE_NAMES, type CoverageCoordinate } from "./coverage-map";
import type { EchoWaterSystem } from "./client";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const REQUEST_TIMEOUT_MS = 10_000;
const cache = new Map<string, CoverageCoordinate | null>();
const pending = new Map<string, Promise<CoverageCoordinate | null>>();

function cleanString(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

function uniqueStrings(values: Array<string | null | undefined>) {
  const seen = new Set<string>();
  const output: string[] = [];

  for (const value of values) {
    const cleaned = cleanString(value);
    if (!cleaned) {
      continue;
    }

    const key = cleaned.toLowerCase().replace(/\s+/g, " ");
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    output.push(cleaned);
  }

  return output;
}

function splitLocationParts(value: string | null | undefined) {
  const cleaned = cleanString(value);
  if (!cleaned) {
    return [];
  }

  return uniqueStrings(
    cleaned
      .split(/\s*(?:,|;|\/|\||\band\b)\s*/i)
      .map((part) => part.trim())
      .filter(Boolean),
  );
}

function extractZipCodes(value: string | null | undefined) {
  const cleaned = cleanString(value);
  if (!cleaned) {
    return [];
  }

  return uniqueStrings(cleaned.match(/\b\d{5}\b/g) ?? []);
}

function buildQueryCandidates(system: EchoWaterSystem) {
  const stateName = STATE_NAMES[system.StateCode] ?? system.StateCode;
  const cityRaw = cleanString(system.CitiesServed);
  const countyRaw = cleanString(system.CountiesServed);
  const zipCodes = extractZipCodes(system.ZipCodesServed);
  const cityParts = splitLocationParts(system.CitiesServed);
  const countyParts = splitLocationParts(system.CountiesServed);

  return uniqueStrings([
    ...zipCodes.map((zip) => `${zip}, ${stateName}, USA`),
    ...zipCodes.map((zip) => `${zip}, USA`),
    ...(cityRaw ? [`${cityRaw}, ${stateName}, USA`, `${cityRaw}, ${system.StateCode}, USA`] : []),
    ...cityParts.flatMap((city) => [
      `${city}, ${stateName}, USA`,
      `${city}, ${system.StateCode}, USA`,
    ]),
    ...(countyRaw
      ? [
          `${countyRaw}, ${stateName}, USA`,
          `${countyRaw}, ${system.StateCode}, USA`,
        ]
      : []),
    ...countyParts.flatMap((county) => {
      const normalizedCounty = county.match(/\bcounty\b/i) ? county : `${county} County`;
      return [
        `${normalizedCounty}, ${stateName}, USA`,
        `${normalizedCounty}, ${system.StateCode}, USA`,
      ];
    }),
    `${stateName}, USA`,
    `${system.StateCode}, USA`,
  ]);
}

async function geocodeQuery(query: string): Promise<CoverageCoordinate | null> {
  const cacheKey = query.toLowerCase().replace(/\s+/g, " ").trim();

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey) ?? null;
  }

  const existing = pending.get(cacheKey);
  if (existing) {
    return existing;
  }

  const promise = (async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const url = new URL(NOMINATIM_URL);
      url.searchParams.set("q", query);
      url.searchParams.set("format", "jsonv2");
      url.searchParams.set("limit", "1");
      url.searchParams.set("countrycodes", "us");
      url.searchParams.set("addressdetails", "1");

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "User-Agent":
            process.env.EPA_COVERAGE_GEOCODER_USER_AGENT ??
            "code-a-site/1.0 (interactive coverage map)",
        },
      });

      if (!response.ok) {
        return null;
      }

      const body = (await response.json()) as Array<{ lat: string; lon: string }>;
      const match = body[0];
      if (!match) {
        return null;
      }

      const latitude = Number(match.lat);
      const longitude = Number(match.lon);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return null;
      }

      return {
        latitude,
        longitude,
        source: "geocoded" as const,
        label: query.replace(/,\s*USA$/i, ""),
      };
    } catch {
      return null;
    } finally {
      clearTimeout(timeout);
    }
  })();

  pending.set(cacheKey, promise);

  try {
    const resolved = await promise;
    cache.set(cacheKey, resolved);
    return resolved;
  } finally {
    pending.delete(cacheKey);
  }
}

function getFallbackLabel(system: EchoWaterSystem) {
  return cleanString(system.CitiesServed) ?? cleanString(system.CountiesServed) ?? STATE_NAMES[system.StateCode] ?? system.StateCode;
}

export async function resolveCoverageCoordinate(
  system: EchoWaterSystem,
  index: number,
  total: number,
): Promise<CoverageCoordinate> {
  // Prefer ArcGIS centroid coordinates (already resolved, no API call needed)
  if (system.Latitude != null && system.Longitude != null &&
      Number.isFinite(system.Latitude) && Number.isFinite(system.Longitude)) {
    return {
      latitude: system.Latitude,
      longitude: system.Longitude,
      source: "geocoded" as const,
      label: cleanString(system.CitiesServed) ?? cleanString(system.CountiesServed) ?? STATE_NAMES[system.StateCode] ?? system.StateCode,
    };
  }

  // Fall back to Nominatim geocoding
  const candidates = buildQueryCandidates(system);

  for (const candidate of candidates) {
    const geocoded = await geocodeQuery(candidate);
    if (geocoded) {
      return geocoded;
    }
  }

  const [latitude, longitude] = getApproximateCoveragePoint(
    system.PWSId,
    system.StateCode,
    index,
    total,
  );

  return {
    latitude,
    longitude,
    source: "approximate" as const,
    label: getFallbackLabel(system),
  };
}

export function buildCoverageQueryCandidatesForTest(system: Pick<EchoWaterSystem, "CitiesServed" | "CountiesServed" | "ZipCodesServed" | "StateCode">) {
  return buildQueryCandidates(system as EchoWaterSystem);
}
