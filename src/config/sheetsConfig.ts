import { MultiSheetMasterConfig, SheetSlotConfig, InventoryTab } from '../types';

/**
 * CONFIGURACIÓN CENTRALIZADA DE BASES DE DATOS (Google Sheets & Google Apps Script)
 * =================================================================================
 * 
 * Esta configuración permite que la aplicación cargue automáticamente las URLs de las bases de datos
 * para TODOS los usuarios que abran la aplicación en Vercel (o en cualquier dispositivo), sin
 * necesidad de tener que pegar las URLs manualmente en cada navegador.
 * 
 * Puedes configurar tus URLs de 2 formas:
 * 
 * OPCIÓN 1: En Vercel (Recomendado sin tocar código):
 * Configura estas Variables de Entorno en el panel de Vercel (Project Settings -> Environment Variables):
 * - VITE_SIM_SHEET_URL
 * - VITE_ROUTER_SHEET_URL
 * - VITE_FLOTA_SHEET_URL
 * - VITE_SENSORIZEIT_SHEET_URL
 * - VITE_GOOGLE_SHEETS_API_KEY (opcional)
 * 
 * OPCIÓN 2: Directamente en este archivo:
 * Puedes pegar los enlaces de Google Sheets o Google Apps Script (GAS) en el objeto PRECONFIGURED_SHEETS abajo.
 */

// 1. Detección de variables de entorno Vite (inyectadas automáticamente en Vercel)
const ENV_SIM_URL = (import.meta.env.VITE_SIM_SHEET_URL || '').trim();
const ENV_ROUTER_URL = (import.meta.env.VITE_ROUTER_SHEET_URL || '').trim();
const ENV_FLOTA_URL = (import.meta.env.VITE_FLOTA_SHEET_URL || '').trim();
const ENV_SENSORIZEIT_URL = (import.meta.env.VITE_SENSORIZEIT_SHEET_URL || '').trim();
const ENV_API_KEY = (import.meta.env.VITE_GOOGLE_SHEETS_API_KEY || '').trim();

// 2. URLs predeterminadas globales en el código.
// Si pegas tus URLs de Google Apps Script (GAS) o Google Sheets aquí, cualquier usuario que abra la app
// en Vercel las tendrá cargadas y sincronizadas por defecto.
export const PRECONFIGURED_SHEETS: Record<InventoryTab | 'otros', Partial<SheetSlotConfig>> = {
  sim: {
    sheetIdOrUrl: ENV_SIM_URL || '',
    sheetName: 'SIM',
    publishedCsvUrl: '',
    apiKey: ENV_API_KEY,
  },
  router: {
    sheetIdOrUrl: ENV_ROUTER_URL || '',
    sheetName: 'ROUTER',
    publishedCsvUrl: '',
    apiKey: ENV_API_KEY,
  },
  flota: {
    sheetIdOrUrl: ENV_FLOTA_URL || '',
    sheetName: 'INV FLOTA',
    publishedCsvUrl: '',
    apiKey: ENV_API_KEY,
  },
  sensorizeit: {
    sheetIdOrUrl: ENV_SENSORIZEIT_URL || '',
    sheetName: 'INV SENSORIZEIT',
    publishedCsvUrl: '',
    apiKey: ENV_API_KEY,
  },
  otros: {
    sheetIdOrUrl: '',
    sheetName: 'OTROS',
    publishedCsvUrl: '',
    apiKey: ENV_API_KEY,
  },
};

export const DEFAULT_MASTER_CONFIG: MultiSheetMasterConfig = {
  sim: {
    sheetIdOrUrl: PRECONFIGURED_SHEETS.sim.sheetIdOrUrl || '',
    sheetName: PRECONFIGURED_SHEETS.sim.sheetName || 'SIM',
    apiKey: PRECONFIGURED_SHEETS.sim.apiKey || '',
    publishedCsvUrl: PRECONFIGURED_SHEETS.sim.publishedCsvUrl || '',
    lastSyncTime: null,
    syncStatus: 'idle',
    errorMessage: null,
  },
  router: {
    sheetIdOrUrl: PRECONFIGURED_SHEETS.router.sheetIdOrUrl || '',
    sheetName: PRECONFIGURED_SHEETS.router.sheetName || 'ROUTER',
    apiKey: PRECONFIGURED_SHEETS.router.apiKey || '',
    publishedCsvUrl: PRECONFIGURED_SHEETS.router.publishedCsvUrl || '',
    lastSyncTime: null,
    syncStatus: 'idle',
    errorMessage: null,
  },
  flota: {
    sheetIdOrUrl: PRECONFIGURED_SHEETS.flota.sheetIdOrUrl || '',
    sheetName: PRECONFIGURED_SHEETS.flota.sheetName || 'INV FLOTA',
    apiKey: PRECONFIGURED_SHEETS.flota.apiKey || '',
    publishedCsvUrl: PRECONFIGURED_SHEETS.flota.publishedCsvUrl || '',
    lastSyncTime: null,
    syncStatus: 'idle',
    errorMessage: null,
  },
  sensorizeit: {
    sheetIdOrUrl: PRECONFIGURED_SHEETS.sensorizeit.sheetIdOrUrl || '',
    sheetName: PRECONFIGURED_SHEETS.sensorizeit.sheetName || 'INV SENSORIZEIT',
    apiKey: PRECONFIGURED_SHEETS.sensorizeit.apiKey || '',
    publishedCsvUrl: PRECONFIGURED_SHEETS.sensorizeit.publishedCsvUrl || '',
    lastSyncTime: null,
    syncStatus: 'idle',
    errorMessage: null,
  },
  otros: {
    sheetIdOrUrl: PRECONFIGURED_SHEETS.otros.sheetIdOrUrl || '',
    sheetName: PRECONFIGURED_SHEETS.otros.sheetName || 'OTROS',
    apiKey: PRECONFIGURED_SHEETS.otros.apiKey || '',
    publishedCsvUrl: PRECONFIGURED_SHEETS.otros.publishedCsvUrl || '',
    lastSyncTime: null,
    syncStatus: 'idle',
    errorMessage: null,
  },
  autoRefreshIntervalSeconds: 0,
};

export const STORAGE_KEY_MASTER_CONFIG = 'silocom_inventory_master_config_v5';

/**
 * Carga la configuración inicial combinando la configuración global del servidor/código
 * con cualquier preferencia que el usuario haya guardado en su navegador.
 */
export function getInitialMasterConfig(): MultiSheetMasterConfig {
  try {
    const savedRaw = localStorage.getItem(STORAGE_KEY_MASTER_CONFIG);
    if (!savedRaw) {
      // Si el usuario es nuevo (o visita Vercel por primera vez), usamos la configuración global preconfigurada
      return { ...DEFAULT_MASTER_CONFIG };
    }

    const parsed = JSON.parse(savedRaw);
    const tabs: (InventoryTab | 'otros')[] = ['sim', 'router', 'flota', 'sensorizeit', 'otros'];

    const merged: MultiSheetMasterConfig = {
      autoRefreshIntervalSeconds: parsed.autoRefreshIntervalSeconds ?? DEFAULT_MASTER_CONFIG.autoRefreshIntervalSeconds,
      sim: { ...DEFAULT_MASTER_CONFIG.sim },
      router: { ...DEFAULT_MASTER_CONFIG.router },
      flota: { ...DEFAULT_MASTER_CONFIG.flota },
      sensorizeit: { ...DEFAULT_MASTER_CONFIG.sensorizeit },
      otros: { ...DEFAULT_MASTER_CONFIG.otros },
    };

    for (const t of tabs) {
      if (parsed[t]) {
        merged[t] = {
          ...DEFAULT_MASTER_CONFIG[t],
          ...parsed[t],
          // Si el slot en localStorage está vacío pero existe una URL global predeterminada, usamos la global
          sheetIdOrUrl: parsed[t].sheetIdOrUrl?.trim() || DEFAULT_MASTER_CONFIG[t].sheetIdOrUrl || '',
          publishedCsvUrl: parsed[t].publishedCsvUrl?.trim() || DEFAULT_MASTER_CONFIG[t].publishedCsvUrl || '',
          sheetName: parsed[t].sheetName?.trim() || DEFAULT_MASTER_CONFIG[t].sheetName || '',
          apiKey: parsed[t].apiKey?.trim() || DEFAULT_MASTER_CONFIG[t].apiKey || '',
        };
      }
    }

    return merged;
  } catch (err) {
    console.warn('Error al leer configuración de localStorage, usando configuración predeterminada:', err);
    return { ...DEFAULT_MASTER_CONFIG };
  }
}
