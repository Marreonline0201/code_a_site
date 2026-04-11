/**
 * EPA ECHO SDWA REST API client.
 *
 * Uses the ECHO (Enforcement & Compliance History Online) API which has
 * much richer data than the basic Envirofacts API.
 *
 * Base: https://echodata.epa.gov/echo/sdw_rest_services
 * Docs: https://echo.epa.gov/tools/web-services
 *
 * Two-step query: get_systems returns a QueryID, get_qid fetches results.
 * Free, no API key required.
 */

const BASE = "https://echodata.epa.gov/echo/sdw_rest_services";
const FETCH_TIMEOUT_MS = 20_000;

export interface EchoWaterSystem {
  PWSName: string;
  PWSId: string;
  CitiesServed: string | null;
  StateCode: string;
  ZipCodesServed: string | null;
  CountiesServed: string | null;
  PWSTypeDesc: string;
  PrimarySourceDesc: string;
  PopulationServedCount: string | null;
  PWSActivityDesc: string;
  OwnerDesc: string;
  SeriousViolator: string;
  HealthFlag: string;
  QtrsWithVio: string;
  QtrsWithSNC: string;
  RulesVio3yr: string;
  SDWAContaminantsInCurViol: string | null;
  SDWAContaminantsInViol3yr: string | null;
  CurrVioFlag: string;
  PbViol: string | null;
  CuViol: string | null;
  LeadAndCopperViol: string | null;
  DfrUrl: string;
  ViolationCategories: string | null;
  SDWA3yrComplQtrsHistory: string;
  ServiceAreaTypeDesc: string | null;
}

async function echoFetch(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Search water systems by state + county, state alone, or ZIP-adjacent city.
 */
export async function searchWaterSystems(params: {
  state?: string;
  county?: string;
  city?: string;
  zip?: string;
  limit?: number;
}): Promise<EchoWaterSystem[]> {
  const { state, county, city, zip, limit = 20 } = params;

  const queryParams = new URLSearchParams({
    output: "JSON",
    responseset: String(limit),
  });

  if (zip) {
    // ZIP search: look up by state + city derived from ZIP, or by county
    // ECHO doesn't support direct ZIP search well, so we search by state
    // and let the user browse. We'll add the ZIP to help narrow results.
    if (state) {
      queryParams.set("p_st", state.toUpperCase());
    }
    if (county) {
      queryParams.set("p_co", county.toUpperCase());
    }
    if (city) {
      queryParams.set("p_ct", city.toUpperCase());
    }
  } else if (state) {
    queryParams.set("p_st", state.toUpperCase());
    if (county) queryParams.set("p_co", county.toUpperCase());
    if (city) queryParams.set("p_ct", city.toUpperCase());
  }

  // Only active community water systems
  queryParams.set("p_pws_activity_status", "A");
  queryParams.set("p_pws_type", "CWS");

  // Step 1: Submit search → get QueryID
  const searchUrl = `${BASE}.get_systems?${queryParams.toString()}`;
  const searchRes = await echoFetch(searchUrl);
  const searchData = await searchRes.json();

  const queryId = searchData?.Results?.QueryID;
  const totalRows = parseInt(searchData?.Results?.QueryRows ?? "0", 10);

  if (!queryId || totalRows === 0) {
    return [];
  }

  // Step 2: Fetch actual results using QueryID
  const resultUrl = `${BASE}.get_qid?output=JSON&qid=${queryId}&responseset=${limit}`;
  const resultRes = await echoFetch(resultUrl);
  const resultData = await resultRes.json();

  const systems: EchoWaterSystem[] = resultData?.Results?.WaterSystems ?? [];
  return systems;
}

/**
 * Get detailed info for a specific water system by PWSID.
 */
export async function getWaterSystemDetail(pwsid: string): Promise<EchoWaterSystem | null> {
  const queryParams = new URLSearchParams({
    output: "JSON",
    p_pwsid: pwsid,
    responseset: "1",
  });

  const searchUrl = `${BASE}.get_systems?${queryParams.toString()}`;
  const searchRes = await echoFetch(searchUrl);
  const searchData = await searchRes.json();

  const queryId = searchData?.Results?.QueryID;
  if (!queryId) return null;

  const resultUrl = `${BASE}.get_qid?output=JSON&qid=${queryId}&responseset=1`;
  const resultRes = await echoFetch(resultUrl);
  const resultData = await resultRes.json();

  const systems: EchoWaterSystem[] = resultData?.Results?.WaterSystems ?? [];
  return systems[0] ?? null;
}
