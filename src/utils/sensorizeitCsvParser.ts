import Papa from 'papaparse';
import { SensorizeitItem } from '../types';

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

interface SensorizeitColumnIndices {
  idxSerial: number;
  idxImei: number;
  idxDevEui: number;
  idxAppEui: number;
  idxAppKey: number;
  idxAppsKey: number;
  idxNetsKey: number;
  idxAtPin: number;
  idxOtaPin: number;
  idxTipoSensor: number;
  idxMarca: number;
  idxModelo: number;
  idxFechaEntrada: number;
  idxObservacion: number;
  idxRifCliente: number;
  idxComercio: number;
  idxSimAsignada: number;
  idxAlmacen: number;
  idxTecnico: number;
  idxFechaSalida: number;
  idxStatus: number;
  idxFechaInstalacion: number;
}

function findSensorizeitColumnIndices(headers: string[]): SensorizeitColumnIndices {
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
    idxDevEui: findIdx(['DEV EUI', 'DEVEUI', 'DEV_EUI'], 2),
    idxAppEui: findIdx(['APP EUI', 'APPEUI', 'APP_EUI', 'JOIN EUI', 'JOINEUI'], 3),
    idxAppKey: findIdx(['APP KEY', 'APPKEY', 'APP_KEY'], 4),
    idxAppsKey: findIdx(['APPSKEY', 'APPS KEY', 'APPS_KEY', 'APP SKEY'], 5),
    idxNetsKey: findIdx(['NETSKEY', 'NETS KEY', 'NETS_KEY', 'NWKSKEY', 'NWK SKEY'], 6),
    idxAtPin: findIdx(['AT PIN', 'ATPIN', 'AT_PIN'], 7),
    idxOtaPin: findIdx(['OTA PIN', 'OTAPIN', 'OTA_PIN'], 8),
    idxTipoSensor: findIdx(['TIPO DE SENSOR', 'TIPO SENSOR', 'TIPO DE DISPOSITIVO', 'TIPO', 'SENSOR'], 9),
    idxMarca: findIdx(['MARCA', 'FABRICANTE', 'BRAND'], 10),
    idxModelo: findIdx(['MODELO', 'MODEL'], 11),
    idxFechaEntrada: findIdx(['FECHA DE ENTRADA', 'FECHA ENTRADA', 'F. ENTRADA', 'ENTRADA', 'INGRESO'], 12),
    idxObservacion: findIdx(['OBSERVACION', 'OBSERVACIONES', 'NOTA', 'NOTAS', 'OBS'], 13),
    idxRifCliente: findIdx(['RIF CLIENTE', 'RIF', 'COD CLIENTE', 'COD_CLIENTE'], 14),
    idxComercio: findIdx(['COMERCIO', 'NOMBRE COMERCIO', 'CLIENTE', 'ESTABLECIMIENTO'], 15),
    idxSimAsignada: findIdx(['SIM ASIGNADA', 'SIM', 'LINEA', 'NUMERO SIM'], 16),
    idxAlmacen: findIdx(['ALMACEN', 'ALMACÉN', 'UBICACION', 'DEPOSITO', 'CUSTODIA'], 17),
    idxTecnico: findIdx(['TECNICO', 'TÉCNICO', 'TECNICOS', 'RESPONSABLE'], 18),
    idxFechaSalida: findIdx(['FECHA DE SALIDA', 'FECHA SALIDA', 'F. SALIDA', 'SALIDA', 'EGRESO'], 19),
    idxStatus: findIdx(['STATUS', 'ESTATUS', 'ESTADO', 'ESTADO OPERATIVO'], 20),
    idxFechaInstalacion: findIdx(['FECHA DE INSTALACION', 'FECHA INSTALACION', 'F. INSTALACION', 'INSTALACION'], 21),
  };
}

function isSensorizeitRowValid(cells: string[]): boolean {
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

export function parseGridToSensorizeit(rawRows: (string | unknown)[][]): SensorizeitItem[] {
  if (!rawRows || rawRows.length === 0) return [];

  // Identify Header Row
  let headerRowIndex = -1;
  const knownKeywords = ['SERIAL', 'IMEI', 'DEV EUI', 'TIPO DE SENSOR', 'TIPO SENSOR', 'MODELO', 'ALMACEN', 'ALMACÉN', 'STATUS', 'ESTATUS'];

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

  let indices: SensorizeitColumnIndices;
  let dataRows: (string | unknown)[][];

  if (headerRowIndex >= 0) {
    const headerCells = rawRows[headerRowIndex].map(c => normalizeText(c));
    indices = findSensorizeitColumnIndices(headerCells);
    dataRows = rawRows.slice(headerRowIndex + 1);
  } else {
    indices = findSensorizeitColumnIndices([]);
    dataRows = rawRows;
  }

  const items: SensorizeitItem[] = [];

  dataRows.forEach((row, rowIdx) => {
    if (!Array.isArray(row)) return;
    const stringRow = row.map(c => normalizeText(c));

    if (!isSensorizeitRowValid(stringRow)) return;

    const getCell = (idx: number): string => {
      if (idx < 0 || idx >= row.length) return '';
      return normalizeText(row[idx]);
    };

    const rawSerial = getCell(indices.idxSerial);
    const rawImei = getCell(indices.idxImei);
    const rawDevEui = getCell(indices.idxDevEui);
    const rawTipoSensor = getCell(indices.idxTipoSensor);
    const rawModelo = getCell(indices.idxModelo);
    const rawAlmacen = getCell(indices.idxAlmacen);
    const rawComercio = getCell(indices.idxComercio);
    const rawStatus = getCell(indices.idxStatus);

    // Skip if row has no identifying information at all
    if (!rawSerial && !rawImei && !rawDevEui && !rawTipoSensor && !rawModelo && !rawAlmacen && !rawComercio && !rawStatus) {
      return;
    }

    // Skip header repetitions
    if (rawSerial.toUpperCase() === 'SERIAL' && (rawTipoSensor.toUpperCase().includes('TIPO') || rawModelo.toUpperCase() === 'MODELO')) {
      return;
    }

    const serial = rawSerial || rawDevEui || rawImei || `SENSOR-${rowIdx + 1}`;

    items.push({
      id: `sensor-row-${rowIdx + 1}-${serial}`,
      serial,
      imei: rawImei || '-',
      devEui: rawDevEui,
      appEui: getCell(indices.idxAppEui),
      appKey: getCell(indices.idxAppKey),
      appsKey: getCell(indices.idxAppsKey),
      netsKey: getCell(indices.idxNetsKey),
      atPin: getCell(indices.idxAtPin),
      otaPin: getCell(indices.idxOtaPin),
      tipoSensor: normalizeDimension(rawTipoSensor, 'SENSOR GENERICO'),
      marca: normalizeDimension(getCell(indices.idxMarca), 'SIN MARCA'),
      modelo: normalizeDimension(rawModelo, 'DESCONOCIDO'),
      fechaEntrada: getCell(indices.idxFechaEntrada),
      observacion: getCell(indices.idxObservacion),
      rifCliente: getCell(indices.idxRifCliente),
      comercio: rawComercio || 'SIN ASIGNAR',
      simAsignada: getCell(indices.idxSimAsignada),
      almacen: normalizeDimension(rawAlmacen, 'SIN ALMACEN'),
      tecnico: getCell(indices.idxTecnico),
      fechaSalida: getCell(indices.idxFechaSalida),
      status: normalizeDimension(rawStatus, 'DISPONIBLE'),
      fechaInstalacion: getCell(indices.idxFechaInstalacion),
    });
  });

  return items;
}

export function parseCsvToSensorizeit(csvText: string): SensorizeitItem[] {
  if (!csvText || !csvText.trim()) return [];

  const parsed = Papa.parse<(string | unknown)[]>(csvText, {
    header: false,
    skipEmptyLines: false,
  });

  return parseGridToSensorizeit(parsed.data);
}
