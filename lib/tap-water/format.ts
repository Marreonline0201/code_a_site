import type {
  TapWaterNearbySummary,
  TapWaterSample,
  TapWaterSearchMode,
  TapWaterStatus,
} from "./types";

function formatTitleCase(value: string) {
  return value
    .split("_")
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
}

export function getStatusBadgeVariant(status: TapWaterStatus) {
  switch (status) {
    case "alert":
      return "destructive" as const;
    case "review":
      return "secondary" as const;
    default:
      return "outline" as const;
  }
}

export function formatStatusLabel(status: TapWaterStatus | string) {
  if (status === "review") {
    return "Review";
  }

  if (status === "normal") {
    return "Normal";
  }

  if (status === "alert") {
    return "Alert";
  }

  if (status === "unknown") {
    return "Unknown";
  }

  return formatTitleCase(status);
}

export function formatDistanceMiles(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) {
    return "Distance unavailable";
  }

  return `${value.toFixed(1)} mi`;
}

export function formatSampleDate(sample: TapWaterSample) {
  const source = sample.sampledAt ?? sample.sampleDate;

  if (!source) {
    return "Date unavailable";
  }

  const date = new Date(source);

  if (Number.isNaN(date.getTime())) {
    return sample.sampleDate ?? "Date unavailable";
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function maxBySeverity<T extends string>(
  values: T[],
  severityMap: Record<T, number>,
  fallback: T,
) {
  if (values.length === 0) {
    return fallback;
  }

  let current = values[0] ?? fallback;

  for (const value of values) {
    if (severityMap[value] > severityMap[current]) {
      current = value;
    }
  }

  return current;
}

export function buildFallbackNearbySummary(samples: TapWaterSample[]): TapWaterNearbySummary {
  if (samples.length === 0) {
    return {
      sampleCount: 0,
      nearestDistanceMiles: null,
      overall: "unknown",
      bacteria: "unknown",
      clarity: "unknown",
      disinfection: "unknown",
    };
  }

  const overall = maxBySeverity(
    samples.map((sample) => sample.summary.overall),
    { normal: 1, review: 2, alert: 3 },
    "normal",
  );

  const bacteria = maxBySeverity(
    samples.map((sample) => sample.summary.bacteria),
    { not_detected: 1, coliform_detected: 2, e_coli_detected: 3 },
    "not_detected",
  );

  const clarity = maxBySeverity(
    samples.map((sample) => sample.summary.clarity),
    { normal: 1, review: 2 },
    "normal",
  );

  const disinfection = maxBySeverity(
    samples.map((sample) => sample.summary.disinfection),
    { normal: 1, low_review: 2, high_alert: 3 },
    "normal",
  );

  const nearestDistance = samples
    .map((sample) => sample.distanceMiles)
    .filter((value): value is number => value != null)
    .sort((left, right) => left - right)[0] ?? null;

  return {
    sampleCount: samples.length,
    nearestDistanceMiles: nearestDistance,
    overall,
    bacteria,
    clarity,
    disinfection,
  };
}

export function getSearchModeFromInput(value: string): TapWaterSearchMode {
  return /^\d{5}$/.test(value.trim()) ? "zip" : "location";
}
