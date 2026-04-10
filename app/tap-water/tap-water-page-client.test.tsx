import assert from "node:assert/strict";
import test from "node:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { setupDomEnvironment } from "@/lib/test/setup-dom";
import { initialTapWaterState, type TapWaterPageState } from "@/lib/tap-water/state";
import { TapWaterPageClient } from "./tap-water-page-client";

const successPayload = {
  data: [
    {
      id: "sample-77050",
      sampleNumber: "77050",
      sampleDate: "2015-01-03",
      sampleTime: "11:32:00",
      sampledAt: "2015-01-03T11:32:00",
      sampleSite: "77050",
      sampleClass: "Compliance",
      location:
        "SS - IFO 93-40 E/S 217th St, S/O 94th Ave, IFO Queens Village Branch.",
      latitude: 40.7182,
      longitude: -73.7381,
      distanceMiles: 8.4,
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
    origin: {
      latitude: 40.7851,
      longitude: -73.846,
    },
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
    nearestDistanceMiles: 8.4,
    overall: "normal",
    bacteria: "not_detected",
    clarity: "normal",
    disinfection: "normal",
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
    assert.ok(view.getByText("NYC Tap Water Lookup"));
    assert.ok(
      view.getByText(
        "Enter a ZIP code to see nearest samples, distances, and a nearby health summary.",
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

test("renders nearby summary and sample list on success", async () => {
  const teardown = setupDomEnvironment();

  try {
    const view = render(
      <TapWaterPageClient
        controller={makeController({
          query: "11356",
          phase: "success",
          data: successPayload.data,
          meta: successPayload.meta,
          nearbySummary: successPayload.nearbySummary,
        })}
      />,
    );

    assert.ok(view.getByText("Nearby Summary"));
    assert.ok(view.getByText("Nearby Samples"));
    assert.ok(view.getByText("Overall: Normal"));
    assert.ok(
      view.getByText(
        "SS - IFO 93-40 E/S 217th St, S/O 94th Ave, IFO Queens Village Branch.",
      ),
    );
    assert.ok(view.getAllByText("8.4 mi").length >= 1);
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
          meta: {
            zip: "11356",
            origin: { latitude: 40.7851, longitude: -73.846 },
            count: 0,
            total: 0,
            page: 1,
            pageSize: 0,
            totalPages: 0,
            sortBy: "distanceMiles",
            sortDir: "asc",
            nearestMatches: [],
          },
          nearbySummary: {
            sampleCount: 0,
            nearestDistanceMiles: null,
            overall: "unknown",
            bacteria: "unknown",
            clarity: "unknown",
            disinfection: "unknown",
          },
        })}
      />,
    );

    assert.ok(
      view.getByText(
        "No samples matched this search yet. Try another ZIP code or broader location.",
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
      view.getByPlaceholderText("Enter ZIP code or location").closest("form") as HTMLFormElement,
    );

    assert.equal(submitCalls, 2);
  } finally {
    cleanup();
    teardown();
  }
});
