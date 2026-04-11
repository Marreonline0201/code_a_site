/**
 * EPA Water Data API client.
 *
 * Primary: EPA Envirofacts REST API (data.epa.gov/efservice)
 * Fallback from ECHO API which started returning 403 in 2025.
 *
 * Envirofacts URL format: /efservice/{TABLE}/{COLUMN}/{VALUE}/.../rows/{start}:{end}/json
 * Note: /json must come AFTER /rows for JSON output.
 */

const ENVIRO_BASE = "https://data.epa.gov/efservice";
const FETCH_TIMEOUT_MS = 25_000;

export class EpaApiError extends Error {
  status: number | null;
  code: string | null;
  url: string | null;
  bodySnippet: string | null;

  constructor(
    message: string,
    options?: {
      status?: number | null;
      code?: string | null;
      url?: string | null;
      bodySnippet?: string | null;
      cause?: unknown;
    },
  ) {
    super(message, options?.cause ? { cause: options.cause } : undefined);
    this.name = "EpaApiError";
    this.status = options?.status ?? null;
    this.code = options?.code ?? null;
    this.url = options?.url ?? null;
    this.bodySnippet = options?.bodySnippet ?? null;
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
  Latitude: number | null;
  Longitude: number | null;
}

async function enviroFetch(url: string): Promise<Response> {
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

/* ── Field mappings for Envirofacts → EchoWaterSystem ── */

const PWS_TYPE_MAP: Record<string, string> = {
  CWS: "Community water system",
  TNCWS: "Transient non-community water system",
  NTNCWS: "Non-transient non-community water system",
};
const OWNER_MAP: Record<string, string> = {
  F: "Federal government", S: "State government", L: "Local government",
  M: "Public/private", N: "Native American", P: "Private",
};
const SOURCE_MAP: Record<string, string> = {
  GW: "Ground water", SW: "Surface water", GU: "Ground water under influence of surface water",
  SWP: "Purchased surface water", GWP: "Purchased ground water",
};

interface EnviroSystem {
  pwsid: string;
  pws_name: string;
  state_code: string;
  population_served_count: number | null;
  pws_type_code: string;
  owner_type_code: string | null;
  primary_source_code: string | null;
  city_name: string | null;
  zip_code: string | null;
  pws_activity_code: string;
}

interface EnviroViolation {
  pwsid: string;
  violation_category_code: string | null;
  is_health_based_ind: string | null;
  contaminant_code: string | null;
  compl_per_begin_date: string | null;
}

function enviroToEcho(
  sys: EnviroSystem,
  violations: EnviroViolation[],
  counties: string[],
  cities: string[],
): EchoWaterSystem {
  const healthVios = violations.filter((v) => v.is_health_based_ind === "Y");
  const recentVios = violations.filter((v) => {
    if (!v.compl_per_begin_date) return false;
    const d = new Date(v.compl_per_begin_date);
    return d.getTime() > Date.now() - 3 * 365 * 24 * 60 * 60 * 1000;
  });
  const categories = [...new Set(violations.map((v) => v.violation_category_code).filter(Boolean))];
  const contaminants = [...new Set(recentVios.map((v) => v.contaminant_code).filter(Boolean))];
  const hasLead = violations.some((v) => v.contaminant_code === "PB90" || v.contaminant_code === "PB05");
  const hasCopper = violations.some((v) => v.contaminant_code === "CU90" || v.contaminant_code === "CU05");

  return {
    PWSName: sys.pws_name ?? "",
    PWSId: sys.pwsid,
    CitiesServed: cities.length > 0 ? cities.join(", ") : sys.city_name,
    StateCode: sys.state_code,
    ZipCodesServed: sys.zip_code,
    CountiesServed: counties.length > 0 ? counties.join(", ") : null,
    PWSTypeDesc: PWS_TYPE_MAP[sys.pws_type_code] ?? sys.pws_type_code,
    PrimarySourceDesc: SOURCE_MAP[sys.primary_source_code ?? ""] ?? sys.primary_source_code ?? "Unknown",
    PopulationServedCount: sys.population_served_count != null ? String(sys.population_served_count) : null,
    PWSActivityDesc: sys.pws_activity_code === "A" ? "Active" : "Inactive",
    OwnerDesc: OWNER_MAP[sys.owner_type_code ?? ""] ?? sys.owner_type_code ?? "Unknown",
    SeriousViolator: healthVios.length > 3 ? "Yes" : "No",
    HealthFlag: healthVios.length > 0 ? "Yes" : "No",
    QtrsWithVio: String(Math.min(recentVios.length, 12)),
    QtrsWithSNC: "0",
    RulesVio3yr: String(recentVios.length),
    SDWAContaminantsInCurViol: contaminants.join(",") || null,
    SDWAContaminantsInViol3yr: contaminants.join(",") || null,
    CurrVioFlag: recentVios.length > 0 ? "1" : "0",
    PbViol: hasLead ? "1" : null,
    CuViol: hasCopper ? "1" : null,
    LeadAndCopperViol: hasLead || hasCopper ? "1" : null,
    DfrUrl: `https://echo.epa.gov/detailed-facility-report?fid=${sys.pwsid}`,
    ViolationCategories: categories.join(",") || null,
    SDWA3yrComplQtrsHistory: "",
    ServiceAreaTypeDesc: null,
    Latitude: null,
    Longitude: null,
  };
}

/* ── ArcGIS Water System Boundaries API ── */
const ARCGIS_BASE = "https://services.arcgis.com/cJ9YHowT8TU7DUyn/ArcGIS/rest/services/Water_System_Boundaries/FeatureServer/0/query";

interface ArcGISFeature {
  attributes: {
    PWSID: string;
    PWS_Name: string;
    Population_Served_Count: number | null;
    Primacy_Agency: string;
  };
  centroid?: { x: number; y: number };
}

/**
 * Search water systems by state + optional county.
 * Uses EPA ArcGIS Water_System_Boundaries for real coordinates,
 * enriched with violations from Envirofacts.
 */
export async function searchWaterSystems(params: {
  state?: string;
  county?: string;
  city?: string;
  zip?: string;
  limit?: number;
}): Promise<EchoWaterSystem[]> {
  const { state, county, city, limit = 25 } = params;
  if (!state) return [];

  const st = state.toUpperCase();

  // Build ArcGIS query — PWSID starts with state code
  let whereClause = `PWSID LIKE '${st}%'`;
  if (county) {
    // ArcGIS doesn't have county field, so filter via Envirofacts GEOGRAPHIC_AREA
    const geoUrl = `${ENVIRO_BASE}/GEOGRAPHIC_AREA/COUNTY_SERVED/${encodeURIComponent(county.toUpperCase())}/STATE_SERVED/${st}/rows/0:199/json`;
    try {
      const geoRes = await enviroFetch(geoUrl);
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (Array.isArray(geoData) && geoData.length > 0) {
          const ids = [...new Set(geoData.map((g: { pwsid: string }) => g.pwsid))].slice(0, 50);
          whereClause = `PWSID IN (${ids.map((id) => `'${id}'`).join(",")})`;
        }
      }
    } catch { /* fall back to state-level search */ }
  }

  // Query ArcGIS — sorted by population, with centroids for coordinates
  const arcParams = new URLSearchParams({
    where: whereClause,
    outFields: "PWSID,PWS_Name,Population_Served_Count,Primacy_Agency",
    returnGeometry: "false",
    returnCentroid: "true",
    outSR: "4326",
    f: "json",
    resultRecordCount: String(limit),
    orderByFields: "Population_Served_Count DESC",
  });

  const arcRes = await enviroFetch(`${ARCGIS_BASE}?${arcParams.toString()}`);
  if (!arcRes.ok) return [];
  const arcData = await arcRes.json();
  const features: ArcGISFeature[] = arcData?.features ?? [];
  if (features.length === 0) return [];

  // Map ArcGIS features to EnviroSystem-like objects for the existing pipeline
  const systems: EnviroSystem[] = features.map((f) => ({
    pwsid: f.attributes.PWSID,
    pws_name: f.attributes.PWS_Name,
    state_code: st,
    population_served_count: f.attributes.Population_Served_Count,
    pws_type_code: "CWS",
    owner_type_code: null,
    primary_source_code: null,
    city_name: null,
    zip_code: null,
    pws_activity_code: "A",
    // Store coordinates for the map
    _lat: f.centroid?.y ?? null,
    _lng: f.centroid?.x ?? null,
  })) as (EnviroSystem & { _lat: number | null; _lng: number | null })[];

  if (systems.length === 0) return [];

  // Step 3: Fetch recent violations for these systems (bulk by state, last 3 years)
  const threeYearsAgo = new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const vioUrl = `${ENVIRO_BASE}/VIOLATION/PRIMACY_AGENCY_CODE/${st}/COMPL_PER_BEGIN_DATE/>/${threeYearsAgo}/rows/0:999/json`;
  let allViolations: EnviroViolation[] = [];
  try {
    const vioRes = await enviroFetch(vioUrl);
    if (vioRes.ok) {
      const vioData = await vioRes.json();
      if (Array.isArray(vioData)) allViolations = vioData;
    }
  } catch { /* violations fetch is best-effort */ }

  // Index violations by PWSID
  const vioByPws = new Map<string, EnviroViolation[]>();
  for (const v of allViolations) {
    const arr = vioByPws.get(v.pwsid) ?? [];
    arr.push(v);
    vioByPws.set(v.pwsid, arr);
  }

  // Step 4: Map to EchoWaterSystem interface, with ArcGIS coordinates
  return systems.map((sys) => {
    const echo = enviroToEcho(sys, vioByPws.get(sys.pwsid) ?? [], [], []);
    const withCoords = sys as EnviroSystem & { _lat?: number | null; _lng?: number | null };
    echo.Latitude = withCoords._lat ?? null;
    echo.Longitude = withCoords._lng ?? null;
    return echo;
  });
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
 * Uses Envirofacts LCR_SAMPLE_RESULT table.
 */
export async function fetchLeadAndCopper(pwsid: string): Promise<LeadCopperResult | null> {
  try {
    const url = `${ENVIRO_BASE}/LCR_SAMPLE_RESULT/PWSID/${pwsid}/rows/0:49/json`;
    const res = await enviroFetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    const leadSamples = data
      .filter((s: Record<string, string>) => s.contaminant_code === "PB90")
      .map((s: Record<string, string>) => ({
        value: s.sample_measure ?? "",
        units: s.unit_of_measure ?? "mg/L",
        dates: s.sampling_end_date ?? "",
      }));
    const copperSamples = data
      .filter((s: Record<string, string>) => s.contaminant_code === "CU90")
      .map((s: Record<string, string>) => ({
        value: s.sample_measure ?? "",
        units: s.unit_of_measure ?? "mg/L",
        dates: s.sampling_end_date ?? "",
      }));

    return {
      leadSamples,
      copperSamples,
      leadActionLevel: leadSamples.length > 0 ? "0.015" : null,
      copperActionLevel: copperSamples.length > 0 ? "1.3" : null,
      leadViolation: leadSamples.some((s: { value: string }) => parseFloat(s.value) > 0.015) ? "1" : null,
      copperViolation: copperSamples.some((s: { value: string }) => parseFloat(s.value) > 1.3) ? "1" : null,
    };
  } catch {
    return null;
  }
}

/**
 * Fetch detailed violations for a water system.
 * Uses Envirofacts VIOLATION table.
 */
export async function fetchViolationDetails(pwsid: string): Promise<ViolationDetail[]> {
  try {
    const url = `${ENVIRO_BASE}/VIOLATION/PWSID/${pwsid}/rows/0:99/json`;
    const res = await enviroFetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map((v: Record<string, string | null>) => ({
      violationId: v.violation_id ?? "",
      beginDate: v.compl_per_begin_date ?? null,
      endDate: v.compl_per_end_date ?? null,
      federalRule: v.rule_code ?? "",
      contaminantName: v.contaminant_code ?? "",
      categoryDesc: v.violation_category_code ?? "",
      measure: v.viol_measure ?? null,
      federalMCL: v.state_mcl ?? null,
      status: v.compliance_status_code ?? "",
      enforcementActions: [],
    }));
  } catch {
    return [];
  }
}

/**
 * Get detailed info for a specific water system by PWSID.
 * Uses Envirofacts WATER_SYSTEM table.
 */
export async function getWaterSystemDetail(pwsid: string): Promise<EchoWaterSystem | null> {
  try {
    const sysUrl = `${ENVIRO_BASE}/WATER_SYSTEM/PWSID/${pwsid}/rows/0:0/json`;
    const sysRes = await enviroFetch(sysUrl);
    if (!sysRes.ok) return null;
    const sysData = await sysRes.json();
    if (!Array.isArray(sysData) || sysData.length === 0) return null;

    const sys = sysData[0] as EnviroSystem;

    // Fetch violations for this system
    const vioUrl = `${ENVIRO_BASE}/VIOLATION/PWSID/${pwsid}/rows/0:99/json`;
    let violations: EnviroViolation[] = [];
    try {
      const vioRes = await enviroFetch(vioUrl);
      if (vioRes.ok) {
        const vioData = await vioRes.json();
        if (Array.isArray(vioData)) violations = vioData;
      }
    } catch { /* best effort */ }

    return enviroToEcho(sys, violations, [], []);
  } catch {
    return null;
  }
}
