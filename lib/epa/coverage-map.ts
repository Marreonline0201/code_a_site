export type CoordinateSource = "geocoded" | "approximate";

export type CoverageCoordinate = {
  latitude: number;
  longitude: number;
  source: CoordinateSource;
  label: string | null;
};

export interface WaterQualityMapSystem {
  pwsid: string;
  name: string;
  status: "good" | "watch" | "alert";
  populationServed: number | null;
  source: string;
  state: string;
  citiesServed: string | null;
  countiesServed: string | null;
  hasHealthViolation: boolean;
  leadViolation: boolean;
  copperViolation: boolean;
  rulesViolated3yr: number;
  contaminantsInCurrentViolation: string[];
  detailUrl: string;
  latitude: number;
  longitude: number;
  coordinateSource: CoordinateSource;
  coordinateLabel: string | null;
}

export const STATE_CENTERS: Record<string, [number, number]> = {
  AL: [32.8, -86.8],
  AK: [64.0, -153.0],
  AZ: [34.3, -111.7],
  AR: [34.8, -92.2],
  CA: [37.2, -119.5],
  CO: [39.0, -105.5],
  CT: [41.6, -72.7],
  DE: [39.0, -75.5],
  FL: [28.6, -82.4],
  GA: [32.7, -83.5],
  HI: [20.5, -157.4],
  ID: [44.4, -114.6],
  IL: [40.0, -89.2],
  IN: [39.8, -86.3],
  IA: [42.0, -93.5],
  KS: [38.5, -98.3],
  KY: [37.8, -85.7],
  LA: [30.9, -91.6],
  ME: [45.3, -69.2],
  MD: [39.0, -76.7],
  MA: [42.2, -71.5],
  MI: [44.3, -84.5],
  MN: [46.3, -94.2],
  MS: [32.7, -89.7],
  MO: [38.4, -92.5],
  MT: [47.0, -109.6],
  NE: [41.5, -99.8],
  NV: [39.8, -117.0],
  NH: [43.7, -71.6],
  NJ: [40.1, -74.7],
  NM: [34.5, -106.0],
  NY: [42.9, -75.5],
  NC: [35.5, -79.8],
  ND: [47.4, -100.5],
  OH: [40.3, -82.8],
  OK: [35.6, -97.5],
  OR: [44.0, -120.5],
  PA: [40.9, -77.8],
  RI: [41.7, -71.5],
  SC: [33.9, -80.9],
  SD: [44.4, -100.2],
  TN: [35.9, -86.4],
  TX: [31.5, -99.3],
  UT: [39.3, -111.7],
  VT: [44.1, -72.6],
  VA: [37.5, -78.9],
  WA: [47.4, -120.7],
  WV: [38.6, -80.6],
  WI: [44.6, -89.8],
  WY: [43.0, -107.5],
  DC: [38.9, -77.0],
};

export const STATE_NAMES: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
  DC: "District of Columbia",
};

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return hash;
}

export function getStateCenter(stateCode: string): [number, number] {
  return STATE_CENTERS[stateCode] ?? [39.8, -98.6];
}

export function getApproximateCoveragePoint(
  pwsid: string,
  stateCode: string,
  index: number,
  total: number,
): [number, number] {
  const center = getStateCenter(stateCode);
  const normalizedTotal = Math.max(1, total);
  const hash = hashString(pwsid);
  const angle = (index / normalizedTotal) * Math.PI * 2 + (hash % 100) / 100;
  const radius = 0.3 + ((hash % 1000) / 1000) * 1.5;

  return [
    center[0] + Math.cos(angle) * radius,
    center[1] + Math.sin(angle) * radius * 1.3,
  ];
}

export function getMarkerRadius(populationServed: number | null): number {
  if (!populationServed) return 6;
  if (populationServed > 1_000_000) return 18;
  if (populationServed > 500_000) return 14;
  if (populationServed > 100_000) return 11;
  if (populationServed > 10_000) return 8;
  return 6;
}

export function normalizeCoordinateLabel(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}
