import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCoverageQueryCandidatesForTest,
  resolveCoverageCoordinate,
} from "./coverage-map.server";
import { getApproximateCoveragePoint } from "./coverage-map";
import type { EchoWaterSystem } from "./client";

function buildSystem(overrides: Partial<EchoWaterSystem> = {}): EchoWaterSystem {
  return {
    PWSName: "Queens Water",
    PWSId: "NY1234567",
    CitiesServed: "Queens, New York",
    StateCode: "NY",
    ZipCodesServed: "11356",
    CountiesServed: "Queens County",
    PWSTypeDesc: "Community Water System",
    PrimarySourceDesc: "Groundwater",
    PopulationServedCount: "10000",
    PWSActivityDesc: "Active",
    OwnerDesc: "City of New York",
    SeriousViolator: "No",
    HealthFlag: "No",
    QtrsWithVio: "0",
    QtrsWithSNC: "0",
    RulesVio3yr: "0",
    SDWAContaminantsInCurViol: null,
    SDWAContaminantsInViol3yr: null,
    CurrVioFlag: "0",
    PbViol: null,
    CuViol: null,
    LeadAndCopperViol: null,
    DfrUrl: "https://example.com/report",
    ViolationCategories: null,
    SDWA3yrComplQtrsHistory: "____________",
    ServiceAreaTypeDesc: "City",
    ...overrides,
  };
}

test("builds coverage geocode candidates from zip, city, county, and state", () => {
  const candidates = buildCoverageQueryCandidatesForTest(buildSystem());

  assert.ok(candidates[0]?.includes("11356"));
  assert.ok(candidates.some((candidate) => candidate.includes("Queens, New York, USA")));
  assert.ok(candidates.some((candidate) => candidate.includes("Queens County, New York, USA")));
  assert.ok(candidates.some((candidate) => candidate.includes("New York, USA")));
});

test("uses geocoded coordinates when a lookup succeeds", async () => {
  const originalFetch = globalThis.fetch;

  try {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify([{ lat: "40.74", lon: "-73.86" }]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })) as typeof fetch;

    const coordinate = await resolveCoverageCoordinate(buildSystem(), 0, 1);

    assert.equal(coordinate.source, "geocoded");
    assert.equal(coordinate.latitude, 40.74);
    assert.equal(coordinate.longitude, -73.86);
    assert.ok(coordinate.label);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("falls back to approximate coordinates when lookup fails", async () => {
  const originalFetch = globalThis.fetch;

  try {
    globalThis.fetch = (async () =>
      new Response("{}", {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })) as typeof fetch;

    const system = buildSystem({
      PWSId: "NY7654321",
      CitiesServed: null,
      ZipCodesServed: null,
      CountiesServed: null,
    });

    const coordinate = await resolveCoverageCoordinate(system, 2, 5);
    const expected = getApproximateCoveragePoint(system.PWSId, system.StateCode, 2, 5);

    assert.equal(coordinate.source, "approximate");
    assert.equal(coordinate.latitude, expected[0]);
    assert.equal(coordinate.longitude, expected[1]);
    assert.equal(coordinate.label, "New York");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
