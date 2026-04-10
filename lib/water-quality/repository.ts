import "server-only";

import { loadCsvFile } from "./csv";
import { normalizeWaterSample } from "./normalize";
import type { WaterDataset, WaterSample } from "./types";

let cachedDataset:
  | {
      mtimeMs: number;
      dataset: WaterDataset;
    }
  | null = null;

export async function getWaterDataset(): Promise<WaterDataset> {
  const csvFile = await loadCsvFile();

  if (cachedDataset && cachedDataset.mtimeMs === csvFile.mtimeMs) {
    return cachedDataset.dataset;
  }

  const records = csvFile.rows.map((row, index) =>
    normalizeWaterSample(row, index + 2),
  );

  const bySampleNumber = new Map<string, WaterSample>();
  const bySampleSite = new Map<string, WaterSample[]>();
  const bySampleClass = new Map<string, WaterSample[]>();

  records.forEach((record) => {
    if (record.sampleNumber) {
      bySampleNumber.set(record.sampleNumber, record);
    }

    if (record.sampleSiteNormalized) {
      const existingSiteRecords = bySampleSite.get(record.sampleSiteNormalized) ?? [];
      existingSiteRecords.push(record);
      bySampleSite.set(record.sampleSiteNormalized, existingSiteRecords);
    }

    if (record.sampleClassNormalized) {
      const existingClassRecords =
        bySampleClass.get(record.sampleClassNormalized) ?? [];
      existingClassRecords.push(record);
      bySampleClass.set(record.sampleClassNormalized, existingClassRecords);
    }
  });

  const dataset: WaterDataset = {
    sourcePath: csvFile.absolutePath,
    loadedAt: new Date().toISOString(),
    records,
    bySampleNumber,
    bySampleSite,
    bySampleClass,
    uniqueSites: Array.from(
      new Set(records.map((record) => record.sampleSite).filter(Boolean)),
    ) as string[],
    uniqueLocations: Array.from(
      new Set(records.map((record) => record.location).filter(Boolean)),
    ) as string[],
  };

  cachedDataset = {
    mtimeMs: csvFile.mtimeMs,
    dataset,
  };

  return dataset;
}
