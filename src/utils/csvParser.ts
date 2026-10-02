import Papa from 'papaparse';
import { SimCardItem } from '../types';
import { normalizeText, normalizeDimension, isRowValidData, findColumnIndex } from './csvUtils';

/**
 * Flexible header locator for column variations in the "SIM" sheet.
 */
interface ColumnIndices {
  idxA: number; // SERIAL SIMCARD
  idxB: number; // NUMERO TELEFONICO
  idxC: number; // DIRECCION IP
  idxD: number; // CODIGO PUK
  idxE: number; // OPERADORA
  idxF: number; // PROPIETARIO
  idxG: number; // PROCESADOR
  idxH: number; // FECHA DE ENTRADA
  idxI: number; // OBSERVACION
  idxJ: number; // COD CLIENTE
  idxK: number; // COMERCIO
  idxL: number; // EQUIPO ASIGNADO
  idxM: number; // ALMACEN
  idxN: number; // TECNICOS
  idxO: number; // STATUS
  idxP: number; // SS
  idxQ: number; // FECHA SALIDA
  idxR: number; // PERMANENCIA
  idxS: number; // CARRIER
  idxT: number; // ACTIVO/INACTIVO
  idxU: number; // SIM STATUS
}

function findColumnIndices(headers: string[]): ColumnIndices {
  const normHeaders = headers.map(h => normalizeText(h).toUpperCase());

  return {
    idxA: findColumnIndex(['SERIAL SIMCARD', 'SERIAL SIM', 'ICCID', 'SERIAL', 'SIMCARD'], 0, normHeaders),
    idxB: findColumnIndex(['NUMERO TELEFONICO', 'NUMERO', 'TELEFONO', 'MSISDN', 'LINEA'], 1, normHeaders),
    idxC: findColumnIndex(['DIRECCION IP', 'DIRECCION_IP', 'IP'], 2, normHeaders),
    idxD: findColumnIndex(['CODIGO PUK', 'PUK', 'COD_PUK'], 3, normHeaders),
    idxE: findColumnIndex(['OPERADORA', 'OPERADOR'], 4, normHeaders),
    idxF: findColumnIndex(['PROPIETARIO', 'DUENO', 'OWNER'], 5, normHeaders),
    idxG: findColumnIndex(['PROCESADOR'], 6, normHeaders),
    idxH: findColumnIndex(['FECHA DE ENTRADA', 'FECHA ENTRADA', 'F. ENTRADA', 'F_ENTRADA', 'INGRESO'], 7, normHeaders),
    idxI: findColumnIndex(['OBSERVACION', 'OBSERVACIONES', 'NOTA', 'NOTAS'], 8, normHeaders),
    idxJ: findColumnIndex(['COD CLIENTE', 'COD_CLIENTE', 'CODIGO CLIENTE', 'CODIGO_CLIENTE', 'RIF'], 9, normHeaders),
    idxK: findColumnIndex(['COMERCIO', 'NOMBRE COMERCIO', 'ESTABLECIMIENTO', 'CLIENTE'], 10, normHeaders),
    idxL: findColumnIndex(['EQUIPO ASIGNADO', 'EQUIPO', 'TERMINAL', 'POS', 'SERIAL EQUIPO'], 11, normHeaders),
    idxM: findColumnIndex(['ALMACEN', 'UBICACION', 'DEPOSITO'], 12, normHeaders),
    idxN: findColumnIndex(['TECNICOS', 'TECNICO', 'RESPONSABLE'], 13, normHeaders),
    idxO: findColumnIndex(['STATUS', 'ESTATUS', 'ESTADO', 'ESTADO OPERATIVO'], 14, normHeaders),
    idxP: findColumnIndex(['SS', 'S/S', 'SERIAL SIM'], 15, normHeaders),
    idxQ: findColumnIndex(['FECHA SALIDA', 'FECHA DE SALIDA', 'F. SALIDA', 'F_SALIDA', 'EGRESO'], 16, normHeaders),
    idxR: findColumnIndex(['PERMANENCIA', 'TIEMPO'], 17, normHeaders),
    idxS: findColumnIndex(['CARRIER', 'TIPO'], 18, normHeaders),
    idxT: findColumnIndex(['ACTIVO/INACTIVO', 'ACTIVO_INACTIVO', 'ACTIVO / INACTIVO', 'ACTIVO'], 19, normHeaders),
    idxU: findColumnIndex(['SIM STATUS', 'SIM_STATUS', 'ESTATUS SIM', 'STATUS SIM'], 20, normHeaders),
  };
}

/**
 * Builds a SimCardItem safely from raw 2D array row, normalizing all spaces and preserving all valid records.
 */
function buildSimCardItem(
  row: (string | unknown)[],
  index: number,
  indices: ColumnIndices
): SimCardItem {
  const getCell = (colIdx: number): string => {
    if (colIdx < 0 || colIdx >= row.length) return '';
    return normalizeText(row[colIdx]);
  };

  // Extract raw column values
  const rawSerial = getCell(indices.idxA);
  const rawSs = getCell(indices.idxP);
  const rawNumero = getCell(indices.idxB);
  const rawIp = getCell(indices.idxC);

  // Serial fallback if empty in Col A
  const serialSimcard = rawSerial || rawSs || (rawNumero ? `TEL-${rawNumero}` : `S/S-${index + 1}`);

  return {
    id: `sim-row-${index + 1}-${serialSimcard}`,
    serialSimcard,                                                      // Col A
    numeroTelefonico: rawNumero,                                        // Col B
    direccionIp: rawIp,                                                 // Col C
    codigoPuk: getCell(indices.idxD),                                   // Col D
    operadora: normalizeDimension(getCell(indices.idxE), 'NO ESPECIFICADO'), // Col E
    propietario: normalizeDimension(getCell(indices.idxF), 'NO ESPECIFICADO'), // Col F
    procesador: getCell(indices.idxG),                                  // Col G
    fechaEntrada: getCell(indices.idxH),                                // Col H
    observacion: getCell(indices.idxI),                                 // Col I
    codCliente: getCell(indices.idxJ),                                  // Col J
    comercio: getCell(indices.idxK),                                    // Col K
    equipoAsignado: getCell(indices.idxL),                              // Col L
    almacen: normalizeDimension(getCell(indices.idxM), 'SIN ALMACEN'),  // Col M
    tecnicos: getCell(indices.idxN),                                    // Col N
    status: normalizeDimension(getCell(indices.idxO), 'SIN STATUS'),    // Col O
    ss: rawSs,                                                          // Col P
    fechaSalida: getCell(indices.idxQ),                                 // Col Q
    permanencia: getCell(indices.idxR),                                 // Col R
    carrier: getCell(indices.idxS),                                     // Col S
    activoInactivo: getCell(indices.idxT),                              // Col T
    simStatus: normalizeDimension(getCell(indices.idxU), 'ACTIVA'),     // Col U
  };
}

/**
 * Universal 2D Grid / CSV Parser for Google Sheets "SIM" tab.
 * Automatically scans rows to find the real header row, ignores empty/spacer lines,
 * and parses all records even if some cells are blank.
 */
export function parseGridToSimCards(rawRows: (string | unknown)[][]): SimCardItem[] {
  if (!rawRows || rawRows.length === 0) return [];

  // 1. Identify which row is the Header Row
  let headerRowIndex = -1;
  const knownKeywords = [
    'SERIAL', 'SIMCARD', 'OPERADORA', 'PROPIETARIO', 'ALMACEN',
    'NUMERO', 'DIRECCION IP', 'STATUS', 'SIM STATUS', 'COMERCIO'
  ];

  for (let r = 0; r < Math.min(rawRows.length, 15); r++) {
    const row = rawRows[r];
    if (!Array.isArray(row)) continue;
    const rowText = row.map(c => normalizeText(c).toUpperCase()).join(' ');
    
    let matchCount = 0;
    for (const kw of knownKeywords) {
      if (rowText.includes(kw)) matchCount++;
    }

    // If at least 2 known column keywords match, this is our header row
    if (matchCount >= 2) {
      headerRowIndex = r;
      break;
    }
  }

  // Column mapping configuration
  let indices: ColumnIndices;
  let dataRows: (string | unknown)[][];

  if (headerRowIndex >= 0) {
    const headerCells = rawRows[headerRowIndex].map(c => normalizeText(c));
    indices = findColumnIndices(headerCells);
    dataRows = rawRows.slice(headerRowIndex + 1);
  } else {
    // Default standard positional mapping (A=0, B=1, ... U=20)
    indices = findColumnIndices([]);
    dataRows = rawRows;
  }

  const items: SimCardItem[] = [];

  dataRows.forEach((row, rowIdx) => {
    if (!Array.isArray(row)) return;
    const stringRow = row.map(c => normalizeText(c));

    // If row contains no data at all or is a total summary row, ignore
    if (!isRowValidData(stringRow)) return;

    const item = buildSimCardItem(row, rowIdx, indices);
    items.push(item);
  });

  return items;
}

/**
 * Parses raw CSV text into SimCardItems with full whitespace tolerance.
 */
export function parseCsvToSimCards(csvText: string): SimCardItem[] {
  if (!csvText || !csvText.trim()) return [];

  // Parse raw 2D grid first to ensure total control over multi-line headers or blank lines
  const parsed = Papa.parse<(string | unknown)[]>(csvText, {
    header: false,
    skipEmptyLines: false, // We handle empty line skipping intelligently
  });

  return parseGridToSimCards(parsed.data);
}

/**
 * Parses Google Sheets API v4 2D values array into SimCardItems.
 */
export function parseGoogleSheetsApiResponse(values: (string | unknown)[][]): SimCardItem[] {
  return parseGridToSimCards(values);
}
