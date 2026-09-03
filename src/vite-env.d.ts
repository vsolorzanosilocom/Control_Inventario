/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SIM_SHEET_URL?: string;
  readonly VITE_ROUTER_SHEET_URL?: string;
  readonly VITE_FLOTA_SHEET_URL?: string;
  readonly VITE_SENSORIZEIT_SHEET_URL?: string;
  readonly VITE_GOOGLE_SHEETS_API_KEY?: string;
  readonly [key: string]: string | boolean | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
