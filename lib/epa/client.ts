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
const ERROR_SNIPPET_LENGTH = 320;

export class EpaApiError extends Error {
  status?: number;
  url: string;
  bodySnippet?: string;
  code?: "TIMEOUT" | "NETWORK" | "BAD_JSON";

  constructor(
    message: string,
    options: {
      url: string;
      status?: number;
      bodySnippet?: string;
      code?: "TIMEOUT" | "NETWORK" | "BAD_JSON";
    },
  ) {
    super(message);
    this.name = "EpaApiError";
    this.url = options.url;
    this.status = options.status;
    this.bodySnippet = options.bodySnippet;
    this.code = options.code;
  }
}

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

    if (!res.ok) {
      const bodySnippet = (await res.text().catch(() => "")).slice(0, ERROR_SNIPPET_LENGTH);
      throw new EpaApiError(`EPA request failed with status ${res.status}`, {
        url,
        status: res.status,
        bodySnippet,
      });
    }

    return res;
  } catch (error) {
    if (error instanceof EpaApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new EpaApiError("EPA request timed out", { url, code: "TIMEOUT" });
    }

    throw new EpaApiError("EPA request failed due to a network error", {
      url,
      code: "NETWORK",
    });
  } finally {
    clearTimeout(timer);
  }
}

async function readJson<T>(res: Response, requestUrl: string): Promise<T> {
  const raw = await res.text();

  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new EpaApiError("EPA response was not valid JSON", {
      url: requestUrl,
      status: res.status,
      code: "BAD_JSON",
      bodySnippet: raw.slice(0, ERROR_SNIPPET_LENGTH),
    });
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
    // ECHO does not support direct ZIP search well, so we search by state
    // and let the user browse. We add optional fields to narrow results.
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

  // Only active community water systems.
  queryParams.set("p_pws_activity_status", "A");
  queryParams.set("p_pws_type", "CWS");

  // Step 1: submit search and get QueryID.
  const searchUrl = `${BASE}.get_systems?${queryParams.toString()}`;
  const searchRes = await echoFetch(searchUrl);
  const searchData = await readJson<{ Results?: { QueryID?: string; QueryRows?: string } }>(
    searchRes,
    searchUrl,
  );

  const queryId = searchData.Results?.QueryID;
  const totalRows = parseInt(searchData.Results?.QueryRows ?? "0", 10);
  if (!queryId || totalRows === 0) {
    return [];
  }

  // Step 2: fetch actual rows from QueryID.
  const resultUrl = `${BASE}.get_qid?output=JSON&qid=${queryId}&responseset=${limit}`;
  const resultRes = await echoFetch(resultUrl);
  const resultData = await readJson<{ Results?: { WaterSystems?: EchoWaterSystem[] } }>(
    resultRes,
    resultUrl,
  );

  return resultData.Results?.WaterSystems ?? [];
}

/** Lead/copper test result */
export interface LeadCopperResult {
  leadSamples: { value: string; units: string; dates: string }[];
  copperSamples: { value: string; units: string; dates: string }[];
  leadActionLevel: string | null;
  copperActionLevel: string | null;
  leadViolation: string | null;
  copperViolation: string | null;
}

/** Violation detail */
export interface ViolationDetail {
  violationId: string;
  beginDate: string | null;
  endDate: string | null;
  federalRule: string;
  contaminantName: string;
  categoryDesc: string;
  measure: string | null;
  federalMCL: string | null;
  status: string;
  enforcementActions: { date: string; type: string; desc: string; agency: string }[];
}

/**
 * Fetch lead and copper test results for a water system.
 */
export async function fetchLeadAndCopper(pwsid: string): Promise<LeadCopperResult | null> {
  try {
    const requestUrl =
      `https://echodata.epa.gov/echo/dfr_rest_services.get_sdwa_lead_and_copper?output=JSON&p_id=${pwsid}`;
    const res = await echoFetch(requestUrl);
    const data = await readJson<{ Results?: { LeadAndCopperRule5Yr?: { Sources?: Array<Record<string, unknown>> } } }>(
      res,
      requestUrl,
    );
    const source = data?.Results?.LeadAndCopperRule5Yr?.Sources?.[0] as
      | {
          LeadSamples?: Array<Record<string, string>>;
          CopperSamples?: Array<Record<string, string>>;
          PbALE?: string | null;
          CuALE?: string | null;
          PbViol?: string | null;
          CuViol?: string | null;
        }
      | undefined;
    if (!source) return null;

    return {
      leadSamples: (source.LeadSamples ?? []).map((s: Record<string, string>) => ({
        value: s.PB90Value ?? s.PB90 ?? "",
        units: s.PB90Units ?? "mg/L",
        dates: s.PB90Dates ?? "",
      })),
      copperSamples: (source.CopperSamples ?? []).map((s: Record<string, string>) => ({
        value: s.CU90Value ?? s.CU90 ?? "",
        units: s.CU90Units ?? "mg/L",
        dates: s.CU90Dates ?? "",
      })),
      leadActionLevel: source.PbALE ?? null,
      copperActionLevel: source.CuALE ?? null,
      leadViolation: source.PbViol ?? null,
      copperViolation: source.CuViol ?? null,
    };
  } catch {
    return null;
  }
}

/**
 * Fetch detailed violations for a water system.
 */
export async function fetchViolationDetails(pwsid: string): Promise<ViolationDetail[]> {
  try {
    const requestUrl =
      `https://echodata.epa.gov/echo/dfr_rest_services.get_sdwa_violations?output=JSON&p_id=${pwsid}`;
    const res = await echoFetch(requestUrl);
    const data = await readJson<{
      Results?: {
        ViolationsEnforcementActions?: { Sources?: Array<{ Violations?: Array<Record<string, unknown>> }> };
      };
    }>(res, requestUrl);
    const source = data?.Results?.ViolationsEnforcementActions?.Sources?.[0];
    if (!source?.Violations) return [];

    return source.Violations.map((v: Record<string, unknown>) => ({
      violationId: (v.ViolationID as string) ?? "",
      beginDate: (v.CompliancePeriodBeginDate as string) ?? null,
      endDate: (v.CompliancePeriodEndDate as string) ?? null,
      federalRule: (v.FederalRule as string) ?? "",
      contaminantName: (v.ContaminantName as string) ?? "",
      categoryDesc: (v.ViolationCategoryDesc as string) ?? "",
      measure: (v.ViolationMeasure as string) ?? null,
      federalMCL: (v.FederalMCL as string) ?? null,
      status: (v.Status as string) ?? "",
      enforcementActions: ((v.EnforcementActions as Record<string, string>[]) ?? []).map(
        (ea) => ({
          date: ea.EnforcementDate ?? "",
          type: ea.EnforcementType ?? "",
          desc: ea.EnforcementActionTypeDesc ?? "",
          agency: ea.Agency ?? "",
        }),
      ),
    }));
  } catch {
    return [];
  }
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
  const searchData = await readJson<{ Results?: { QueryID?: string } }>(searchRes, searchUrl);

  const queryId = searchData?.Results?.QueryID;
  if (!queryId) return null;

  const resultUrl = `${BASE}.get_qid?output=JSON&qid=${queryId}&responseset=1`;
  const resultRes = await echoFetch(resultUrl);
  const resultData = await readJson<{ Results?: { WaterSystems?: EchoWaterSystem[] } }>(
    resultRes,
    resultUrl,
  );

  const systems: EchoWaterSystem[] = resultData?.Results?.WaterSystems ?? [];
  return systems[0] ?? null;
}
