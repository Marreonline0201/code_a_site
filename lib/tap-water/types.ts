export type TapWaterStatus = "normal" | "review" | "alert" | "unknown";

export type TapWaterSampleSummary = {
  bacteria: "not_detected" | "coliform_detected" | "e_coli_detected";
  clarity: "normal" | "review";
  disinfection: "normal" | "low_review" | "high_alert";
  overall: "normal" | "review" | "alert";
};

export type TapWaterHealthSummary = {
  status: "normal" | "watch" | "alert" | "unknown";
  reasons: string[];
};

export type TapWaterSample = {
  id: string;
  sampleNumber: string | null;
  sampleDate: string | null;
  sampleTime: string | null;
  sampledAt: string | null;
  sampleSite: string | null;
  sampleClass: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  distanceMiles?: number;
  summary: TapWaterSampleSummary;
  healthSummary: TapWaterHealthSummary;
};

export type TapWaterNearbySummary = {
  sampleCount: number;
  nearestDistanceMiles: number | null;
  overall: TapWaterStatus;
  bacteria: TapWaterSampleSummary["bacteria"] | "unknown";
  clarity: TapWaterSampleSummary["clarity"] | "unknown";
  disinfection: TapWaterSampleSummary["disinfection"] | "unknown";
};

export type TapWaterMeta = {
  zip?: string;
  origin?: {
    latitude: number;
    longitude: number;
  };
  count?: number;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  sortBy: string;
  sortDir: "asc" | "desc";
};

export type TapWaterSearchResponse = {
  data: TapWaterSample[];
  meta: TapWaterMeta;
  nearbySummary: TapWaterNearbySummary;
};

export type TapWaterSearchMode = "zip" | "location";
