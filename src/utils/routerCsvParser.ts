import Papa from 'papaparse';
import { RouterItem } from '../types';
import { normalizeText, normalizeDimension, isRowValidData, findColumnIndex } from './csvUtils';

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

  return {
    idxSerial: findColumnIndex(['SERIAL', 'SERIAL ROUTER', 'SERIE', 'S/N'], 0, normHeaders),
    idxImei: findColumnIndex(['IMEI', 'IMEI ROUTER'], 1, normHeaders),
    idxMarca: findColumnIndex(['MARCA', 'FABRICANTE', 'BRAND'], 2, normHeaders),
    idxModelo: findColumnIndex(['MODELO', 'MODEL'], 3, normHeaders),
    idxFechaEntrada: findColumnIndex(['FECHA DE ENTRADA', 'FECHA ENTRADA', 'F. ENTRADA', 'ENTRADA', 'INGRESO'], 4, normHeaders),
    idxObservacion: findColumnIndex(['OBSERVACION', 'OBSERVACIONES', 'NOTA', 'NOTAS', 'OBS'], 5, normHeaders),
    idxCodCliente: findColumnIndex(['COD CLIENTE', 'COD_CLIENTE', 'CODIGO CLIENTE', 'RIF CLIENTE', 'RIF'], 6, normHeaders),
    idxComercio: findColumnIndex(['COMERCIO', 'NOMBRE COMERCIO', 'CLIENTE', 'ESTABLECIMIENTO'], 7, normHeaders),
    idxSimAsignada: findColumnIndex(['SIM ASIGNADA', 'SIM', 'LINEA', 'NUMERO SIM', 'SIMCARD'], 8, normHeaders),
    idxAlmacen: findColumnIndex(['ALMACEN', 'ALMACÉN', 'UBICACION', 'DEPOSITO', 'CUSTODIA'], 9, normHeaders),
    idxTecnico: findColumnIndex(['TECNICO', 'TÉCNICO', 'TECNICOS', 'RESPONSABLE'], 10, normHeaders),
    idxFechaSalida: findColumnIndex(['FECHA DE SALIDA', 'FECHA SALIDA', 'F. SALIDA', 'SALIDA', 'EGRESO'], 11, normHeaders),
    idxPermanencia: findColumnIndex(['PERMANENCIA', 'TIEMPO'], 12, normHeaders),
    idxStatus: findColumnIndex(['STATUS', 'ESTATUS', 'ESTADO', 'STATUS 1'], 13, normHeaders),
    idxStatusPago: findColumnIndex(['STATUS DE PAGO', 'STATUS PAGO', 'ESTATUS PAGO', 'PAGO'], 14, normHeaders),
    idxProcesador: findColumnIndex(['PROCESADOR'], 15, normHeaders),
    idxFechaInstalacion: findColumnIndex(['FECHA DE INSTALACION', 'FECHA INSTALACION', 'F. INSTALACION', 'INSTALACION'], 16, normHeaders),
    idxCodigo: findColumnIndex(['CODIGO', 'CÓDIGO', 'COD'], 17, normHeaders),
    idxCondicion: findColumnIndex(['CONDICION', 'CONDICIÓN', 'CONDICION FISICA', 'ESTADO FISICO'], 18, normHeaders),
    idxStatus2: findColumnIndex(['STATUS 2', 'STATUS2', 'ESTATUS 2', 'ESTADO 2', 'ACTIVO/INACTIVO'], 19, normHeaders),
  };
}

function isRouterRowValid(cells: string[]): boolean {
  return isRowValidData(cells);
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
