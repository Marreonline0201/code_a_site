/**
 * Transform raw EPA SDWIS rows into our clean frontend types.
 */

import type {
  EpaWaterSystem,
  EpaViolation,
  WaterSystem,
  Violation,
  WaterSourceType,
  SystemType,
  ViolationSeverity,
} from "./types";

const SOURCE_MAP: Record<string, WaterSourceType> = {
  GW: "groundwater",
  GU: "groundwater",
  GWP: "purchased",
  SW: "surface",
  SWP: "purchased",
  GP: "purchased",
  SP: "purchased",
};

const SYSTEM_TYPE_MAP: Record<string, SystemType> = {
  CWS: "community",
  NTNCWS: "non-transient",
  TNCWS: "transient",
};

/** Health-based violation type codes per EPA SDWIS */
const HEALTH_BASED_VIOLATION_TYPES = new Set([
  "01", // MCL
  "02", // TT
  "03", // Monitoring
  "04", // Reporting
  "05", // MCL-MAJOR
  "06", // TT-MAJOR
  "07", // MRDL
  "36", // MCL-STAGE1
  "37", // TT-STAGE1
  "41", // MCL-STAGE2
  "42", // TT-STAGE2
  "51", // RTCR
]);

/** Known contaminant names from EPA contaminant codes */
const CONTAMINANT_NAMES: Record<string, string> = {
  "1005": "Barium",
  "1010": "Cadmium",
  "1015": "Chromium",
  "1020": "Fluoride",
  "1024": "Mercury",
  "1025": "Nickel",
  "1030": "Nitrate",
  "1035": "Selenium",
  "1036": "Nitrite",
  "1038": "Uranium",
  "1040": "Lead",
  "1041": "Copper",
  "1074": "Antimony",
  "1075": "Beryllium",
  "1085": "Thallium",
  "2039": "Atrazine",
  "2050": "Lindane",
  "2456": "TTHM",
  "2950": "HAA5",
  "2990": "Chlorine",
  "3000": "Coliform (TCR)",
  "3014": "E. Coli",
  "3100": "Turbidity",
};

function classifyViolationSeverity(v: EpaViolation): ViolationSeverity {
  if (v.IS_HEALTH_BASED_IND === "Y") return "serious";

  const typeCode = (v.VIOLATION_TYPE_CODE ?? "").trim();
  // MCL (01), TT (02), MRDL (07) are serious
  if (["01", "02", "05", "06", "07"].includes(typeCode)) return "serious";
  // Monitoring & Reporting (03, 04) are minor
  if (["03", "04"].includes(typeCode)) return "minor";
  // Some known non-health violation types
  if (["09", "21", "22", "23", "24", "25"].includes(typeCode)) return "informational";

  return "unknown";
}

export function normalizeWaterSystem(
  raw: EpaWaterSystem,
  violations: EpaViolation[] = [],
): WaterSystem {
  const healthBased = violations.filter(
    (v) =>
      v.IS_HEALTH_BASED_IND === "Y" ||
      HEALTH_BASED_VIOLATION_TYPES.has((v.VIOLATION_TYPE_CODE ?? "").trim()),
  );

  return {
    pwsid: raw.PWSID,
    name: raw.PWS_NAME?.trim() ?? "Unknown System",
    systemType: SYSTEM_TYPE_MAP[raw.PWS_TYPE_CODE] ?? "unknown",
    sourceType: SOURCE_MAP[raw.PRIMARY_SOURCE_CODE] ?? "unknown",
    populationServed: raw.POPULATION_SERVED_COUNT ?? null,
    stateCode: raw.STATE_CODE,
    city: raw.CITY_NAME?.trim() ?? null,
    zipCode: raw.ZIP_CODE?.trim() ?? null,
    county: raw.COUNTY_SERVED?.trim() ?? null,
    isActive: raw.PWS_ACTIVITY_CODE === "A",
    violationCount: violations.length,
    healthBasedViolationCount: healthBased.length,
  };
}

export function normalizeViolation(raw: EpaViolation): Violation {
  const contaminantCode = (raw.CONTAMINANT_CODE ?? "").trim();

  return {
    id: raw.VIOLATION_ID ?? `${raw.PWSID}-${contaminantCode}-${raw.COMPLIANCE_PERIOD_BEGIN_DATE}`,
    pwsid: raw.PWSID,
    contaminantCode,
    contaminantName:
      raw.CONTAMINANT_NAME?.trim() ??
      CONTAMINANT_NAMES[contaminantCode] ??
      `Contaminant ${contaminantCode}`,
    violationType: describeViolationType(raw.VIOLATION_TYPE_CODE),
    compliancePeriodBegin: raw.COMPLIANCE_PERIOD_BEGIN_DATE ?? null,
    compliancePeriodEnd: raw.COMPLIANCE_PERIOD_END_DATE ?? null,
    isHealthBased: raw.IS_HEALTH_BASED_IND === "Y",
    severity: classifyViolationSeverity(raw),
    categoryCode: raw.VIOLATION_CATEGORY_CODE ?? null,
    ruleName: raw.RULE_NAME?.trim() ?? null,
  };
}

function describeViolationType(code: string | undefined | null): string {
  const c = (code ?? "").trim();
  const map: Record<string, string> = {
    "01": "Maximum Contaminant Level (MCL)",
    "02": "Treatment Technique (TT)",
    "03": "Monitoring Violation",
    "04": "Reporting Violation",
    "05": "MCL (Major)",
    "06": "TT (Major)",
    "07": "Maximum Residual Disinfectant Level",
    "09": "Variance/Exemption",
    "21": "Public Notification",
    "22": "Public Notification",
    "23": "Public Notification",
    "24": "Consumer Confidence Report",
    "25": "Consumer Confidence Report",
    "33": "Lead & Copper Rule",
    "34": "Lead & Copper Rule",
    "36": "MCL (Stage 1)",
    "37": "TT (Stage 1)",
    "41": "MCL (Stage 2)",
    "42": "TT (Stage 2)",
    "51": "Revised Total Coliform Rule",
  };
  return map[c] ?? `Violation Type ${c || "Unknown"}`;
}

/**
 * Filter violations to "recent" — within the last 5 years.
 */
export function filterRecentViolations(violations: Violation[]): Violation[] {
  const fiveYearsAgo = new Date();
  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
  const cutoff = fiveYearsAgo.toISOString().slice(0, 10);

  return violations.filter((v) => {
    if (!v.compliancePeriodBegin) return false;
    return v.compliancePeriodBegin >= cutoff;
  });
}
