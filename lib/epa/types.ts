/** EPA SDWIS API response types */

export interface EpaWaterSystem {
  PWSID: string;
  PWS_NAME: string;
  PWS_TYPE_CODE: string;
  PRIMARY_SOURCE_CODE: string;
  POPULATION_SERVED_COUNT: number | null;
  STATE_CODE: string;
  CITY_NAME: string | null;
  ZIP_CODE: string | null;
  COUNTY_SERVED: string | null;
  PWS_ACTIVITY_CODE: string;
  CDS_ID: string | null;
}

export interface EpaViolation {
  PWSID: string;
  VIOLATION_ID: string;
  CONTAMINANT_CODE: string;
  VIOLATION_TYPE_CODE: string;
  COMPLIANCE_PERIOD_BEGIN_DATE: string | null;
  COMPLIANCE_PERIOD_END_DATE: string | null;
  IS_HEALTH_BASED_IND: string | null;
  CONTAMINANT_NAME?: string | null;
  VIOLATION_CATEGORY_CODE?: string | null;
  RULE_NAME?: string | null;
  ENFORCEMENT_ACTION?: string | null;
}

export interface EpaGeographicArea {
  PWSID: string;
  GEO_ID: string;
  PWS_NAME?: string;
  ZIP_CODE?: string;
  STATE_CODE?: string;
  CITY_SERVED?: string;
  COUNTY_SERVED?: string;
  AREA_TYPE_CODE?: string;
}

/** Normalized types for our frontend */

export type WaterSourceType = "groundwater" | "surface" | "purchased" | "unknown";
export type SystemType = "community" | "non-transient" | "transient" | "unknown";
export type ViolationSeverity = "serious" | "minor" | "informational" | "unknown";

export interface WaterSystem {
  pwsid: string;
  name: string;
  systemType: SystemType;
  sourceType: WaterSourceType;
  populationServed: number | null;
  stateCode: string;
  city: string | null;
  zipCode: string | null;
  county: string | null;
  isActive: boolean;
  violationCount: number;
  healthBasedViolationCount: number;
}

export interface Violation {
  id: string;
  pwsid: string;
  contaminantCode: string;
  contaminantName: string;
  violationType: string;
  compliancePeriodBegin: string | null;
  compliancePeriodEnd: string | null;
  isHealthBased: boolean;
  severity: ViolationSeverity;
  categoryCode: string | null;
  ruleName: string | null;
}

export interface WaterSystemDetail {
  system: WaterSystem;
  violations: Violation[];
  recentViolations: Violation[];
}

export interface WaterQualitySearchResult {
  systems: WaterSystem[];
  query: { zip?: string; state?: string };
  totalSystems: number;
  timestamp: string;
}

export interface WaterSystemDetailResult {
  system: WaterSystem;
  violations: Violation[];
  recentViolations: Violation[];
  timestamp: string;
}
