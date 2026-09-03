import { SheetSlotConfig, SimCardItem, RouterItem, FlotaItem, SensorizeitItem } from '../types';
import { parseCsvToSimCards, parseGoogleSheetsApiResponse, parseGridToSimCards } from '../utils/csvParser';
import { parseCsvToRouters, parseGridToRouters } from '../utils/routerCsvParser';
import { parseCsvToFlota, parseGridToFlota } from '../utils/flotaCsvParser';
import { parseCsvToSensorizeit, parseGridToSensorizeit } from '../utils/sensorizeitCsvParser';
import { INITIAL_CSV_RAW } from '../data/sampleData';
import { INITIAL_ROUTERS_CSV_RAW } from '../data/routerSampleData';
import { RAW_FLOTA_SAMPLE_CSV } from '../data/flotaSampleData';
import { RAW_SENSORIZEIT_SAMPLE_CSV } from '../data/sensorizeitSampleData';

export function isHttpUrl(input?: string | null): boolean {
  if (!input) return false;
  const trimmed = input.trim().toLowerCase();
  return trimmed.startsWith('http://') || trimmed.startsWith('https://');
}

export function isGasUrl(input?: string | null): boolean {
  if (!input) return false;
  const trimmed = input.trim().toLowerCase();
  return trimmed.includes('script.google.com') || trimmed.includes('/macros/s/');
}

export function extractSheetId(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  const match = trimmed.match(/\/d\/(?:e\/)?([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
}

export function extractGid(input: string): string | null {
  if (!input) return null;
  const match = input.match(/[?&#]gid=([0-9]+)/);
  return match && match[1] ? match[1] : null;
}

function isHtmlResponse(text: string): boolean {
  if (!text) return true;
  const trimmed = text.trim().toLowerCase();
  return (
    trimmed.startsWith('<!doctype html') ||
    trimmed.startsWith('<html') ||
    trimmed.includes('<body') ||
    trimmed.includes('google-site-verification') ||
    trimmed.includes('accounts.google.com')
  );
}

/**
 * Universal direct fetcher for Google Apps Script (GAS) Web Apps or published CSV/JSON URLs.
 * Automatically handles text/csv responses as well as JSON responses (2D grid, array of objects, {values: [...]}, or {data: [...]}).
 */
async function fetchFromDirectUrl<T>(
  rawUrl: string,
  gridParser: (rows: (string | unknown)[][]) => T[],
  csvParser: (csv: string) => T[],
  label: string
): Promise<{ records: T[]; source: string }> {
  let targetUrl = rawUrl.trim();
  if (targetUrl.includes('/pubhtml')) {
    targetUrl = targetUrl.replace('/pubhtml', '/pub?output=csv');
  }

  const response = await fetch(targetUrl, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const rawText = await response.text();
  if (isHtmlResponse(rawText)) {
    throw new Error(
      'La URL devolvió una página HTML en lugar de datos (Verifica los permisos en Google Apps Script: "Quién tiene acceso" debe ser "Cualquier persona").'
    );
  }

  // 1. Check if it's JSON
  try {
    const json = JSON.parse(rawText);
    if (Array.isArray(json)) {
      if (json.length === 0) {
        return { records: [], source: `${label} (JSON vacío)` };
      }
      if (Array.isArray(json[0])) {
        const records = gridParser(json as (string | unknown)[][]);
        if (records.length > 0) {
          return { records, source: `${label} (JSON Grid)` };
        }
      } else if (typeof json[0] === 'object' && json[0] !== null) {
        const headers = Object.keys(json[0]);
        const rows = [headers, ...json.map((obj: Record<string, unknown>) => headers.map(k => obj[k] ?? ''))];
        const records = gridParser(rows);
        if (records.length > 0) {
          return { records, source: `${label} (JSON Objetos)` };
        }
      }
    } else if (json && typeof json === 'object') {
      const maybeObj = json as Record<string, unknown>;
      if (Array.isArray(maybeObj.values)) {
        const records = gridParser(maybeObj.values as (string | unknown)[][]);
        if (records.length > 0) {
          return { records, source: `${label} (JSON Values)` };
        }
      }
      if (Array.isArray(maybeObj.data)) {
        const dataArr = maybeObj.data;
        if (Array.isArray(dataArr[0])) {
          const records = gridParser(dataArr as (string | unknown)[][]);
          if (records.length > 0) {
            return { records, source: `${label} (JSON Data Grid)` };
          }
        } else if (typeof dataArr[0] === 'object' && dataArr[0] !== null) {
          const headers = Object.keys(dataArr[0] as object);
          const rows = [headers, ...dataArr.map((obj: Record<string, unknown>) => headers.map(k => obj[k] ?? ''))];
          const records = gridParser(rows);
          if (records.length > 0) {
            return { records, source: `${label} (JSON Data)` };
          }
        }
      }
    }
  } catch {
    // Not valid JSON, proceed directly to CSV parsing
  }

  // 2. Parse as CSV
  const records = csvParser(rawText);
  if (records.length === 0) {
    throw new Error(`No se detectaron registros válidos en la respuesta de ${label}`);
  }
  return { records, source: `${label} (CSV / GAS)` };
}

// -------------------------------------------------------------
// 1. SIM DATA FETCHER
// -------------------------------------------------------------
export async function fetchSimData(config: SheetSlotConfig): Promise<{ records: SimCardItem[]; source: string }> {
  // A. Explicit published CSV or direct URL
  if (config.publishedCsvUrl && config.publishedCsvUrl.trim()) {
    try {
      return await fetchFromDirectUrl(
        config.publishedCsvUrl,
        parseGridToSimCards,
        parseCsvToSimCards,
        'URL Publicada / GAS (SIM)'
      );
    } catch (err: unknown) {
      if (!config.sheetIdOrUrl?.trim()) {
        const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
        throw new Error(`Fallo con URL directa SIM: ${errorMsg}`);
      }
    }
  }

  // B. Google Apps Script Web App URL or direct endpoint
  if (
    isHttpUrl(config.sheetIdOrUrl) &&
    (isGasUrl(config.sheetIdOrUrl) || !config.sheetIdOrUrl.includes('docs.google.com/spreadsheets'))
  ) {
    try {
      return await fetchFromDirectUrl(
        config.sheetIdOrUrl,
        parseGridToSimCards,
        parseCsvToSimCards,
        'Google Apps Script (SIM)'
      );
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      throw new Error(`Fallo al conectar con Google Apps Script (SIM): ${errorMsg}`);
    }
  }

  const sheetId = extractSheetId(config.sheetIdOrUrl);
  const sheetName = config.sheetName?.trim() || 'SIM';
  const gid = extractGid(config.sheetIdOrUrl);

  if (sheetId) {
    // Google Sheets API v4 with Key
    if (config.apiKey && config.apiKey.trim()) {
      try {
        const ranges = [sheetName, `'${sheetName}'!A1:Z`, 'A1:Z'];
        let lastApiErr = '';
        for (const r of ranges) {
          const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(r)}?key=${config.apiKey.trim()}&valueRenderOption=FORMATTED_VALUE`;
          const res = await fetch(url, { cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            if (data.values && data.values.length > 0) {
              const records = parseGoogleSheetsApiResponse(data.values);
              if (records.length > 0) {
                return { records, source: `Google Sheets API (SIM: "${sheetName}")` };
              }
            }
          } else {
            const errBody = await res.json().catch(() => ({}));
            lastApiErr = errBody?.error?.message || res.statusText;
          }
        }
        throw new Error(`Google Sheets API: ${lastApiErr || 'No se pudo leer la hoja'}`);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
        throw new Error(`Error en API Google Sheets: ${errorMsg}`);
      }
    }

    // Public GViz and Export endpoints
    const candidateUrls: { url: string; label: string }[] = [];
    if (gid) candidateUrls.push({ url: `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}`, label: `GViz GID ${gid}` });
    candidateUrls.push({ url: `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`, label: `GViz Sheet "${sheetName}"` });
    candidateUrls.push({ url: `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`, label: `GViz Principal` });
    if (gid) candidateUrls.push({ url: `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`, label: `Export GID ${gid}` });
    candidateUrls.push({ url: `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&sheet=${encodeURIComponent(sheetName)}`, label: `Export Sheet "${sheetName}"` });
    candidateUrls.push({ url: `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`, label: `Export GID 0` });
    candidateUrls.push({ url: `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`, label: `Export Principal` });

    for (const attempt of candidateUrls) {
      try {
        const res = await fetch(attempt.url, { cache: 'no-store' });
        if (res.ok) {
          const csvText = await res.text();
          if (!isHtmlResponse(csvText)) {
            const records = parseCsvToSimCards(csvText);
            if (records.length > 0) {
              return { records, source: `Google Sheets (SIM: "${sheetName}")` };
            }
          }
        }
      } catch {
        // continue to next attempt
      }
    }

    throw new Error(
      `No se pudo sincronizar automáticamente la hoja "${sheetName}" (ID: ${sheetId}). Asegúrate de que el archivo de Google Sheets esté configurado en "Cualquiera con el enlace puede ver" (Lector) o usa Google Apps Script / CSV publicado.`
    );
  }

  // Local sample fallback
  const defaultRecords = parseCsvToSimCards(INITIAL_CSV_RAW);
  return {
    records: defaultRecords,
    source: 'Datos Locales de Respaldo (SIM)',
  };
}

// -------------------------------------------------------------
// 2. ROUTER DATA FETCHER
// -------------------------------------------------------------
export async function fetchRouterData(config: SheetSlotConfig): Promise<{ records: RouterItem[]; source: string }> {
  // A. Explicit published CSV or direct URL
  if (config.publishedCsvUrl && config.publishedCsvUrl.trim()) {
    try {
      return await fetchFromDirectUrl(
        config.publishedCsvUrl,
        parseGridToRouters,
        parseCsvToRouters,
        'URL Publicada / GAS (ROUTER)'
      );
    } catch (err: unknown) {
      if (!config.sheetIdOrUrl?.trim()) {
        const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
        throw new Error(`Fallo con URL directa Router: ${errorMsg}`);
      }
    }
  }

  // B. Google Apps Script Web App URL or direct endpoint
  if (
    isHttpUrl(config.sheetIdOrUrl) &&
    (isGasUrl(config.sheetIdOrUrl) || !config.sheetIdOrUrl.includes('docs.google.com/spreadsheets'))
  ) {
    try {
      return await fetchFromDirectUrl(
        config.sheetIdOrUrl,
        parseGridToRouters,
        parseCsvToRouters,
        'Google Apps Script (ROUTER)'
      );
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      throw new Error(`Fallo al conectar con Google Apps Script (ROUTER): ${errorMsg}`);
    }
  }

  const sheetId = extractSheetId(config.sheetIdOrUrl);
  const sheetName = config.sheetName?.trim() || 'ROUTER';
  const gid = extractGid(config.sheetIdOrUrl);

  if (sheetId) {
    // Google Sheets API v4 with Key
    if (config.apiKey && config.apiKey.trim()) {
      try {
        const ranges = [sheetName, 'ROUTERS', 'INV ROUTER', `'${sheetName}'!A1:Z`, 'A1:Z'];
        let lastApiErr = '';
        for (const r of ranges) {
          const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(r)}?key=${config.apiKey.trim()}&valueRenderOption=FORMATTED_VALUE`;
          const res = await fetch(url, { cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            if (data.values && data.values.length > 0) {
              const records = parseGridToRouters(data.values);
              if (records.length > 0) {
                return { records, source: `Google Sheets API (ROUTER: "${sheetName}")` };
              }
            }
          } else {
            const errBody = await res.json().catch(() => ({}));
            lastApiErr = errBody?.error?.message || res.statusText;
          }
        }
        throw new Error(`Google Sheets API: ${lastApiErr || 'No se pudo leer la hoja'}`);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
        throw new Error(`Error en API Google Sheets: ${errorMsg}`);
      }
    }

    // Public GViz and Export endpoints
    const candidateUrls: { url: string; label: string }[] = [];
    if (gid) candidateUrls.push({ url: `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}`, label: `GViz GID ${gid}` });
    candidateUrls.push({ url: `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`, label: `GViz Sheet "${sheetName}"` });
    candidateUrls.push({ url: `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=ROUTERS`, label: `GViz Sheet "ROUTERS"` });
    candidateUrls.push({ url: `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`, label: `GViz Principal` });
    if (gid) candidateUrls.push({ url: `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`, label: `Export GID ${gid}` });
    candidateUrls.push({ url: `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&sheet=${encodeURIComponent(sheetName)}`, label: `Export Sheet "${sheetName}"` });
    candidateUrls.push({ url: `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&sheet=ROUTERS`, label: `Export Sheet "ROUTERS"` });
    candidateUrls.push({ url: `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`, label: `Export GID 0` });
    candidateUrls.push({ url: `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`, label: `Export Principal` });

    for (const attempt of candidateUrls) {
      try {
        const res = await fetch(attempt.url, { cache: 'no-store' });
        if (res.ok) {
          const csvText = await res.text();
          if (!isHtmlResponse(csvText)) {
            const records = parseCsvToRouters(csvText);
            if (records.length > 0) {
              return { records, source: `Google Sheets (ROUTER: "${sheetName}")` };
            }
          }
        }
      } catch {
        // continue
      }
    }

    throw new Error(
      `No se pudo sincronizar automáticamente la hoja "${sheetName}" (ID: ${sheetId}). Asegúrate de que el archivo de Google Sheets esté compartido como "Cualquiera con el enlace puede ver" (Lector) o usa Google Apps Script / CSV publicado.`
    );
  }

  // Fallback to sample data
  const defaultRecords = parseCsvToRouters(INITIAL_ROUTERS_CSV_RAW);
  return {
    records: defaultRecords,
    source: 'Datos Locales de Respaldo (ROUTER)',
  };
}

// -------------------------------------------------------------
// 3. FLOTA DATA FETCHER
// -------------------------------------------------------------
export async function fetchFlotaData(config: SheetSlotConfig): Promise<{ records: FlotaItem[]; source: string }> {
  // A. Explicit published CSV or direct URL
  if (config.publishedCsvUrl && config.publishedCsvUrl.trim()) {
    try {
      return await fetchFromDirectUrl(
        config.publishedCsvUrl,
        parseGridToFlota,
        parseCsvToFlota,
        'URL Publicada / GAS (FLOTA)'
      );
    } catch (err: unknown) {
      if (!config.sheetIdOrUrl?.trim()) {
        const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
        throw new Error(`Fallo con URL directa Flota: ${errorMsg}`);
      }
    }
  }

  // B. Google Apps Script Web App URL or direct endpoint
  if (
    isHttpUrl(config.sheetIdOrUrl) &&
    (isGasUrl(config.sheetIdOrUrl) || !config.sheetIdOrUrl.includes('docs.google.com/spreadsheets'))
  ) {
    try {
      return await fetchFromDirectUrl(
        config.sheetIdOrUrl,
        parseGridToFlota,
        parseCsvToFlota,
        'Google Apps Script (FLOTA)'
      );
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      throw new Error(`Fallo al conectar con Google Apps Script (FLOTA): ${errorMsg}`);
    }
  }

  const sheetId = extractSheetId(config.sheetIdOrUrl);
  const sheetName = config.sheetName?.trim() || 'INV FLOTA';
  const gid = extractGid(config.sheetIdOrUrl);

  if (sheetId) {
    // Google Sheets API v4 with Key
    if (config.apiKey && config.apiKey.trim()) {
      try {
        const ranges = [sheetName, 'FLOTA', 'INV_FLOTA', `'${sheetName}'!A1:Z`, 'A1:Z'];
        let lastApiErr = '';
        for (const r of ranges) {
          const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(r)}?key=${config.apiKey.trim()}&valueRenderOption=FORMATTED_VALUE`;
          const res = await fetch(url, { cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            if (data.values && data.values.length > 0) {
              const records = parseGridToFlota(data.values);
              if (records.length > 0) {
                return { records, source: `Google Sheets API (FLOTA: "${sheetName}")` };
              }
            }
          } else {
            const errBody = await res.json().catch(() => ({}));
            lastApiErr = errBody?.error?.message || res.statusText;
          }
        }
        throw new Error(`Google Sheets API: ${lastApiErr || 'No se pudo leer la hoja'}`);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
        throw new Error(`Error en API Google Sheets: ${errorMsg}`);
      }
    }

    // Public GViz and Export endpoints
    const candidateUrls: { url: string; label: string }[] = [];
    if (gid) candidateUrls.push({ url: `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}`, label: `GViz GID ${gid}` });
    candidateUrls.push({ url: `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`, label: `GViz Sheet "${sheetName}"` });
    candidateUrls.push({ url: `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=FLOTA`, label: `GViz Sheet "FLOTA"` });
    candidateUrls.push({ url: `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`, label: `GViz Principal` });
    if (gid) candidateUrls.push({ url: `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`, label: `Export GID ${gid}` });
    candidateUrls.push({ url: `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&sheet=${encodeURIComponent(sheetName)}`, label: `Export Sheet "${sheetName}"` });
    candidateUrls.push({ url: `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&sheet=FLOTA`, label: `Export Sheet "FLOTA"` });
    candidateUrls.push({ url: `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`, label: `Export GID 0` });
    candidateUrls.push({ url: `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`, label: `Export Principal` });

    for (const attempt of candidateUrls) {
      try {
        const res = await fetch(attempt.url, { cache: 'no-store' });
        if (res.ok) {
          const csvText = await res.text();
          if (!isHtmlResponse(csvText)) {
            const records = parseCsvToFlota(csvText);
            if (records.length > 0) {
              return { records, source: `Google Sheets (FLOTA: "${sheetName}")` };
            }
          }
        }
      } catch {
        // continue
      }
    }

    throw new Error(
      `No se pudo sincronizar automáticamente la hoja "${sheetName}" (ID: ${sheetId}). Asegúrate de que el archivo de Google Sheets esté compartido como "Cualquiera con el enlace puede ver" (Lector) o usa Google Apps Script / CSV publicado.`
    );
  }

  // Fallback to sample data
  const defaultRecords = parseCsvToFlota(RAW_FLOTA_SAMPLE_CSV);
  return {
    records: defaultRecords,
    source: 'Datos Locales de Respaldo (FLOTA)',
  };
}

// -------------------------------------------------------------
// 4. SENSORIZEIT DATA FETCHER
// -------------------------------------------------------------
export async function fetchSensorizeitData(config: SheetSlotConfig): Promise<{ records: SensorizeitItem[]; source: string }> {
  // A. Explicit published CSV or direct URL
  if (config.publishedCsvUrl && config.publishedCsvUrl.trim()) {
    try {
      return await fetchFromDirectUrl(
        config.publishedCsvUrl,
        parseGridToSensorizeit,
        parseCsvToSensorizeit,
        'URL Publicada / GAS (SENSORIZEIT)'
      );
    } catch (err: unknown) {
      if (!config.sheetIdOrUrl?.trim()) {
        const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
        throw new Error(`Fallo con URL directa SensorizeIt: ${errorMsg}`);
      }
    }
  }

  // B. Google Apps Script Web App URL or direct endpoint
  if (
    isHttpUrl(config.sheetIdOrUrl) &&
    (isGasUrl(config.sheetIdOrUrl) || !config.sheetIdOrUrl.includes('docs.google.com/spreadsheets'))
  ) {
    try {
      return await fetchFromDirectUrl(
        config.sheetIdOrUrl,
        parseGridToSensorizeit,
        parseCsvToSensorizeit,
        'Google Apps Script (SENSORIZEIT)'
      );
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      throw new Error(`Fallo al conectar con Google Apps Script (SENSORIZEIT): ${errorMsg}`);
    }
  }

  const sheetId = extractSheetId(config.sheetIdOrUrl);
  const sheetName = config.sheetName?.trim() || 'INV SENSORIZEIT';
  const gid = extractGid(config.sheetIdOrUrl);

  if (sheetId) {
    // Google Sheets API v4 with Key
    if (config.apiKey && config.apiKey.trim()) {
      try {
        const ranges = [sheetName, 'SENSORIZEIT', 'SENSORES', 'INV_SENSORIZEIT', `'${sheetName}'!A1:Z`, 'A1:Z'];
        let lastApiErr = '';
        for (const r of ranges) {
          const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(r)}?key=${config.apiKey.trim()}&valueRenderOption=FORMATTED_VALUE`;
          const res = await fetch(url, { cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            if (data.values && data.values.length > 0) {
              const records = parseGridToSensorizeit(data.values);
              if (records.length > 0) {
                return { records, source: `Google Sheets API (SENSORIZEIT: "${sheetName}")` };
              }
            }
          } else {
            const errBody = await res.json().catch(() => ({}));
            lastApiErr = errBody?.error?.message || res.statusText;
          }
        }
        throw new Error(`Google Sheets API: ${lastApiErr || 'No se pudo leer la hoja'}`);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
        throw new Error(`Error en API Google Sheets: ${errorMsg}`);
      }
    }

    // Public GViz and Export endpoints
    const candidateUrls: { url: string; label: string }[] = [];
    if (gid) candidateUrls.push({ url: `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}`, label: `GViz GID ${gid}` });
    candidateUrls.push({ url: `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`, label: `GViz Sheet "${sheetName}"` });
    candidateUrls.push({ url: `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=SENSORIZEIT`, label: `GViz Sheet "SENSORIZEIT"` });
    candidateUrls.push({ url: `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=SENSORES`, label: `GViz Sheet "SENSORES"` });
    candidateUrls.push({ url: `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`, label: `GViz Principal` });
    if (gid) candidateUrls.push({ url: `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`, label: `Export GID ${gid}` });
    candidateUrls.push({ url: `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&sheet=${encodeURIComponent(sheetName)}`, label: `Export Sheet "${sheetName}"` });
    candidateUrls.push({ url: `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&sheet=SENSORIZEIT`, label: `Export Sheet "SENSORIZEIT"` });
    candidateUrls.push({ url: `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`, label: `Export GID 0` });
    candidateUrls.push({ url: `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`, label: `Export Principal` });

    for (const attempt of candidateUrls) {
      try {
        const res = await fetch(attempt.url, { cache: 'no-store' });
        if (res.ok) {
          const csvText = await res.text();
          if (!isHtmlResponse(csvText)) {
            const records = parseCsvToSensorizeit(csvText);
            if (records.length > 0) {
              return { records, source: `Google Sheets (SENSORIZEIT: "${sheetName}")` };
            }
          }
        }
      } catch {
        // continue
      }
    }

    throw new Error(
      `No se pudo sincronizar automáticamente la hoja "${sheetName}" (ID: ${sheetId}). Asegúrate de que el archivo de Google Sheets esté compartido como "Cualquiera con el enlace puede ver" (Lector) o usa Google Apps Script / CSV publicado.`
    );
  }

  // Fallback to sample data
  const defaultRecords = parseCsvToSensorizeit(RAW_SENSORIZEIT_SAMPLE_CSV);
  return {
    records: defaultRecords,
    source: 'Datos Locales de Respaldo (SENSORIZEIT)',
  };
}

