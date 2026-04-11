"use client";

import { useCallback, useRef, useState } from "react";
import type { WaterSystem, WaterQualitySearchResult, WaterSystemDetailResult, Violation } from "./types";

type SearchPhase =
  | "idle"
  | "loading"
  | "success"
  | "empty"
  | "error"
  | "validation_error";

interface SearchState {
  phase: SearchPhase;
  query: string;
  systems: WaterSystem[];
  errorMessage: string | null;
  totalSystems: number;
}

interface DetailState {
  phase: "idle" | "loading" | "success" | "error";
  system: WaterSystem | null;
  violations: Violation[];
  recentViolations: Violation[];
  errorMessage: string | null;
}

export function useWaterQualitySearch() {
  const [search, setSearch] = useState<SearchState>({
    phase: "idle",
    query: "",
    systems: [],
    errorMessage: null,
    totalSystems: 0,
  });

  const [detail, setDetail] = useState<DetailState>({
    phase: "idle",
    system: null,
    violations: [],
    recentViolations: [],
    errorMessage: null,
  });

  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setQuery = useCallback((value: string) => {
    setSearch((prev) => ({ ...prev, query: value }));
  }, []);

  const executeSearch = useCallback(async (queryValue?: string) => {
    const raw = (queryValue ?? search.query).trim();

    if (!raw) {
      setSearch((prev) => ({
        ...prev,
        phase: "validation_error",
        errorMessage: "Please enter a ZIP code or state abbreviation.",
      }));
      return;
    }

    // Determine if zip or state
    const isZip = /^\d{5}$/.test(raw);
    const isState = /^[A-Za-z]{2}$/.test(raw);

    if (!isZip && !isState) {
      setSearch((prev) => ({
        ...prev,
        phase: "validation_error",
        errorMessage: "Enter a 5-digit ZIP code (e.g. 10001) or 2-letter state (e.g. NY).",
      }));
      return;
    }

    // Cancel any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setSearch((prev) => ({
      ...prev,
      phase: "loading",
      errorMessage: null,
    }));

    try {
      const param = isZip ? `zip=${raw}` : `state=${raw.toUpperCase()}`;
      const res = await fetch(`/api/water-quality?${param}`, {
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }

      const data: WaterQualitySearchResult = await res.json();

      if (controller.signal.aborted) return;

      setSearch({
        query: raw,
        phase: data.systems.length > 0 ? "success" : "empty",
        systems: data.systems,
        errorMessage: null,
        totalSystems: data.totalSystems,
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setSearch((prev) => ({
        ...prev,
        phase: "error",
        errorMessage:
          err instanceof Error ? err.message : "An unexpected error occurred.",
      }));
    }
  }, [search.query]);

  const debouncedSearch = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      setSearch((prev) => ({ ...prev, query: value }));

      const trimmed = value.trim();
      if (trimmed.length < 2) return;

      debounceRef.current = setTimeout(() => {
        executeSearch(trimmed);
      }, 500);
    },
    [executeSearch],
  );

  const fetchSystemDetail = useCallback(async (pwsid: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setDetail({
      phase: "loading",
      system: null,
      violations: [],
      recentViolations: [],
      errorMessage: null,
    });

    try {
      const res = await fetch(`/api/water-quality/${encodeURIComponent(pwsid)}`, {
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }

      const data: WaterSystemDetailResult = await res.json();

      if (controller.signal.aborted) return;

      setDetail({
        phase: "success",
        system: data.system,
        violations: data.violations,
        recentViolations: data.recentViolations,
        errorMessage: null,
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setDetail((prev) => ({
        ...prev,
        phase: "error",
        errorMessage:
          err instanceof Error ? err.message : "Failed to load system details.",
      }));
    }
  }, []);

  const clearDetail = useCallback(() => {
    setDetail({
      phase: "idle",
      system: null,
      violations: [],
      recentViolations: [],
      errorMessage: null,
    });
  }, []);

  return {
    search,
    detail,
    setQuery,
    executeSearch,
    debouncedSearch,
    fetchSystemDetail,
    clearDetail,
  };
}
