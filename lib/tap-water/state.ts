import type { TapWaterNearbySummary, TapWaterMeta, TapWaterSample } from "./types";

export type TapWaterPhase =
  | "idle"
  | "loading"
  | "success"
  | "empty"
  | "validation_error"
  | "error";

export type TapWaterPageState = {
  query: string;
  submittedQuery: string | null;
  phase: TapWaterPhase;
  data: TapWaterSample[];
  meta: TapWaterMeta | null;
  nearbySummary: TapWaterNearbySummary | null;
  errorMessage: string | null;
};

export type TapWaterAction =
  | { type: "queryChanged"; query: string }
  | { type: "searchStarted"; query: string }
  | {
      type: "searchSucceeded";
      query: string;
      data: TapWaterSample[];
      meta: TapWaterMeta;
      nearbySummary: TapWaterNearbySummary;
    }
  | { type: "validationFailed"; query: string; message: string }
  | { type: "searchFailed"; query: string; message: string };

export const initialTapWaterState: TapWaterPageState = {
  query: "",
  submittedQuery: null,
  phase: "idle",
  data: [],
  meta: null,
  nearbySummary: null,
  errorMessage: null,
};

export function tapWaterReducer(
  state: TapWaterPageState,
  action: TapWaterAction,
): TapWaterPageState {
  switch (action.type) {
    case "queryChanged":
      return {
        ...state,
        query: action.query,
        errorMessage: state.phase === "validation_error" ? null : state.errorMessage,
        phase: state.phase === "validation_error" ? "idle" : state.phase,
      };
    case "searchStarted":
      return {
        ...state,
        submittedQuery: action.query,
        phase: "loading",
        errorMessage: null,
      };
    case "searchSucceeded":
      return {
        ...state,
        submittedQuery: action.query,
        phase: action.data.length === 0 ? "empty" : "success",
        data: action.data,
        meta: action.meta,
        nearbySummary: action.nearbySummary,
        errorMessage: null,
      };
    case "validationFailed":
      return {
        ...state,
        submittedQuery: action.query,
        phase: "validation_error",
        errorMessage: action.message,
      };
    case "searchFailed":
      return {
        ...state,
        submittedQuery: action.query,
        phase: "error",
        errorMessage: action.message,
      };
    default:
      return state;
  }
}
