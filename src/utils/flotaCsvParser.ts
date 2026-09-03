import Papa from 'papaparse';
import { FlotaItem } from '../types';

export function normalizeText(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeDimension(value: unknown, fallback: string): string {
  const clean = normalizeText(value);
  if (!clean || clean === '-' || clean === 'N/A' || clean === 'S/N' || clean === 'SIN INFORMACION' || clean === 'NONE') {
    return fallback;
  }
  return clean.toUpperCase();
}

interface FlotaColumnIndices {
  idxSerial: number;
  idxImei: number;
  idxMarca: number;
  idxModelo: number;
  idxFechaEntrada: number;
  idxObservacion: number;
  idxRifCliente: number;
  idxComercio: number;
  idxSimAsignada: number;
  idxOperadora: number;
  idxAlmacen: number;
  idxTecnico: number;
  idxFechaSalida: number;
  idxPermanencia: number;
  idxStatus: number;
  idxFechaInstalacion: number;
}

function findFlotaColumnIndices(headers: string[]): FlotaColumnIndices {
  const normHeaders = headers.map(h => normalizeText(h).toUpperCase());

  const findIdx = (keywords: string[], defaultIdx: number): number => {
    for (const kw of keywords) {
      const idx = normHeaders.indexOf(kw);
      if (idx !== -1) return idx;
    }
    for (const kw of keywords) {
      const idx = normHeaders.findIndex(h => h.includes(kw));
      if (idx !== -1) return idx;
    }
    return defaultIdx;
  };

  return {
    idxSerial: findIdx(['SERIAL', 'SERIE', 'S/N'], 0),
    idxImei: findIdx(['IMEI'], 1),
    idxMarca: findIdx(['MARCA', 'FABRICANTE', 'BRAND'], 2),
    idxModelo: findIdx(['MODELO', 'MODEL'], 3),
    idxFechaEntrada: findIdx(['FECHA DE ENTRADA', 'FECHA ENTRADA', 'F. ENTRADA', 'ENTRADA', 'INGRESO'], 4),
    idxObservacion: findIdx(['OBSERVACION', 'OBSERVACIONES', 'NOTA', 'NOTAS', 'OBS'], 5),
    idxRifCliente: findIdx(['RIF CLIENTE', 'RIF', 'COD CLIENTE', 'COD_CLIENTE', 'CODIGO CLIENTE'], 6),
    idxComercio: findIdx(['COMERCIO', 'NOMBRE COMERCIO', 'CLIENTE', 'ESTABLECIMIENTO'], 7),
    idxSimAsignada: findIdx(['SIM ASIGNADA', 'SIM', 'LINEA', 'NUMERO SIM', 'SIMCARD'], 8),
    idxOperadora: findIdx(['OPERADORA', 'OPERADOR', 'CARRIER'], 9),
    idxAlmacen: findIdx(['ALMACEN', 'ALMACÉN', 'UBICACION', 'DEPOSITO', 'CUSTODIA'], 10),
    idxTecnico: findIdx(['TECNICO', 'TÉCNICO', 'TECNICOS', 'RESPONSABLE'], 11),
    idxFechaSalida: findIdx(['FECHA DE SALIDA', 'FECHA SALIDA', 'F. SALIDA', 'SALIDA', 'EGRESO'], 12),
    idxPermanencia: findIdx(['PERMANENCIA', 'TIEMPO'], 13),
    idxStatus: findIdx(['STATUS', 'ESTATUS', 'ESTADO', 'ESTADO OPERATIVO'], 14),
    idxFechaInstalacion: findIdx(['FECHA DE INSTALACION', 'FECHA INSTALACION', 'F. INSTALACION', 'INSTALACION'], 15),
  };
}

function isFlotaRowValid(cells: string[]): boolean {
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

export function parseGridToFlota(rawRows: (string | unknown)[][]): FlotaItem[] {
  if (!rawRows || rawRows.length === 0) return [];

  // Identify Header Row
  let headerRowIndex = -1;
  const knownKeywords = ['SERIAL', 'IMEI', 'MARCA', 'MODELO', 'ALMACEN', 'ALMACÉN', 'OPERADORA', 'STATUS', 'ESTATUS', 'COMERCIO'];

  for (let r = 0; r < Math.min(rawRows.length, 15); r++) {
    const row = rawRows[r];
    if (!Array.isArray(row)) continue;
    const rowText = row.map(c => normalizeText(c).toUpperCase()).join(' ');

    let matchCount = 0;
    for (const kw of knownKeywords) {
      if (rowText.includes(kw)) matchCount++;
    }

    if (matchCount >= 2) {
      headerRowIndex = r;
      break;
    }
  }

  let indices: FlotaColumnIndices;
  let dataRows: (string | unknown)[][];

  if (headerRowIndex >= 0) {
    const headerCells = rawRows[headerRowIndex].map(c => normalizeText(c));
    indices = findFlotaColumnIndices(headerCells);
    dataRows = rawRows.slice(headerRowIndex + 1);
  } else {
    indices = findFlotaColumnIndices([]);
    dataRows = rawRows;
  }

  const items: FlotaItem[] = [];

  dataRows.forEach((row, rowIdx) => {
    if (!Array.isArray(row)) return;
    const stringRow = row.map(c => normalizeText(c));

    if (!isFlotaRowValid(stringRow)) return;

    const getCell = (idx: number): string => {
      if (idx < 0 || idx >= row.length) return '';
      return normalizeText(row[idx]);
    };

    const rawSerial = getCell(indices.idxSerial);
    const rawImei = getCell(indices.idxImei);
    const rawMarca = getCell(indices.idxMarca);
    const rawModelo = getCell(indices.idxModelo);
    const rawAlmacen = getCell(indices.idxAlmacen);
    const rawComercio = getCell(indices.idxComercio);
    const rawOperadora = getCell(indices.idxOperadora);
    const rawStatus = getCell(indices.idxStatus);

    // Skip if row is completely blank
    if (!rawSerial && !rawImei && !rawMarca && !rawModelo && !rawAlmacen && !rawComercio && !rawOperadora && !rawStatus) {
      return;
    }

    // Skip echo headers
    if (rawSerial.toUpperCase() === 'SERIAL' && rawMarca.toUpperCase() === 'MARCA') {
      return;
    }

    const serial = rawSerial || rawImei || `FLOTA-${rowIdx + 1}`;

    items.push({
      id: `flota-row-${rowIdx + 1}-${serial}`,
      serial,
      imei: rawImei || '-',
      marca: normalizeDimension(rawMarca, 'SIN MARCA'),
      modelo: normalizeDimension(rawModelo, 'DESCONOCIDO'),
      fechaEntrada: getCell(indices.idxFechaEntrada),
      observacion: getCell(indices.idxObservacion),
      rifCliente: getCell(indices.idxRifCliente),
      comercio: rawComercio || 'SIN ASIGNAR',
      simAsignada: getCell(indices.idxSimAsignada),
      operadora: normalizeDimension(rawOperadora, 'SIN OPERADORA'),
      almacen: normalizeDimension(rawAlmacen, 'SIN ALMACEN'),
      tecnico: getCell(indices.idxTecnico),
      fechaSalida: getCell(indices.idxFechaSalida),
      permanencia: getCell(indices.idxPermanencia),
      status: normalizeDimension(rawStatus, 'DISPONIBLE'),
      fechaInstalacion: getCell(indices.idxFechaInstalacion),
    });
  });

  return items;
}

export function parseCsvToFlota(csvText: string): FlotaItem[] {
  if (!csvText || !csvText.trim()) return [];

  const parsed = Papa.parse<(string | unknown)[]>(csvText, {
    header: false,
    skipEmptyLines: false,
  });

  return parseGridToFlota(parsed.data);
}

export const parseFlotaCsv = parseCsvToFlota;
