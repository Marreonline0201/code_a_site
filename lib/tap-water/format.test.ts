import assert from "node:assert/strict";
import test from "node:test";
import {
  buildFallbackNearbySummary,
  formatDistanceMiles,
  formatStatusLabel,
  getSearchModeFromInput,
} from "./format";
import type { TapWaterSample } from "./types";

function buildSample(
  id: string,
  summary: TapWaterSample["summary"],
  distanceMiles?: number,
): TapWaterSample {
  return {
    id,
    sampleNumber: id,
    sampleDate: "2024-01-01",
    sampleTime: "08:00:00",
    sampledAt: "2024-01-01T08:00:00",
    sampleSite: "S1",
    sampleClass: "Compliance",
    location: "Queens",
    latitude: 40.7,
    longitude: -73.8,
    distanceMiles,
    summary,
    healthSummary: {
      status: "normal",
      reasons: ["No coliform or E. coli were detected in this sample."],
    },
  };
}

test("detects zip and location search modes", () => {
  assert.equal(getSearchModeFromInput("11356"), "zip");
  assert.equal(getSearchModeFromInput(" Queens Village "), "location");
});

test("formats distances and unknown values", () => {
  assert.equal(formatDistanceMiles(1.26), "1.3 mi");
  assert.equal(formatDistanceMiles(null), "Distance unavailable");
});

test("formats status labels", () => {
  assert.equal(formatStatusLabel("review"), "Review");
  assert.equal(formatStatusLabel("e_coli_detected"), "E Coli Detected");
});

test("builds fallback nearby summary from sample-level summaries", () => {
  const summary = buildFallbackNearbySummary([
    buildSample(
      "1",
      {
        bacteria: "not_detected",
        clarity: "normal",
        disinfection: "normal",
        overall: "normal",
      },
      2.3,
    ),
    buildSample(
      "2",
      {
        bacteria: "e_coli_detected",
        clarity: "review",
        disinfection: "low_review",
        overall: "alert",
      },
      1.2,
    ),
  ]);

  assert.equal(summary.sampleCount, 2);
  assert.equal(summary.overall, "alert");
  assert.equal(summary.bacteria, "e_coli_detected");
  assert.equal(summary.clarity, "review");
  assert.equal(summary.disinfection, "low_review");
  assert.equal(summary.nearestDistanceMiles, 1.2);
});
