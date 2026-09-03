export interface RawSimRecord {
  'SERIAL SIMCARD'?: string;
  'NUMERO TELEFONICO'?: string;
  'DIRECCION IP'?: string;
  'CODIGO PUK'?: string;
  'OPERADORA'?: string;
  'PROPIETARIO'?: string;
  'PROCESADOR'?: string;
  'FECHA DE ENTRADA'?: string;
  'OBSERVACION'?: string;
  'COD CLIENTE'?: string;
  'COMERCIO'?: string;
  'EQUIPO ASIGNADO'?: string;
  'ALMACEN'?: string;
  'TECNICOS'?: string;
  'STATUS'?: string;
  'SS'?: string;
  'FECHA SALIDA'?: string;
  'PERMANENCIA'?: string;
  'CARRIER'?: string;
  'ACTIVO/INACTIVO'?: string;
  'SIM STATUS'?: string;
  [key: string]: string | undefined;
}

export interface SimCardItem {
  id: string;
  serialSimcard: string;       // SERIAL SIMCARD
  numeroTelefonico: string;    // NUMERO TELEFONICO
  direccionIp: string;         // DIRECCION IP
  codigoPuk: string;           // CODIGO PUK
  operadora: string;           // OPERADORA
  propietario: string;         // PROPIETARIO
  procesador: string;          // PROCESADOR
  fechaEntrada: string;        // FECHA DE ENTRADA
  observacion: string;         // OBSERVACION
  codCliente: string;          // COD CLIENTE
  comercio: string;            // COMERCIO
  equipoAsignado: string;      // EQUIPO ASIGNADO
  almacen: string;             // ALMACEN
  tecnicos: string;            // TECNICOS
  status: string;              // STATUS
  ss: string;                  // SS
  fechaSalida: string;         // FECHA SALIDA
  permanencia: string;         // PERMANENCIA
  carrier: string;             // CARRIER
  activoInactivo: string;      // ACTIVO/INACTIVO
  simStatus: string;           // SIM STATUS
}

export interface RouterItem {
  id: string;
  serial: string;              // SERIAL
  imei: string;                // IMEI
  marca: string;               // MARCA
  modelo: string;              // MODELO
  fechaEntrada: string;        // FECHA DE ENTRADA
  observacion: string;         // OBSERVACION
  codCliente: string;          // COD CLIENTE
  comercio: string;            // COMERCIO
  simAsignada: string;         // SIM ASIGNADA
  almacen: string;             // ALMACEN
  tecnico: string;             // TECNICO
  fechaSalida: string;         // FECHA DE SALIDA
  permanencia: string;         // PERMANENCIA
  status: string;              // STATUS
  statusPago: string;          // STATUS DE PAGO
  procesador: string;          // PROCESADOR
  fechaInstalacion: string;    // FECHA DE INSTALACION
  codigo: string;              // CODIGO
  condicion: string;           // CONDICION
  status2: string;             // STATUS 2
}

export interface FlotaItem {
  id: string;
  serial: string;              // SERIAL
  imei: string;                // IMEI
  marca: string;               // MARCA
  modelo: string;              // MODELO
  fechaEntrada: string;        // FECHA DE ENTRADA
  observacion: string;         // OBSERVACION
  rifCliente: string;          // RIF CLIENTE
  comercio: string;            // COMERCIO
  simAsignada: string;         // SIM ASIGNADA
  operadora: string;           // OPERADORA
  almacen: string;             // ALMACEN
  tecnico: string;             // TECNICO
  fechaSalida: string;         // FECHA DE SALIDA
  permanencia: string;         // PERMANENCIA
  status: string;              // STATUS
  fechaInstalacion: string;    // FECHA DE INSTALACION
}

export interface SensorizeitItem {
  id: string;
  serial: string;              // Col A: SERIAL
  imei: string;                // Col B: IMEI
  devEui: string;              // Col C: DEV EUI (Oculto en modal)
  appEui: string;              // Col D: APP EUI (Oculto en modal)
  appKey: string;              // Col E: APP KEY (Oculto en modal)
  appsKey: string;             // Col F: APPSKEY (Oculto en modal)
  netsKey: string;             // Col G: NETSKEY (Oculto en modal)
  atPin: string;               // Col H: AT PIN (Oculto en modal)
  otaPin: string;              // Col I: OTA PIN (Oculto en modal)
  tipoSensor: string;          // Col J: TIPO DE SENSOR (Filtro clave)
  marca: string;               // Col K: MARCA
  modelo: string;              // Col L: MODELO (Filtro clave)
  fechaEntrada: string;        // Col M: FECHA DE ENTRADA
  observacion: string;         // Col N: OBSERVACION (Oculto en modal)
  rifCliente: string;          // Col O: RIF CLIENTE
  comercio: string;            // Col P: COMERCIO
  simAsignada: string;         // Col Q: SIM ASIGNADA
  almacen: string;             // Col R: ALMACEN (Filtro clave)
  tecnico: string;             // Col S: TECNICO
  fechaSalida: string;         // Col T: FECHA DE SALIDA (Oculto en modal)
  status: string;              // Col U: STATUS
  fechaInstalacion: string;    // Col V: FECHA DE INSTALACION
}

export type InventoryTab = 'sim' | 'router' | 'flota' | 'sensorizeit';

export interface SimFilterState {
  searchQuery: string;
  propietarios: string[];
  operadoras: string[];
  almacenes: string[];
  simStatuses: string[];
  statuses: string[];
}

export type FilterState = SimFilterState;

export interface RouterFilterState {
  searchQuery: string;
  marcas: string[];
  modelos: string[];
  almacenes: string[];
  statuses: string[];
  condiciones: string[];
  statuses2: string[];
}

export interface FlotaFilterState {
  searchQuery: string;
  marcas: string[];
  modelos: string[];
  almacenes: string[];
  statuses: string[];
  operadoras: string[];
  comercios: string[];
  tecnicos: string[];
}

export interface SensorizeitFilterState {
  searchQuery: string;
  tiposSensor: string[];
  modelos: string[];
  almacenes: string[];
  marcas: string[];
  statuses: string[];
}

export type SimPivotRowDim = 'propietario' | 'operadora' | 'almacen' | 'status' | 'simStatus';
export type SimPivotColDim = 'almacen' | 'operadora' | 'simStatus' | 'status' | 'propietario';

export type PivotRowDimension = SimPivotRowDim;
export type PivotColDimension = SimPivotColDim;

export type RouterPivotRowDim = 'marca' | 'modelo' | 'almacen' | 'status' | 'condicion' | 'status2';
export type RouterPivotColDim = 'almacen' | 'status' | 'marca' | 'modelo' | 'status2' | 'condicion';

export type FlotaPivotRowDim = 'marca' | 'modelo' | 'almacen' | 'status' | 'operadora' | 'comercio';
export type FlotaPivotColDim = 'almacen' | 'status' | 'marca' | 'modelo' | 'operadora';

export type SensorizeitPivotRowDim = 'tipoSensor' | 'modelo' | 'almacen' | 'marca' | 'status' | 'comercio';
export type SensorizeitPivotColDim = 'almacen' | 'status' | 'tipoSensor' | 'modelo' | 'marca';

export interface GenericDrillDownContext {
  module: 'sim' | 'router' | 'flota' | 'sensorizeit';
  title: string;
  subtitle?: string;
  filterDescription: string;
  simRecords?: SimCardItem[];
  routerRecords?: RouterItem[];
  flotaRecords?: FlotaItem[];
  sensorizeitRecords?: SensorizeitItem[];
  appliedFilterTag?: string;
}

export type DrillDownContext = GenericDrillDownContext;

export interface SheetSlotConfig {
  sheetIdOrUrl: string;
  sheetName: string;
  publishedCsvUrl: string;
  apiKey: string;
  lastSyncTime?: Date | string | null;
  syncStatus?: 'idle' | 'syncing' | 'success' | 'error';
  errorMessage?: string | null;
}

export interface MultiSheetMasterConfig {
  autoRefreshIntervalSeconds: number;
  sim: SheetSlotConfig;
  router: SheetSlotConfig;
  flota: SheetSlotConfig;
  sensorizeit: SheetSlotConfig;
  otros: SheetSlotConfig;
}

export interface GoogleSheetsConfig {
  sheetIdOrUrl: string;
  sheetName: string;
  apiKey: string;
  publishedCsvUrl: string;
  usePublishedCsv: boolean;
  autoRefreshIntervalSeconds: number;
  lastSyncTime: Date | null;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  errorMessage: string | null;
  mode: 'sample' | 'live' | 'custom_csv';
}
