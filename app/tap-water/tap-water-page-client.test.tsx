import assert from "node:assert/strict";
import test from "node:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { setupDomEnvironment } from "@/lib/test/setup-dom";
import { initialTapWaterState, type TapWaterPageState } from "@/lib/tap-water/state";
import { TapWaterPageClient } from "./tap-water-page-client";

const sampleRecord = {
  id: "sample-77050",
  sampleNumber: "77050",
  sampleDate: "2015-01-03",
  sampleTime: null,
  sampledAt: "2015-01-03T11:32:00",
  dateReceived: "2015-01-04",
  zipCode: "11356",
  borough: "Queens",
  location: "Queens • 11356",
  latitude: null,
  longitude: null,
  leadFirstDraw: { raw: "0.019", value: 0.019, comparator: "eq", parseError: null },
  leadFlushOneToTwo: { raw: "0.004", value: 0.004, comparator: "eq", parseError: null },
  leadFlushFive: { raw: null, value: null, comparator: null, parseError: null },
  copperFirstDraw: { raw: "0.313", value: 0.313, comparator: "eq", parseError: null },
  copperFlushOneToTwo: { raw: "0.043", value: 0.043, comparator: "eq", parseError: null },
  copperFlushFive: { raw: null, value: null, comparator: null, parseError: null },
  summary: {
    leadRisk: "high",
    overall: "alert",
    filterRecommendation: "strongly_recommended",
  },
  healthSummary: {
    status: "alert",
    reasons: ["Lead is at or above the EPA 0.015 mg/L action level."],
  },
};

function makeController(
  overrides: Partial<TapWaterPageState> = {},
  handlers?: {
    setQuery?: (query: string) => void;
    submitSearch?: () => Promise<void>;
  },
) {
  const state: TapWaterPageState = {
    ...initialTapWaterState,
    ...overrides,
  };

  return {
    state,
    setQuery: handlers?.setQuery ?? (() => {}),
    submitSearch: handlers?.submitSearch ?? (async () => {}),
  };
}

test("renders initial idle state", async () => {
  const teardown = setupDomEnvironment();

  try {
    const view = render(<TapWaterPageClient controller={makeController()} />);
    assert.ok(view.getByText("NYC Home Lead Results by ZIP"));
    assert.ok(
      view.getByText(
        "Enter a ZIP code to see aggregated lead results and distribution across homes.",
      ),
    );
  } finally {
    cleanup();
    teardown();
  }
});

test("shows validation error for invalid ZIP-like input", async () => {
  const teardown = setupDomEnvironment();

  try {
    const view = render(
      <TapWaterPageClient
        controller={makeController({
          query: "1135",
          phase: "validation_error",
          errorMessage: "ZIP code must be exactly 5 digits.",
        })}
      />,
    );
    assert.ok(view.getByText("ZIP code must be exactly 5 digits."));
  } finally {
    cleanup();
    teardown();
  }
});

test("shows loading state while request is pending", async () => {
  const teardown = setupDomEnvironment();

  try {
    const view = render(
      <TapWaterPageClient
        controller={makeController({
          query: "11356",
          phase: "loading",
        })}
      />,
    );
    assert.ok(view.getByRole("button", { name: "Searching..." }));
  } finally {
    cleanup();
    teardown();
  }
});

test("renders lead overview, distribution, and recent tests on success", async () => {
  const teardown = setupDomEnvironment();

  try {
    const view = render(
      <TapWaterPageClient
        controller={makeController({
          query: "11356",
          phase: "success",
          data: [sampleRecord],
          recentTests: [sampleRecord],
          meta: {
            zip: "11356",
            count: 1,
            total: 1,
            page: 1,
            pageSize: 1,
            totalPages: 1,
            sortBy: "sampleDate",
            sortDir: "desc",
            nearestMatches: [],
          },
          leadSummary: {
            sampleCount: 1,
            mostRecentTestDate: "2015-01-03",
            medianFirstDraw: 0.019,
            maxFirstDraw: 0.019,
            percentDetected: 100,
            percentElevated: 100,
          },
          distribution: {
            notDetected: { count: 0, percent: 0 },
            detected: { count: 0, percent: 0 },
            elevated: { count: 1, percent: 100 },
          },
          zipTrends: {
            zipCode: "11356",
            recordCount: 2,
            years: [2023, 2017],
            totalSamples: 531,
            samplesWithLead: 105,
            averagePercentWithLead: 19.2,
            averageFirstDrawMgL: 0.00142,
            averageSecondDrawMgL: 0.0004,
            averageAllMgL: 0.00091,
            highestDrawMgL: 0.032,
            records: [
              {
                zipCode: "11356",
                year: 2023,
                totalSamples: 352,
                samplesWithLead: 71,
                percentWithLead: 20,
                averageFirstDrawMgL: 0.00178,
                averageSecondDrawMgL: 0.001,
                averageAllMgL: 0.00138,
                highestDrawMgL: 0.279,
              },
              {
                zipCode: "11356",
                year: 2017,
                totalSamples: 179,
                samplesWithLead: 34,
                percentWithLead: 19,
                averageFirstDrawMgL: 0.00157,
                averageSecondDrawMgL: 0.0001,
                averageAllMgL: 0.000815,
                highestDrawMgL: 0.032,
              },
            ],
          },
          notes: "Lead results vary by home and plumbing conditions.",
        })}
      />,
    );

    assert.ok(view.getByText("Lead Overview"));
    assert.ok(view.getByText("Distribution"));
    assert.ok(view.getByText("ZIP Trend Summary"));
    assert.ok(view.getByText("Recent Tests"));
    assert.ok(view.getByText("Lead results vary by home and plumbing conditions."));
    assert.ok(view.getByText("Percent Detected (> 0)"));
    assert.ok(view.getAllByText("100.0%").length >= 1);
    assert.ok(view.getByText("ZIP 11356"));
  } finally {
    cleanup();
    teardown();
  }
});

test("renders empty state when no samples are returned", async () => {
  const teardown = setupDomEnvironment();

  try {
    const view = render(
      <TapWaterPageClient
        controller={makeController({
          query: "11356",
          phase: "empty",
          data: [],
          recentTests: [],
          meta: {
            zip: "11356",
            count: 0,
            total: 0,
            page: 1,
            pageSize: 0,
            totalPages: 0,
            sortBy: "sampleDate",
            sortDir: "desc",
            nearestMatches: [],
          },
          leadSummary: {
            sampleCount: 0,
            mostRecentTestDate: null,
            medianFirstDraw: null,
            maxFirstDraw: null,
            percentDetected: 0,
            percentElevated: 0,
          },
          distribution: {
            notDetected: { count: 0, percent: 0 },
            detected: { count: 0, percent: 0 },
            elevated: { count: 0, percent: 0 },
          },
          notes: "Lead results vary by home and plumbing conditions.",
        })}
      />,
    );

    assert.ok(
      view.getByText(
        "No lead-at-the-tap samples were found for this ZIP code yet.",
      ),
    );
  } finally {
    cleanup();
    teardown();
  }
});

test("renders ZIP trend summary when no individual sample rows are returned", async () => {
  const teardown = setupDomEnvironment();

  try {
    const view = render(
      <TapWaterPageClient
        controller={makeController({
          query: "11356",
          phase: "success",
          data: [],
          recentTests: [],
          meta: {
            zip: "11356",
            count: 0,
            total: 0,
            page: 1,
            pageSize: 0,
            totalPages: 0,
            sortBy: "sampleDate",
            sortDir: "desc",
            nearestMatches: [],
          },
          leadSummary: {
            sampleCount: 0,
            mostRecentTestDate: null,
            medianFirstDraw: null,
            maxFirstDraw: null,
            percentDetected: 0,
            percentElevated: 0,
          },
          distribution: {
            notDetected: { count: 0, percent: 0 },
            detected: { count: 0, percent: 0 },
            elevated: { count: 0, percent: 0 },
          },
          zipTrends: {
            zipCode: "11356",
            recordCount: 1,
            years: [2023],
            totalSamples: 352,
            samplesWithLead: 71,
            averagePercentWithLead: 20,
            averageFirstDrawMgL: 0.00178,
            averageSecondDrawMgL: 0.001,
            averageAllMgL: 0.00138,
            highestDrawMgL: 0.279,
            records: [
              {
                zipCode: "11356",
                year: 2023,
                totalSamples: 352,
                samplesWithLead: 71,
                percentWithLead: 20,
                averageFirstDrawMgL: 0.00178,
                averageSecondDrawMgL: 0.001,
                averageAllMgL: 0.00138,
                highestDrawMgL: 0.279,
              },
            ],
          },
          notes: "Lead results vary by home and plumbing conditions.",
        })}
      />,
    );

    assert.ok(view.getByText("ZIP Trend Summary"));
    assert.ok(
      view.getByText(
        "No individual sample rows were returned for this ZIP. The ZIP trend summary above still shows the year-by-year aggregate data.",
      ),
    );
  } finally {
    cleanup();
    teardown();
  }
});

test("renders backend error state and retry button", async () => {
  const teardown = setupDomEnvironment();

  try {
    const view = render(
      <TapWaterPageClient
        controller={makeController({
          query: "99999",
          phase: "error",
          errorMessage: "ZIP code must be a valid 5-digit NYC ZIP code.",
        })}
      />,
    );

    assert.ok(view.getByText("ZIP code must be a valid 5-digit NYC ZIP code."));
    assert.ok(view.getByRole("button", { name: "Retry" }));
  } finally {
    cleanup();
    teardown();
  }
});

test("supports search submit interactions", async () => {
  const teardown = setupDomEnvironment();

  try {
    let submitCalls = 0;
    const submitSearch = async () => {
      submitCalls += 1;
    };

    const view = render(
      <TapWaterPageClient
        controller={makeController(
          {
            query: "11356",
          },
          { submitSearch },
        )}
      />,
    );

    fireEvent.click(view.getByRole("button", { name: "Search" }));
    fireEvent.submit(
      view.getByPlaceholderText("Enter ZIP code").closest("form") as HTMLFormElement,
    );

    assert.equal(submitCalls, 2);
  } finally {
    cleanup();
    teardown();
  }
});
