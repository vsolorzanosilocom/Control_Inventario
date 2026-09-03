import Papa from 'papaparse';
import { RouterItem } from '../types';

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

interface RouterColumnIndices {
  idxSerial: number;
  idxImei: number;
  idxMarca: number;
  idxModelo: number;
  idxFechaEntrada: number;
  idxObservacion: number;
  idxCodCliente: number;
  idxComercio: number;
  idxSimAsignada: number;
  idxAlmacen: number;
  idxTecnico: number;
  idxFechaSalida: number;
  idxPermanencia: number;
  idxStatus: number;
  idxStatusPago: number;
  idxProcesador: number;
  idxFechaInstalacion: number;
  idxCodigo: number;
  idxCondicion: number;
  idxStatus2: number;
}

function findRouterColumnIndices(headers: string[]): RouterColumnIndices {
  const normHeaders = headers.map(h => normalizeText(h).toUpperCase());

  const findIdx = (keywords: string[], defaultIdx: number): number => {
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
  };

  return {
    idxSerial: findIdx(['SERIAL', 'SERIAL ROUTER', 'SERIE', 'S/N'], 0),
    idxImei: findIdx(['IMEI', 'IMEI ROUTER'], 1),
    idxMarca: findIdx(['MARCA', 'FABRICANTE', 'BRAND'], 2),
    idxModelo: findIdx(['MODELO', 'MODEL'], 3),
    idxFechaEntrada: findIdx(['FECHA DE ENTRADA', 'FECHA ENTRADA', 'F. ENTRADA', 'ENTRADA', 'INGRESO'], 4),
    idxObservacion: findIdx(['OBSERVACION', 'OBSERVACIONES', 'NOTA', 'NOTAS', 'OBS'], 5),
    idxCodCliente: findIdx(['COD CLIENTE', 'COD_CLIENTE', 'CODIGO CLIENTE', 'RIF CLIENTE', 'RIF'], 6),
    idxComercio: findIdx(['COMERCIO', 'NOMBRE COMERCIO', 'CLIENTE', 'ESTABLECIMIENTO'], 7),
    idxSimAsignada: findIdx(['SIM ASIGNADA', 'SIM', 'LINEA', 'NUMERO SIM', 'SIMCARD'], 8),
    idxAlmacen: findIdx(['ALMACEN', 'ALMACÉN', 'UBICACION', 'DEPOSITO', 'CUSTODIA'], 9),
    idxTecnico: findIdx(['TECNICO', 'TÉCNICO', 'TECNICOS', 'RESPONSABLE'], 10),
    idxFechaSalida: findIdx(['FECHA DE SALIDA', 'FECHA SALIDA', 'F. SALIDA', 'SALIDA', 'EGRESO'], 11),
    idxPermanencia: findIdx(['PERMANENCIA', 'TIEMPO'], 12),
    idxStatus: findIdx(['STATUS', 'ESTATUS', 'ESTADO', 'STATUS 1'], 13),
    idxStatusPago: findIdx(['STATUS DE PAGO', 'STATUS PAGO', 'ESTATUS PAGO', 'PAGO'], 14),
    idxProcesador: findIdx(['PROCESADOR'], 15),
    idxFechaInstalacion: findIdx(['FECHA DE INSTALACION', 'FECHA INSTALACION', 'F. INSTALACION', 'INSTALACION'], 16),
    idxCodigo: findIdx(['CODIGO', 'CÓDIGO', 'COD'], 17),
    idxCondicion: findIdx(['CONDICION', 'CONDICIÓN', 'CONDICION FISICA', 'ESTADO FISICO'], 18),
    idxStatus2: findIdx(['STATUS 2', 'STATUS2', 'ESTATUS 2', 'ESTADO 2', 'ACTIVO/INACTIVO'], 19),
  };
}

function isRouterRowValid(cells: string[]): boolean {
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

export function parseGridToRouters(rawRows: (string | unknown)[][]): RouterItem[] {
  if (!rawRows || rawRows.length === 0) return [];

  // Identify Header Row
  let headerRowIndex = -1;
  const knownKeywords = ['SERIAL', 'IMEI', 'MARCA', 'MODELO', 'ALMACEN', 'ALMACÉN', 'STATUS', 'ESTATUS', 'COMERCIO'];

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

  let indices: RouterColumnIndices;
  let dataRows: (string | unknown)[][];

  if (headerRowIndex >= 0) {
    const headerCells = rawRows[headerRowIndex].map(c => normalizeText(c));
    indices = findRouterColumnIndices(headerCells);
    dataRows = rawRows.slice(headerRowIndex + 1);
  } else {
    indices = findRouterColumnIndices([]);
    dataRows = rawRows;
  }

  const items: RouterItem[] = [];

  dataRows.forEach((row, rowIdx) => {
    if (!Array.isArray(row)) return;
    const stringRow = row.map(c => normalizeText(c));

    if (!isRouterRowValid(stringRow)) return;

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
    const rawStatus = getCell(indices.idxStatus);

    // Skip if row has absolutely no relevant data
    if (!rawSerial && !rawImei && !rawMarca && !rawModelo && !rawAlmacen && !rawComercio && !rawStatus) {
      return;
    }

    // Skip echo headers
    if (rawSerial.toUpperCase() === 'SERIAL' && rawMarca.toUpperCase() === 'MARCA') {
      return;
    }

    const serial = rawSerial || rawImei || `ROUTER-${rowIdx + 1}`;

    items.push({
      id: `router-row-${rowIdx + 1}-${serial}`,
      serial,
      imei: rawImei || '-',
      marca: normalizeDimension(rawMarca, 'SIN MARCA'),
      modelo: normalizeDimension(rawModelo, 'DESCONOCIDO'),
      fechaEntrada: getCell(indices.idxFechaEntrada),
      observacion: getCell(indices.idxObservacion),
      codCliente: getCell(indices.idxCodCliente),
      comercio: rawComercio || 'SIN ASIGNAR',
      simAsignada: getCell(indices.idxSimAsignada),
      almacen: normalizeDimension(rawAlmacen, 'SIN ALMACEN'),
      tecnico: getCell(indices.idxTecnico),
      fechaSalida: getCell(indices.idxFechaSalida),
      permanencia: getCell(indices.idxPermanencia),
      status: normalizeDimension(rawStatus, 'DISPONIBLE'),
      statusPago: getCell(indices.idxStatusPago),
      procesador: getCell(indices.idxProcesador),
      fechaInstalacion: getCell(indices.idxFechaInstalacion),
      codigo: getCell(indices.idxCodigo),
      condicion: normalizeDimension(getCell(indices.idxCondicion), 'OPERATIVO'),
      status2: normalizeDimension(getCell(indices.idxStatus2), 'ACTIVO'),
    });
  });

  return items;
}

export function parseCsvToRouters(csvText: string): RouterItem[] {
  if (!csvText || !csvText.trim()) return [];

  const parsed = Papa.parse<(string | unknown)[]>(csvText, {
    header: false,
    skipEmptyLines: false,
  });

  return parseGridToRouters(parsed.data);
}
