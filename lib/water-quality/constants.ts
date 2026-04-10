import type { NumericFieldKey } from "./types";

export const DEFAULT_WATER_SAMPLES_CSV_PATH = "data/nyc-water-samples.csv";

export const SOURCE_COLUMNS = {
  sampleNumber: "Sample Number",
  sampleDate: "Sample Date",
  sampleTime: "Sample Time",
  sampleSite: "Sample Site",
  sampleClass: "Sample class",
  location: "Location",
  residualFreeChlorine: "Residual Free Chlorine (mg/L)",
  turbidity: "Turbidity (NTU)",
  fluoride: "Fluoride (mg/L)",
  coliformQuantiTray: "Coliform (Quanti-Tray) (MPN /100mL)",
  eColiQuantiTray: "E.coli(Quanti-Tray) (MPN/100mL)",
} as const;

export const SOURCE_COLUMN_ALIASES = {
  eColiQuantiTray: [
    "E.coli(Quanti-Tray) (MPN/100mL)",
    "E.coli (Quanti-Tray) (MPN/100mL)",
  ],
} as const;

export const NUMERIC_FIELDS: NumericFieldKey[] = [
  "residualFreeChlorine",
  "turbidity",
  "fluoride",
  "coliformQuantiTray",
  "eColiQuantiTray",
];

export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 200;
