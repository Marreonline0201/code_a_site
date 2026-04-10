import type { NearestMatch } from "./types";
import { normalizeText } from "./normalize";

function levenshtein(a: string, b: string) {
  const matrix = Array.from({ length: a.length + 1 }, (_, rowIndex) =>
    Array.from({ length: b.length + 1 }, (_, columnIndex) =>
      rowIndex === 0 ? columnIndex : columnIndex === 0 ? rowIndex : 0,
    ),
  );

  for (let row = 1; row <= a.length; row += 1) {
    for (let column = 1; column <= b.length; column += 1) {
      const cost = a[row - 1] === b[column - 1] ? 0 : 1;
      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + cost,
      );
    }
  }

  return matrix[a.length][b.length];
}

function scoreCandidate(query: string, candidate: string) {
  if (!query || !candidate) {
    return 0;
  }

  if (query === candidate) {
    return 10_000;
  }

  if (candidate.startsWith(query)) {
    return 8_000 - candidate.length;
  }

  if (candidate.includes(query)) {
    return 6_000 - candidate.length;
  }

  const queryTokens = query.split(" ");
  const matchedTokens = queryTokens.filter((token) => candidate.includes(token));

  if (matchedTokens.length > 0) {
    return 4_000 + matchedTokens.length * 100 - candidate.length;
  }

  const distance = levenshtein(query, candidate);
  return Math.max(
    0,
    2_000 - distance * 100 - Math.abs(candidate.length - query.length) * 10,
  );
}

export function findNearestTextMatches(
  query: string,
  candidates: string[],
  field: NearestMatch["field"],
  limit = 5,
) {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return [];
  }

  return candidates
    .map((candidate) => ({
      field,
      value: candidate,
      score: scoreCandidate(normalizedQuery, normalizeText(candidate)),
    }))
    .filter((candidate) => candidate.score > 0)
    .sort(
      (left, right) => right.score - left.score || left.value.localeCompare(right.value),
    )
    .slice(0, limit);
}
