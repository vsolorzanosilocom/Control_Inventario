import React, { useState } from 'react';
import {
  X,
  Check,
  FileSpreadsheet,
  RefreshCw,
  Key,
  Link as LinkIcon,
  Info,
  Upload,
  Clipboard,
  Layers,
  ShieldCheck,
  Database,
  Globe,
  Download,
  Copy,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { MultiSheetMasterConfig, SheetSlotConfig, InventoryTab } from '../types';
import { DEFAULT_MASTER_CONFIG } from '../config/sheetsConfig';
import { parseCsvToSimCards } from '../utils/csvParser';
import { parseCsvToRouters } from '../utils/routerCsvParser';
import { parseCsvToFlota } from '../utils/flotaCsvParser';
import { parseCsvToSensorizeit } from '../utils/sensorizeitCsvParser';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  masterConfig: MultiSheetMasterConfig;
  onSaveMasterConfig: (newConfig: MultiSheetMasterConfig) => void;
  onResetDefaultConfig?: () => void;
  onTestAndSyncActive: (activeSlot: InventoryTab, slotConfig: SheetSlotConfig) => Promise<void>;
  onDirectCsvLoad?: (tab: InventoryTab, csvText: string, sourceName: string) => void;
  isSyncing: boolean;
  activeInventoryTab: InventoryTab;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  masterConfig,
  onSaveMasterConfig,
  onResetDefaultConfig,
  onTestAndSyncActive,
  onDirectCsvLoad,
  isSyncing,
  activeInventoryTab,
}) => {
  const [activeSlot, setActiveSlot] = useState<keyof Omit<MultiSheetMasterConfig, 'autoRefreshIntervalSeconds'>>(activeInventoryTab);
  const [tempConfig, setTempConfig] = useState<MultiSheetMasterConfig>({ ...masterConfig });
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [pastedCsv, setPastedCsv] = useState<string>('');
  const [subTab, setSubTab] = useState<'url' | 'paste' | 'upload' | 'global'>('url');
  const [copiedEnv, setCopiedEnv] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentSlotConfig = tempConfig[activeSlot];

  const handleUpdateSlotField = (field: keyof SheetSlotConfig, value: string) => {
    setTempConfig(prev => ({
      ...prev,
      [activeSlot]: {
        ...prev[activeSlot],
        [field]: value,
      },
    }));
  };

  const handleTest = async () => {
    if (activeSlot !== 'sim' && activeSlot !== 'router' && activeSlot !== 'flota' && activeSlot !== 'sensorizeit') {
      setTestResult({ success: true, message: `Configuración guardada para ${activeSlot.toUpperCase()}.` });
      return;
    }

    setTestResult(null);
    try {
      await onTestAndSyncActive(activeSlot as InventoryTab, currentSlotConfig);
      setTestResult({ success: true, message: `¡Conexión y extracción exitosa para ${activeSlot.toUpperCase()}!` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido al sincronizar';
      setTestResult({ success: false, message: msg });
    }
  };

  const handleSaveAll = () => {
    onSaveMasterConfig(tempConfig);
    onClose();
  };

  const handleResetToDefaults = () => {
    setTempConfig({ ...DEFAULT_MASTER_CONFIG });
    if (onResetDefaultConfig) {
      onResetDefaultConfig();
    }
    setTestResult({
      success: true,
      message: 'Configuración restablecida a los valores globales del servidor / variables de entorno.',
    });
  };

  const handleExportJson = () => {
    const exportData = {
      version: '1.0',
      description: 'Configuración de URLs de Google Sheets / GAS - Silocom Inventario',
      config: tempConfig,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `silocom_sheets_config_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const parsed = JSON.parse(text);
        const imported = parsed.config || parsed;
        if (imported.sim || imported.router || imported.flota || imported.sensorizeit) {
          setTempConfig(prev => ({
            ...prev,
            ...imported,
          }));
          setTestResult({
            success: true,
            message: '¡Configuración JSON importada! Haz clic en "Guardar Todos los IDs" para aplicarla.',
          });
        } else {
          setTestResult({ success: false, message: 'El archivo JSON no tiene un formato válido de configuración.' });
        }
      } catch {
        setTestResult({ success: false, message: 'No se pudo leer el archivo JSON seleccionado.' });
      }
    };
    reader.readAsText(file);
  };

  const handleCopyEnvVariables = () => {
    const lines = [
      `# Variables de Entorno para Vercel / Despliegue Global`,
      `VITE_SIM_SHEET_URL="${tempConfig.sim.sheetIdOrUrl || tempConfig.sim.publishedCsvUrl || ''}"`,
      `VITE_ROUTER_SHEET_URL="${tempConfig.router.sheetIdOrUrl || tempConfig.router.publishedCsvUrl || ''}"`,
      `VITE_FLOTA_SHEET_URL="${tempConfig.flota.sheetIdOrUrl || tempConfig.flota.publishedCsvUrl || ''}"`,
      `VITE_SENSORIZEIT_SHEET_URL="${tempConfig.sensorizeit.sheetIdOrUrl || tempConfig.sensorizeit.publishedCsvUrl || ''}"`,
    ].join('\n');

    navigator.clipboard.writeText(lines);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 3000);
  };

  const handleApplyPasted = () => {
    if (!pastedCsv.trim()) {
      setTestResult({ success: false, message: 'Por favor pega el contenido CSV antes de aplicar.' });
      return;
    }

    try {
      if (activeSlot === 'sim') {
        const records = parseCsvToSimCards(pastedCsv);
        if (records.length === 0) {
          setTestResult({ success: false, message: 'No se encontraron registros válidos de SIM.' });
          return;
        }
        if (onDirectCsvLoad) onDirectCsvLoad('sim', pastedCsv, `Datos Pegados (${records.length} SIMs)`);
      } else if (activeSlot === 'router') {
        const records = parseCsvToRouters(pastedCsv);
        if (records.length === 0) {
          setTestResult({ success: false, message: 'No se encontraron registros válidos de ROUTER.' });
          return;
        }
        if (onDirectCsvLoad) onDirectCsvLoad('router', pastedCsv, `Datos Pegados (${records.length} Routers)`);
      } else if (activeSlot === 'flota') {
        const records = parseCsvToFlota(pastedCsv);
        if (records.length === 0) {
          setTestResult({ success: false, message: 'No se encontraron registros válidos de FLOTA.' });
          return;
        }
        if (onDirectCsvLoad) onDirectCsvLoad('flota', pastedCsv, `Datos Pegados (${records.length} Flota)`);
      } else if (activeSlot === 'sensorizeit') {
        const records = parseCsvToSensorizeit(pastedCsv);
        if (records.length === 0) {
          setTestResult({ success: false, message: 'No se encontraron registros válidos de SENSORIZEIT.' });
          return;
        }
        if (onDirectCsvLoad) onDirectCsvLoad('sensorizeit', pastedCsv, `Datos Pegados (${records.length} SensorizeIt)`);
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error procesando texto';
      setTestResult({ success: false, message: msg });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        try {
          if (activeSlot === 'sim') {
            const records = parseCsvToSimCards(content);
            if (onDirectCsvLoad) onDirectCsvLoad('sim', content, `Archivo: ${file.name} (${records.length} SIMs)`);
          } else if (activeSlot === 'router') {
            const records = parseCsvToRouters(content);
            if (onDirectCsvLoad) onDirectCsvLoad('router', content, `Archivo: ${file.name} (${records.length} Routers)`);
          } else if (activeSlot === 'flota') {
            const records = parseCsvToFlota(content);
            if (onDirectCsvLoad) onDirectCsvLoad('flota', content, `Archivo: ${file.name} (${records.length} Flota)`);
          } else if (activeSlot === 'sensorizeit') {
            const records = parseCsvToSensorizeit(content);
            if (onDirectCsvLoad) onDirectCsvLoad('sensorizeit', content, `Archivo: ${file.name} (${records.length} SensorizeIt)`);
          }
          onClose();
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Error leyendo archivo';
          setTestResult({ success: false, message: msg });
        }
      }
    };
    reader.readAsText(file);
  };

  const slotItems = [
    { key: 'sim' as const, label: 'SIM', sheetDefault: 'SIM', isReady: true },
    { key: 'router' as const, label: 'ROUTER', sheetDefault: 'ROUTER', isReady: true },
    { key: 'flota' as const, label: 'FLOTA', sheetDefault: 'INV FLOTA', isReady: true },
    { key: 'sensorizeit' as const, label: 'SENSORIZEIT', sheetDefault: 'INV SENSORIZEIT', isReady: true },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-700 rounded-xl text-white shadow-sm">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Gestor de Conexiones Google Sheets (4 Inventarios)
              </h3>
              <p className="text-xs text-slate-300">
                Pega y guarda permanentemente los IDs y enlaces de cada archivo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Slots Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-100 overflow-x-auto px-4 pt-2 gap-1 text-xs">
          {slotItems.map((slot) => {
            const isSelected = activeSlot === slot.key;
            const hasId = Boolean(tempConfig[slot.key]?.sheetIdOrUrl?.trim());
            return (
              <button
                key={slot.key}
                type="button"
                onClick={() => {
                  setActiveSlot(slot.key);
                  setTestResult(null);
                }}
                className={`py-2 px-3.5 rounded-t-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  isSelected
                    ? 'bg-white text-rose-700 border-t-2 border-rose-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <span>{slot.label}</span>
                {hasId ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="ID configurado" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-300" title="Sin configurar" />
                )}
              </button>
            );
          })}
        </div>

        {/* Subtab (URL vs Paste vs Upload vs Global Vercel) */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 gap-4 text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => setSubTab('url')}
            className={`pb-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              subTab === 'url'
                ? 'border-rose-700 text-rose-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            Enlace GAS / Google Sheets
          </button>
          <button
            type="button"
            onClick={() => setSubTab('paste')}
            className={`pb-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              subTab === 'paste'
                ? 'border-rose-700 text-rose-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clipboard className="w-3.5 h-3.5" />
            Pegar CSV Directo
          </button>
          <button
            type="button"
            onClick={() => setSubTab('upload')}
            className={`pb-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              subTab === 'upload'
                ? 'border-rose-700 text-rose-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Cargar Archivo
          </button>
          <button
            type="button"
            onClick={() => setSubTab('global')}
            className={`pb-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              subTab === 'global'
                ? 'border-rose-700 text-rose-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Persistencia Global (Vercel)
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs overflow-y-auto max-h-[65vh]">
          
          {subTab === 'url' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex gap-3 text-slate-600">
                <Info className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-slate-800">
                    Configuración para {activeSlot.toUpperCase()}
                  </p>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    Pega aquí la <strong>URL de Google Apps Script (GAS)</strong> (<code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 text-[10px]">https://script.google.com/macros/s/.../exec</code>) o el enlace de tu Google Sheet público. La app detecta el formato y procesa los datos automáticamente.
                  </p>
                </div>
              </div>

              {/* Sheet ID or GAS URL input */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-slate-500" />
                    URL de Google Apps Script (GAS) o Enlace Google Sheets:
                  </span>
                  {currentSlotConfig.sheetIdOrUrl && (
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Configurado
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={currentSlotConfig.sheetIdOrUrl}
                  onChange={(e) => handleUpdateSlotField('sheetIdOrUrl', e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec o https://docs.google.com/spreadsheets/d/..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Tab Name */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nombre de la Hoja (si usas Google Sheets estándar):
                  </label>
                  <input
                    type="text"
                    value={currentSlotConfig.sheetName}
                    onChange={(e) => handleUpdateSlotField('sheetName', e.target.value)}
                    placeholder={activeSlot === 'flota' ? 'INV FLOTA' : activeSlot.toUpperCase()}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white text-xs"
                  />
                </div>

                {/* API Key (Optional) */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Key className="w-3 h-3 text-amber-500" />
                    Google API Key (Opcional):
                  </label>
                  <input
                    type="password"
                    value={currentSlotConfig.apiKey}
                    onChange={(e) => handleUpdateSlotField('apiKey', e.target.value)}
                    placeholder="AIzaSy... (Opcional)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white text-xs"
                  />
                </div>
              </div>

              {/* Published CSV link (Alternative direct method) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  URL de CSV Publicado en la Web (Opcional):
                </label>
                <input
                  type="text"
                  value={currentSlotConfig.publishedCsvUrl}
                  onChange={(e) => handleUpdateSlotField('publishedCsvUrl', e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/e/.../pub?output=csv"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white text-xs"
                />
              </div>

              {/* Auto refresh global timer */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-rose-700" />
                  Auto-Sincronización Periódica:
                </label>
                <select
                  value={tempConfig.autoRefreshIntervalSeconds}
                  onChange={(e) => setTempConfig({ ...tempConfig, autoRefreshIntervalSeconds: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white text-xs"
                >
                  <option value={0}>Manual (Al presionar botón Actualizar)</option>
                  <option value={30}>Cada 30 segundos</option>
                  <option value={60}>Cada 1 minuto</option>
                  <option value={300}>Cada 5 minutos</option>
                </select>
              </div>
            </div>
          )}

          {subTab === 'paste' && (
            <div className="space-y-3">
              <label className="block font-bold text-slate-700 mb-1">
                Pega el contenido copiado de la hoja {activeSlot.toUpperCase()}:
              </label>
              <textarea
                rows={8}
                value={pastedCsv}
                onChange={(e) => setPastedCsv(e.target.value)}
                placeholder={`Pega aquí las filas de ${activeSlot.toUpperCase()}...`}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg font-mono text-[11px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
              />
              <button
                type="button"
                onClick={handleApplyPasted}
                className="w-full py-2 bg-rose-700 hover:bg-rose-600 text-white font-bold rounded-lg transition-colors cursor-pointer"
              >
                Cargar Registros Pegados ({activeSlot.toUpperCase()})
              </button>
            </div>
          )}

          {subTab === 'upload' && (
            <div className="space-y-3">
              <label className="block font-bold text-slate-700 mb-1">
                Carga de archivo para {activeSlot.toUpperCase()}:
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-rose-500 transition-colors bg-slate-50">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="font-semibold text-slate-700 mb-1">
                  Haz clic o arrastra aquí tu archivo CSV
                </p>
                <p className="text-[11px] text-slate-400 mb-3">
                  Exportación de {activeSlot.toUpperCase()}
                </p>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-rose-700 file:text-white hover:file:bg-rose-600 file:cursor-pointer cursor-pointer"
                />
              </div>
            </div>
          )}

          {subTab === 'global' && (
            <div className="space-y-4">
              <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold">
                  <Globe className="w-4 h-4" />
                  <span>¿Cómo mantener las URLs guardadas para cualquier usuario?</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Cuando una persona abre la aplicación por primera vez en su dispositivo, el navegador no tiene su <code className="text-rose-300">localStorage</code>. Para que <strong>cualquier usuario</strong> vea todo conectado de inmediato sin tener que pegar nada, tienes 2 opciones sencillas:
                </p>
              </div>

              {/* Option 1: Vercel Environment Variables */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                    Opción 1 (Recomendada en Vercel): Variables de Entorno
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyEnvVariables}
                    className="flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-md shadow-xs transition-colors cursor-pointer text-[11px]"
                  >
                    {copiedEnv ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600">¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copiar Variables para Vercel</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  En Vercel ve a <strong>Project Settings &gt; Environment Variables</strong> y agrega las variables con los enlaces actuales:
                </p>
                <div className="p-2.5 bg-slate-900 rounded-lg font-mono text-[11px] text-slate-200 space-y-1 overflow-x-auto">
                  <p><span className="text-rose-400">VITE_SIM_SHEET_URL</span>={tempConfig.sim.sheetIdOrUrl || '""'}</p>
                  <p><span className="text-rose-400">VITE_ROUTER_SHEET_URL</span>={tempConfig.router.sheetIdOrUrl || '""'}</p>
                  <p><span className="text-rose-400">VITE_FLOTA_SHEET_URL</span>={tempConfig.flota.sheetIdOrUrl || '""'}</p>
                  <p><span className="text-rose-400">VITE_SENSORIZEIT_SHEET_URL</span>={tempConfig.sensorizeit.sheetIdOrUrl || '""'}</p>
                </div>
              </div>

              {/* Option 2: Preconfigured code file */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                  Opción 2: Fijar URLs en el archivo de código
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  También puedes dejar tus URLs guardadas directamente en el archivo <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-900 font-mono text-[10px]">src/config/sheetsConfig.ts</code> dentro del objeto <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-900 font-mono text-[10px]">PRECONFIGURED_SHEETS</code>. Al hacer commit y push a GitHub, Vercel compila la aplicación con las URLs fijadas para siempre.
                </p>
              </div>

              {/* Import / Export JSON tools */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  Exportar Respaldo (.json)
                </button>

                <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer">
                  <Upload className="w-3.5 h-3.5 text-slate-600" />
                  Importar Respaldo (.json)
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJson}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleResetToDefaults}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer ml-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  Restaurar Predeterminados
                </button>
              </div>
            </div>
          )}

          {/* Test connection feedback */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <p className="font-semibold">{testResult.message}</p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handleTest}
            disabled={isSyncing}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Probando...' : `Probar ${activeSlot.toUpperCase()}`}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-4 py-1.5 bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Guardar Todos los IDs
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
