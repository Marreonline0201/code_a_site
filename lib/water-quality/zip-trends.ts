import "server-only";

import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { DEFAULT_WATER_ZIP_TRENDS_CSV_PATH } from "./constants";
import type { RawCsvRow, ZipLeadTrendRecord, ZipLeadTrendSummary } from "./types";

export type LoadedZipTrendFile = {
  absolutePath: string;
  mtimeMs: number;
  rows: RawCsvRow[];
  headers: string[];
};

type ZipTrendDataset = {
  sourcePath: string;
  loadedAt: string;
  records: ZipLeadTrendRecord[];
  byZipCode: Map<string, ZipLeadTrendRecord[]>;
};

let cachedDataset:
  | {
      cacheKey: string;
      dataset: ZipTrendDataset;
    }
  | null = null;

function getCsvPath() {
  const configuredPath =
    process.env.NYC_WATER_ZIP_TRENDS_CSV_PATH ||
    DEFAULT_WATER_ZIP_TRENDS_CSV_PATH;

  if (path.isAbsolute(configuredPath)) return configuredPath;

  const cwdPath = path.join(process.cwd(), configuredPath);
  try {
    if (require("fs").existsSync(cwdPath)) return cwdPath;
  } catch {}

  const dirnamePath = path.resolve(__dirname, "../../..", configuredPath);
  try {
    if (require("fs").existsSync(dirnamePath)) return dirnamePath;
  } catch {}

  return cwdPath;
}

function parseCsvText(text: string) {
  const rows: string[][] = [];
  let currentField = "";
  let currentRow: string[] = [];
  let inQuotes = false;
  const normalizedText = text.replace(/^\uFEFF/, "");

  for (let index = 0; index < normalizedText.length; index += 1) {
    const char = normalizedText[index];
    const next = normalizedText[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        currentField += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      currentRow.push(currentField);
      currentField = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      currentRow.push(currentField);
      rows.push(currentRow);
      currentRow = [];
      currentField = "";
      continue;
    }

    currentField += char;
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  return rows.filter((row) => row.some((field) => field.trim().length > 0));
}

function cleanString(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

function parseNumber(value: string | undefined) {
  const cleaned = cleanString(value);
  if (!cleaned) {
    return null;
  }

  const numeric = Number(cleaned.replace(/[%,$]/g, ""));
  return Number.isFinite(numeric) ? numeric : null;
}

function parsePercent(value: string | undefined) {
  const numeric = parseNumber(value);
  return numeric == null ? null : numeric;
}

function convertMicrogramsPerLiterToMgL(value: number | null) {
  return value == null ? null : value / 1000;
}

function rowsToObjects(rows: string[][]) {
  const [headerRow, ...dataRows] = rows;

  if (!headerRow || headerRow.length === 0) {
    throw new Error("CSV file is empty or missing a header row.");
  }

  const headers = headerRow.map((header) => header.trim());
  const objects = dataRows.map<RawCsvRow>((row) => {
    const result: RawCsvRow = {};

    headers.forEach((header, index) => {
      result[header] = row[index] ?? "";
    });

    return result;
  });

  return { headers, rows: objects };
}

async function loadCsvFile(): Promise<LoadedZipTrendFile> {
  const absolutePath = getCsvPath();

  let fileStat;
  try {
    fileStat = await stat(absolutePath);
  } catch {
    throw new Error(
      `NYC ZIP trend CSV not found at "${absolutePath}". Set NYC_WATER_ZIP_TRENDS_CSV_PATH or add the file there.`,
    );
  }

  const fileContents = await readFile(absolutePath, "utf8");
  const parsedRows = parseCsvText(fileContents);
  const { headers, rows } = rowsToObjects(parsedRows);

  return {
    absolutePath,
    mtimeMs: fileStat.mtimeMs,
    headers,
    rows,
  };
}

export async function getZipTrendDataset() {
  const csvFile = await loadCsvFile();
  const cacheKey = [csvFile.mtimeMs].join(":");

  if (cachedDataset && cachedDataset.cacheKey === cacheKey) {
    return cachedDataset.dataset;
  }

  const headers = csvFile.headers;
  const zipIndex = headers.indexOf("Zipcode");
  const yearIndex = headers.indexOf("YEAR");
  const totalSamplesIndex = headers.indexOf("*TOTAL SAMPS ZIP");
  const samplesWithLeadIndex = headers.indexOf("*TOTAL SAMPS W/LEAD");
  const percentWithLeadIndex = headers.indexOf("*% SAMPS WITH LEAD");
  const averageFirstDrawIndex = headers.indexOf("AVG LEVEL FD");
  const averageSecondDrawIndex = headers.indexOf("AVG LEVEL SD");
  const averageAllIndex = headers.indexOf("*AVG ALL");
  const highestDrawIndex = headers.indexOf("*HIGHEST DRAW");

  if (zipIndex === -1 || yearIndex === -1) {
    throw new Error("Could not find Zipcode and YEAR columns in the ZIP trend CSV.");
  }

  const records: ZipLeadTrendRecord[] = csvFile.rows
    .map((row) => {
      const zipCode = cleanString(row[headers[zipIndex] ?? ""]);
      const year = parseNumber(row[headers[yearIndex] ?? ""]);

      if (!zipCode || year == null) {
        return null;
      }

      return {
        zipCode,
        year,
        totalSamples: parseNumber(row[headers[totalSamplesIndex] ?? ""]) ?? 0,
        samplesWithLead: parseNumber(row[headers[samplesWithLeadIndex] ?? ""]) ?? 0,
        percentWithLead: parsePercent(row[headers[percentWithLeadIndex] ?? ""]) ?? 0,
        averageFirstDrawMgL: convertMicrogramsPerLiterToMgL(
          parseNumber(row[headers[averageFirstDrawIndex] ?? ""]),
        ),
        averageSecondDrawMgL: convertMicrogramsPerLiterToMgL(
          parseNumber(row[headers[averageSecondDrawIndex] ?? ""]),
        ),
        averageAllMgL: convertMicrogramsPerLiterToMgL(
          parseNumber(row[headers[averageAllIndex] ?? ""]),
        ),
        highestDrawMgL: convertMicrogramsPerLiterToMgL(
          parseNumber(row[headers[highestDrawIndex] ?? ""]),
        ),
        raw: row,
      };
    })
    .filter((record): record is ZipLeadTrendRecord => record != null);

  const byZipCode = new Map<string, ZipLeadTrendRecord[]>();

  records.forEach((record) => {
    const existing = byZipCode.get(record.zipCode) ?? [];
    existing.push(record);
    byZipCode.set(record.zipCode, existing);
  });

  const dataset: ZipTrendDataset = {
    sourcePath: csvFile.absolutePath,
    loadedAt: new Date().toISOString(),
    records,
    byZipCode,
  };

  cachedDataset = {
    cacheKey,
    dataset,
  };

  return dataset;
}

export async function getZipTrendSummary(zipCode: string): Promise<ZipLeadTrendSummary | null> {
  const dataset = await getZipTrendDataset();
  const records = dataset.byZipCode.get(zipCode) ?? [];

  if (records.length === 0) {
    return null;
  }

  const years = Array.from(new Set(records.map((record) => record.year))).sort(
    (left, right) => right - left,
  );

  const totalSamples = records.reduce((sum, record) => sum + record.totalSamples, 0);
  const samplesWithLead = records.reduce((sum, record) => sum + record.samplesWithLead, 0);
  const averagePercentWithLead =
    records.reduce((sum, record) => sum + record.percentWithLead, 0) / records.length;
  const averageFirstDraw = records.reduce(
    (sum, record) => sum + (record.averageFirstDrawMgL ?? 0),
    0,
  ) / records.filter((record) => record.averageFirstDrawMgL != null).length;
  const averageSecondDraw = records.reduce(
    (sum, record) => sum + (record.averageSecondDrawMgL ?? 0),
    0,
  ) / records.filter((record) => record.averageSecondDrawMgL != null).length;
  const averageAll = records.reduce((sum, record) => sum + (record.averageAllMgL ?? 0), 0) /
    records.filter((record) => record.averageAllMgL != null).length;
  const highestDraw = records.reduce<number | null>((max, record) => {
    if (record.highestDrawMgL == null) {
      return max;
    }
    if (max == null) {
      return record.highestDrawMgL;
    }
    return Math.max(max, record.highestDrawMgL);
  }, null);

  return {
    zipCode,
    recordCount: records.length,
    years,
    totalSamples,
    samplesWithLead,
    averagePercentWithLead: Number.isFinite(averagePercentWithLead)
      ? averagePercentWithLead
      : null,
    averageFirstDrawMgL: Number.isFinite(averageFirstDraw) ? averageFirstDraw : null,
    averageSecondDrawMgL: Number.isFinite(averageSecondDraw) ? averageSecondDraw : null,
    averageAllMgL: Number.isFinite(averageAll) ? averageAll : null,
    highestDrawMgL: highestDraw,
    records: [...records].sort((left, right) => right.year - left.year),
  };
}
