import assert from "node:assert/strict";
import test from "node:test";
import { act, renderHook, waitFor } from "@testing-library/react";
import { setupDomEnvironment } from "@/lib/test/setup-dom";
import { useTapWaterSearch } from "./use-tap-water-search";

test("rejects invalid short ZIP input before request", async () => {
  const teardown = setupDomEnvironment();

  try {
    let called = false;
    globalThis.fetch = (async () => {
      called = true;
      throw new Error("should not reach fetch");
    }) as typeof fetch;

    const { result } = renderHook(() => useTapWaterSearch());

    act(() => {
      result.current.setQuery("1135");
    });

    await act(async () => {
      await result.current.submitSearch();
    });

    assert.equal(called, false);
    assert.equal(result.current.state.phase, "validation_error");
  } finally {
    teardown();
  }
});

test("loads successful ZIP search response", async () => {
  const teardown = setupDomEnvironment();

  try {
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({
          data: [
            {
              id: "sample-1",
              sampleNumber: "1",
              sampleDate: "2024-01-01",
              sampleTime: "08:00:00",
              sampledAt: "2024-01-01T08:00:00",
              sampleSite: "77050",
              sampleClass: "Compliance",
              location: "Queens",
              latitude: 40.7,
              longitude: -73.8,
              distanceMiles: 1.4,
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
            nearestMatches: [],
          },
          nearbySummary: {
            sampleCount: 1,
            nearestDistanceMiles: 1.4,
            overall: "normal",
            bacteria: "not_detected",
            clarity: "normal",
            disinfection: "normal",
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      )) as typeof fetch;

    const { result } = renderHook(() => useTapWaterSearch());

    act(() => {
      result.current.setQuery("11356");
    });

    await act(async () => {
      await result.current.submitSearch();
    });

    await waitFor(() => {
      assert.equal(result.current.state.phase, "success");
      assert.equal(result.current.state.data.length, 1);
      assert.equal(result.current.state.meta?.zip, "11356");
    });
  } finally {
    teardown();
  }
});
