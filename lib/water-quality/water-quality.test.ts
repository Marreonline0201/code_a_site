import test from "node:test";
import assert from "node:assert/strict";
import {
  getComputedSummaryForSample,
  getHealthSummaryForSample,
} from "./summary";
import { normalizeWaterSample } from "./normalize";
import { sortSamples } from "./service";

function buildRow(overrides: Record<string, string> = {}) {
  return {
    "Sample Number": "32317",
    "Sample Date": "2015-01-03T00:00:00.000",
    "Sample Time": "8:23",
    "Sample Site": "77050",
    "Sample class": "Compliance",
    Location: "Queens Village",
    "Residual Free Chlorine (mg/L)": "0.53",
    "Turbidity (NTU)": "0.62",
    "Fluoride (mg/L)": "",
    "Coliform (Quanti-Tray) (MPN /100mL)": "<1",
    "E.coli(Quanti-Tray) (MPN/100mL)": "<1",
    ...overrides,
  };
}

test("normalizes ISO-like sample dates and sampledAt correctly", () => {
  const sample = normalizeWaterSample(buildRow(), 2);

  assert.equal(sample.sampleDate, "2015-01-03");
  assert.equal(sample.sampleTime, "08:23:00");
  assert.equal(sample.sampledAt, "2015-01-03T08:23:00");
  assert.deepEqual(sample.issues, []);
});

test("preserves <1 coliform as raw text with numeric helper and no detection warning", () => {
  const sample = normalizeWaterSample(buildRow(), 2);

  assert.equal(sample.coliformQuantiTray.raw, "<1");
  assert.equal(sample.coliformQuantiTray.value, 1);
  assert.equal(sample.coliformQuantiTray.comparator, "lt");

  const summary = getHealthSummaryForSample(sample);
  assert.equal(summary.status, "normal");
  assert.deepEqual(getComputedSummaryForSample(sample), {
    bacteria: "not_detected",
    clarity: "normal",
    disinfection: "normal",
    overall: "normal",
  });
  assert.ok(
    !summary.reasons.some((reason) => reason.includes("Total coliform was detected")),
  );
});

test("parses <1 E. coli and does not mark it as detected", () => {
  const sample = normalizeWaterSample(buildRow(), 2);

  assert.equal(sample.eColiQuantiTray.raw, "<1");
  assert.equal(sample.eColiQuantiTray.value, 1);
  assert.equal(sample.eColiQuantiTray.comparator, "lt");

  const summary = getHealthSummaryForSample(sample);
  assert.equal(summary.status, "normal");
  assert.equal(getComputedSummaryForSample(sample).bacteria, "not_detected");
  assert.ok(
    !summary.reasons.some((reason) => reason.includes("E. coli was detected")),
  );
});

test("positive total coliform with no E. coli is a watch-level indicator, not an alert", () => {
  const sample = normalizeWaterSample(
    buildRow({
      "Coliform (Quanti-Tray) (MPN /100mL)": "1",
      "E.coli(Quanti-Tray) (MPN/100mL)": "<1",
    }),
    2,
  );

  const summary = getHealthSummaryForSample(sample);
  const computed = getComputedSummaryForSample(sample);

  assert.equal(summary.status, "watch");
  assert.equal(computed.bacteria, "coliform_detected");
  assert.equal(computed.overall, "review");
  assert.ok(
    summary.reasons.some((reason) => reason.includes("does not by itself mean the water is unsafe")),
  );
});

test("positive E. coli is an alert", () => {
  const sample = normalizeWaterSample(
    buildRow({
      "E.coli(Quanti-Tray) (MPN/100mL)": "1",
    }),
    2,
  );

  const summary = getHealthSummaryForSample(sample);
  const computed = getComputedSummaryForSample(sample);

  assert.equal(summary.status, "alert");
  assert.equal(computed.bacteria, "e_coli_detected");
  assert.equal(computed.overall, "alert");
  assert.ok(
    summary.reasons.includes("E. coli was detected in this sample."),
  );
});

test("chlorine below 0.2 mg/L is a watch-level operational review flag", () => {
  const sample = normalizeWaterSample(
    buildRow({
      "Residual Free Chlorine (mg/L)": "0.15",
    }),
    2,
  );

  const summary = getHealthSummaryForSample(sample);
  const computed = getComputedSummaryForSample(sample);

  assert.equal(summary.status, "watch");
  assert.equal(computed.disinfection, "low_review");
  assert.equal(computed.overall, "review");
  assert.ok(
    summary.reasons.includes(
      "Free chlorine was below a common operational residual benchmark.",
    ),
  );
});

test("chlorine above 4.0 mg/L is an alert", () => {
  const sample = normalizeWaterSample(
    buildRow({
      "Residual Free Chlorine (mg/L)": "4.2",
    }),
    2,
  );

  const summary = getHealthSummaryForSample(sample);
  const computed = getComputedSummaryForSample(sample);

  assert.equal(summary.status, "alert");
  assert.equal(computed.disinfection, "high_alert");
  assert.equal(computed.overall, "alert");
  assert.ok(
    summary.reasons.includes(
      "Free chlorine exceeded the EPA maximum residual disinfectant level.",
    ),
  );
});

test("turbidity stays a review heuristic and not a fake regulatory violation", () => {
  const sample = normalizeWaterSample(
    buildRow({
      "Turbidity (NTU)": "1.4",
    }),
    2,
  );

  const summary = getHealthSummaryForSample(sample);
  const computed = getComputedSummaryForSample(sample);

  assert.equal(summary.status, "watch");
  assert.equal(computed.clarity, "review");
  assert.equal(computed.overall, "review");
  assert.ok(
    summary.reasons.includes("Turbidity was higher than a typical review level."),
  );
  assert.ok(
    !summary.reasons.some((reason) => reason.toLowerCase().includes("unsafe")),
  );
});

test("keeps sampleNumber null and uses stable row fallback id when sample number is missing", () => {
  const sample = normalizeWaterSample(
    buildRow({
      "Sample Number": "",
    }),
    42,
  );

  assert.equal(sample.sampleNumber, null);
  assert.equal(sample.id, "row-42");
  assert.ok(sample.issues.includes("Missing sample number"));
});

test("sorts by parsed sampleDate descending", () => {
  const older = normalizeWaterSample(
    buildRow({
      "Sample Number": "100",
      "Sample Date": "2015-01-03T00:00:00.000",
    }),
    2,
  );
  const newer = normalizeWaterSample(
    buildRow({
      "Sample Number": "101",
      "Sample Date": "2019-10-31T00:00:00.000",
    }),
    3,
  );

  const sorted = sortSamples([older, newer], "sampleDate", "desc");
  assert.deepEqual(
    sorted.map((sample) => sample.sampleNumber),
    ["101", "100"],
  );
});
