import { NUMERIC_FIELDS } from "./constants";
import type {
  HealthStatus,
  HealthSummary,
  NumericFieldKey,
  NumericFieldStats,
  NumericMeasurement,
  SampleComputedSummary,
  SummaryResult,
  WaterSample,
} from "./types";

function getNumericValue(sample: WaterSample, field: NumericFieldKey) {
  return sample[field].value;
}

function indicatesDetection(measurement: NumericMeasurement) {
  if (measurement.value == null) {
    return false;
  }

  // Treat "<1" style results as below detection for the hackathon UI.
  if (measurement.comparator === "lt" || measurement.comparator === "lte") {
    return false;
  }

  return measurement.value > 0;
}

function getBacteriaSummary(sample: WaterSample): SampleComputedSummary["bacteria"] {
  if (indicatesDetection(sample.eColiQuantiTray)) {
    return "e_coli_detected";
  }

  if (indicatesDetection(sample.coliformQuantiTray)) {
    return "coliform_detected";
  }

  return "not_detected";
}

function getClaritySummary(sample: WaterSample): SampleComputedSummary["clarity"] {
  const turbidity = sample.turbidity.value;

  // This is intentionally a light, non-regulatory review heuristic.
  // Treatment-rule turbidity thresholds should not be reused here as a hard
  // consumer safety cutoff for individual street-level samples.
  if (turbidity != null && turbidity > 1) {
    return "review";
  }

  return "normal";
}

function getDisinfectionSummary(
  sample: WaterSample,
): SampleComputedSummary["disinfection"] {
  const chlorine = sample.residualFreeChlorine.value;

  // EPA MRDL for free chlorine is 4.0 mg/L.
  if (chlorine != null && chlorine > 4.0) {
    return "high_alert";
  }

  // 0.2 mg/L is used here as a conservative operational residual benchmark,
  // not as a direct health-violation threshold.
  if (chlorine != null && chlorine < 0.2) {
    return "low_review";
  }

  return "normal";
}

export function getComputedSummaryForSample(
  sample: WaterSample,
): SampleComputedSummary {
  const bacteria = getBacteriaSummary(sample);
  const clarity = getClaritySummary(sample);
  const disinfection = getDisinfectionSummary(sample);

  let overall: SampleComputedSummary["overall"] = "normal";

  if (bacteria === "e_coli_detected" || disinfection === "high_alert") {
    overall = "alert";
  } else if (
    bacteria === "coliform_detected" ||
    clarity === "review" ||
    disinfection === "low_review"
  ) {
    overall = "review";
  }

  return {
    bacteria,
    clarity,
    disinfection,
    overall,
  };
}

export function getHealthSummaryForSample(sample: WaterSample): HealthSummary {
  const reasons: string[] = [];
  const summary = getComputedSummaryForSample(sample);

  if (summary.bacteria === "e_coli_detected") {
    reasons.push("E. coli was detected in this sample.");
  } else if (summary.bacteria === "coliform_detected") {
    reasons.push(
      "Total coliform was detected. This can indicate a water-quality or system issue and may warrant review, but it does not by itself mean the water is unsafe.",
    );
  } else {
    reasons.push("No coliform or E. coli were detected in this sample.");
  }

  if (summary.disinfection === "low_review") {
    reasons.push(
      "Free chlorine was below a common operational residual benchmark.",
    );
  } else if (summary.disinfection === "high_alert") {
    reasons.push(
      "Free chlorine exceeded the EPA maximum residual disinfectant level.",
    );
  }

  if (summary.clarity === "review") {
    reasons.push("Turbidity was higher than a typical review level.");
  }

  if (summary.overall === "review") {
    return {
      status: "watch",
      reasons,
    };
  }

  if (summary.overall === "alert") {
    return {
      status: "alert",
      reasons,
    };
  }

  const hasAnyNumericData = NUMERIC_FIELDS.some(
    (field) => getNumericValue(sample, field) != null,
  );

  if (!hasAnyNumericData) {
    return {
      status: "unknown",
      reasons: ["This sample did not include parseable numeric water quality values."],
    };
  }

  return {
    status: "normal",
    reasons,
  };
}

function summarizeNumericField(samples: WaterSample[], field: NumericFieldKey): NumericFieldStats {
  const values = samples
    .map((sample) => sample[field].value)
    .filter((value): value is number => value != null);

  if (values.length === 0) {
    return {
      field,
      count: 0,
      min: null,
      max: null,
      average: null,
    };
  }

  const total = values.reduce((sum, value) => sum + value, 0);

  return {
    field,
    count: values.length,
    min: Math.min(...values),
    max: Math.max(...values),
    average: total / values.length,
  };
}

export function summarizeSamples(
  allSamples: WaterSample[],
  filteredSamples: WaterSample[],
): SummaryResult {
  const sampleClasses = filteredSamples.reduce<Record<string, number>>((accumulator, sample) => {
    const key = sample.sampleClass ?? "Unknown";
    accumulator[key] = (accumulator[key] ?? 0) + 1;
    return accumulator;
  }, {});

  const statuses = filteredSamples.map(getHealthSummaryForSample);
  const counts: Record<HealthStatus, number> = {
    alert: 0,
    watch: 0,
    normal: 0,
    unknown: 0,
  };

  statuses.forEach((status) => {
    counts[status.status] += 1;
  });

  const orderedStatuses: HealthStatus[] = ["alert", "watch", "normal", "unknown"];
  const overallStatus =
    orderedStatuses.find((status) => counts[status] > 0) ?? "unknown";

  const datedSamples = filteredSamples
    .map((sample) => sample.sampleDate)
    .filter((value): value is string => Boolean(value))
    .sort((left, right) => left.localeCompare(right));

  return {
    totalCount: allSamples.length,
    filteredCount: filteredSamples.length,
    dateRange: {
      from: datedSamples[0] ?? null,
      to: datedSamples[datedSamples.length - 1] ?? null,
    },
    sampleClasses,
    numeric: NUMERIC_FIELDS.map((field) => summarizeNumericField(filteredSamples, field)),
    health: {
      overallStatus,
      counts,
    },
  };
}
