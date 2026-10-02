/**
 * Shared CSV/text normalization utilities used by all inventory parsers.
 * Extracted to avoid code duplication across csvParser, routerCsvParser,
 * flotaCsvParser, and sensorizeitCsvParser.
 */

/**
 * Strips invisible unicode characters, converts non-breaking spaces to standard spaces,
 * collapses multiple consecutive spaces into a single space, and trims outer whitespace.
 */
export function normalizeText(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Standardizes categorization dimension values (removes whitespace, normalizes casing).
 * Returns the fallback if the value is empty, a dash, or a known "no data" sentinel.
 */
export function normalizeDimension(value: unknown, fallback: string): string {
  const clean = normalizeText(value);
  if (!clean || clean === '-' || clean === 'N/A' || clean === 'S/N' || clean === 'SIN INFORMACION' || clean === 'NONE') {
    return fallback;
  }
  return clean.toUpperCase();
}

/**
 * Detects if a row is purely an empty line, empty array, or total/summary row.
 * Used by all parsers to skip non-data rows (totals, sums, blank lines).
 */
export function isRowValidData(cells: string[]): boolean {
  const nonEmptyCells = cells.filter(c => normalizeText(c).length > 0);
  if (nonEmptyCells.length === 0) return false;

  const firstNonEmpty = normalizeText(nonEmptyCells[0]).toUpperCase();
  if (
    firstNonEmpty === 'TOTAL' ||
    firstNonEmpty === 'TOTAL GENERAL' ||
    firstNonEmpty === 'TOTALES' ||
    firstNonEmpty === 'SUMA' ||
    firstNonEmpty.startsWith('TOTAL ')
  ) {
    return false;
  }

  return true;
}

/**
 * Generic column index finder used by all parsers.
 * Tries exact match first, then partial substring match against normalized headers.
 */
export function findColumnIndex(keywords: string[], defaultIdx: number, normHeaders: string[]): number {
  // Exact match first
  for (const kw of keywords) {
    const idx = normHeaders.indexOf(kw);
    if (idx !== -1) return idx;
  }
  // Partial substring match
  for (const kw of keywords) {
    const idx = normHeaders.findIndex(h => h.includes(kw));
    if (idx !== -1) return idx;
  }
  return defaultIdx;
}
