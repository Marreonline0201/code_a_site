/**
 * EPA Envirofacts SDWIS API client.
 *
 * Free, no key required.  Base URL: https://data.epa.gov/efservice/
 * Always append /JSON so we get JSON instead of XML.
 */

import type {
  EpaWaterSystem,
  EpaViolation,
  EpaGeographicArea,
} from "./types";

const BASE = "https://data.epa.gov/efservice";

// Generous timeout — the EPA API can be very slow (2-5s typical, 10s+ edge cases)
const FETCH_TIMEOUT_MS = 15_000;

async function epaFetch<T>(path: string): Promise<T[]> {
  const url = `${BASE}${path}/JSON`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      next: { revalidate: 86400 }, // 24h cache at fetch level
    });

    if (!res.ok) {
      throw new Error(`EPA API error: ${res.status} ${res.statusText}`);
    }

    const text = await res.text();
    if (!text || text.trim() === "" || text.trim() === "[]") {
      return [];
    }

    try {
      const data = JSON.parse(text);
      return Array.isArray(data) ? data : [];
    } catch {
      // EPA sometimes returns XML or HTML error pages even with /JSON suffix
      return [];
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("EPA API request timed out. Please try again.");
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Find water systems by state code (e.g. "NY", "CA").
 * Returns up to `limit` active community water systems.
 */
export async function fetchWaterSystemsByState(
  stateCode: string,
  limit = 20,
): Promise<EpaWaterSystem[]> {
  const upper = stateCode.toUpperCase().slice(0, 2);
  return epaFetch<EpaWaterSystem>(
    `/WATER_SYSTEM/STATE_CODE/${upper}/PWS_ACTIVITY_CODE/A/PWS_TYPE_CODE/CWS/rows/0:${limit - 1}`,
  );
}

/**
 * Look up PWSIDs serving a given ZIP code via GEOGRAPHIC_AREA,
 * then fetch the corresponding water systems.
 */
export async function fetchWaterSystemsByZip(
  zip: string,
  limit = 20,
): Promise<EpaWaterSystem[]> {
  const cleanZip = zip.replace(/\D/g, "").slice(0, 5);

  // Step 1 — Find PWSIDs associated with this ZIP
  const geoRows = await epaFetch<EpaGeographicArea>(
    `/GEOGRAPHIC_AREA/ZIP_CODE/${cleanZip}/rows/0:${limit - 1}`,
  );

  if (geoRows.length === 0) {
    return [];
  }

  // Step 2 — Fetch water system details for each PWSID
  const uniquePwsids = [...new Set(geoRows.map((g) => g.PWSID))].slice(0, limit);
  const systems = await Promise.allSettled(
    uniquePwsids.map((pwsid) =>
      epaFetch<EpaWaterSystem>(`/WATER_SYSTEM/PWSID/${pwsid}/rows/0:0`),
    ),
  );

  return systems
    .filter(
      (r): r is PromiseFulfilledResult<EpaWaterSystem[]> =>
        r.status === "fulfilled",
    )
    .flatMap((r) => r.value)
    .filter((s) => s.PWSID); // drop any empties
}

/**
 * Fetch a single water system by PWSID.
 */
export async function fetchWaterSystem(
  pwsid: string,
): Promise<EpaWaterSystem | null> {
  const rows = await epaFetch<EpaWaterSystem>(
    `/WATER_SYSTEM/PWSID/${pwsid}/rows/0:0`,
  );
  return rows[0] ?? null;
}

/**
 * Fetch violations for a water system.
 * Returns up to `limit` rows (default 100).
 */
export async function fetchViolations(
  pwsid: string,
  limit = 100,
): Promise<EpaViolation[]> {
  return epaFetch<EpaViolation>(
    `/VIOLATION/PWSID/${pwsid}/rows/0:${limit - 1}`,
  );
}
