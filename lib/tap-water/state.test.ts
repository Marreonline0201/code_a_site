import assert from "node:assert/strict";
import test from "node:test";
import { initialTapWaterState, tapWaterReducer } from "./state";

test("updates query and clears validation state", () => {
  const withValidationError = {
    ...initialTapWaterState,
    phase: "validation_error" as const,
    errorMessage: "ZIP code must be exactly 5 digits.",
  };

  const next = tapWaterReducer(withValidationError, {
    type: "queryChanged",
    query: "11356",
  });

  assert.equal(next.query, "11356");
  assert.equal(next.phase, "idle");
  assert.equal(next.errorMessage, null);
});

test("transitions through loading -> success", () => {
  const loading = tapWaterReducer(initialTapWaterState, {
    type: "searchStarted",
    query: "11356",
  });

  assert.equal(loading.phase, "loading");
  assert.equal(loading.submittedQuery, "11356");

  const success = tapWaterReducer(loading, {
    type: "searchSucceeded",
    query: "11356",
    data: [
      {
        id: "sample-1",
        sampleNumber: "1",
        sampleDate: "2024-01-01",
        sampleTime: "08:00:00",
        sampledAt: "2024-01-01T08:00:00",
        sampleSite: "A",
        sampleClass: "Compliance",
        location: "Queens",
        latitude: 40.7,
        longitude: -73.8,
        distanceMiles: 1.2,
        summary: {
          bacteria: "not_detected",
          clarity: "normal",
          disinfection: "normal",
          overall: "normal",
        },
        healthSummary: {
          status: "normal",
          reasons: ["No coliform or E. coli were detected in this sample."],
        },
      },
    ],
    meta: {
      zip: "11356",
      origin: { latitude: 40.7851, longitude: -73.846 },
      count: 1,
      total: 1,
      page: 1,
      pageSize: 1,
      totalPages: 1,
      sortBy: "distanceMiles",
      sortDir: "asc",
    },
    nearbySummary: {
      sampleCount: 1,
      nearestDistanceMiles: 1.2,
      overall: "normal",
      bacteria: "not_detected",
      clarity: "normal",
      disinfection: "normal",
    },
  });

  assert.equal(success.phase, "success");
  assert.equal(success.data.length, 1);
  assert.equal(success.meta?.zip, "11356");
});

test("records failed request state", () => {
  const failed = tapWaterReducer(initialTapWaterState, {
    type: "searchFailed",
    query: "11356",
    message: "Failed to fetch nearby tap water samples.",
  });

  assert.equal(failed.phase, "error");
  assert.equal(failed.errorMessage, "Failed to fetch nearby tap water samples.");
});
