import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  InventoryTab,
  SimCardItem,
  RouterItem,
  FlotaItem,
  SensorizeitItem,
  FilterState,
  RouterFilterState,
  FlotaFilterState,
  SensorizeitFilterState,
  GenericDrillDownContext,
  MultiSheetMasterConfig,
  SheetSlotConfig,
} from './types';
import { fetchSimData, fetchRouterData, fetchFlotaData, fetchSensorizeitData } from './services/googleSheetsService';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { RouterFilterBar } from './components/RouterFilterBar';
import { FlotaFilterBar } from './components/FlotaFilterBar';
import { SensorizeitFilterBar } from './components/SensorizeitFilterBar';
import { KpiOverview } from './components/KpiOverview';
import { RouterKpiOverview } from './components/RouterKpiOverview';
import { FlotaKpiOverview } from './components/FlotaKpiOverview';
import { SensorizeitKpiOverview } from './components/SensorizeitKpiOverview';
import { PivotDashboard } from './components/PivotDashboard';
import { RouterPivotDashboard } from './components/RouterPivotDashboard';
import { FlotaPivotDashboard } from './components/FlotaPivotDashboard';
import { SensorizeitPivotDashboard } from './components/SensorizeitPivotDashboard';
import { DrillDownModal } from './components/DrillDownModal';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { INITIAL_CSV_RAW } from './data/sampleData';
import { INITIAL_ROUTERS_CSV_RAW } from './data/routerSampleData';
import { RAW_FLOTA_SAMPLE_CSV } from './data/flotaSampleData';
import { RAW_SENSORIZEIT_SAMPLE_CSV } from './data/sensorizeitSampleData';
import { parseCsvToSimCards } from './utils/csvParser';
import { parseCsvToRouters } from './utils/routerCsvParser';
import { parseCsvToFlota } from './utils/flotaCsvParser';
import { parseCsvToSensorizeit } from './utils/sensorizeitCsvParser';
import { Radio, Cpu, Truck, Activity, RefreshCw, AlertTriangle, Layers, Database } from 'lucide-react';
import {
  DEFAULT_MASTER_CONFIG,
  STORAGE_KEY_MASTER_CONFIG,
  getInitialMasterConfig,
} from './config/sheetsConfig';

export default function App() {
  // Tab state
  const [activeTab, setActiveTab] = useState<InventoryTab>('sim');

  // Master config for 5 sheets (merges environment variables / preconfigured defaults with localStorage)
  const [masterConfig, setMasterConfig] = useState<MultiSheetMasterConfig>(() => getInitialMasterConfig());

  // Data states
  const [simItems, setSimItems] = useState<SimCardItem[]>(() => parseCsvToSimCards(INITIAL_CSV_RAW));
  const [routerItems, setRouterItems] = useState<RouterItem[]>(() => parseCsvToRouters(INITIAL_ROUTERS_CSV_RAW));
  const [flotaItems, setFlotaItems] = useState<FlotaItem[]>(() => parseCsvToFlota(RAW_FLOTA_SAMPLE_CSV));
  const [sensorizeitItems, setSensorizeitItems] = useState<SensorizeitItem[]>(() => parseCsvToSensorizeit(RAW_SENSORIZEIT_SAMPLE_CSV));

  const [simDataSource, setSimDataSource] = useState<string>('RESUMEN DE SIMS (Silocom)');
  const [routerDataSource, setRouterDataSource] = useState<string>('RESUMEN DE ROUTERS (Silocom)');
  const [flotaDataSource, setFlotaDataSource] = useState<string>('RESUMEN DE FLOTA (INV FLOTA)');
  const [sensorizeitDataSource, setSensorizeitDataSource] = useState<string>('RESUMEN DE SENSORIZEIT (INV SENSORIZEIT)');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // SIM Filters
  const [simFilters, setSimFilters] = useState<FilterState>({
    searchQuery: '',
    propietarios: [],
    operadoras: [],
    almacenes: [],
    simStatuses: [],
    statuses: [],
  });

  // Router Filters
  const [routerFilters, setRouterFilters] = useState<RouterFilterState>({
    searchQuery: '',
    marcas: [],
    modelos: [],
    almacenes: [],
    statuses: [],
    condiciones: [],
    statuses2: [],
  });

  // Flota Filters
  const [flotaFilters, setFlotaFilters] = useState<FlotaFilterState>({
    searchQuery: '',
    marcas: [],
    modelos: [],
    almacenes: [],
    statuses: [],
    operadoras: [],
    comercios: [],
    tecnicos: [],
  });

  // SensorizeIt Filters (Campos requeridos: TIPO DE SENSOR, MODELO, ALMACEN)
  const [sensorizeitFilters, setSensorizeitFilters] = useState<SensorizeitFilterState>({
    searchQuery: '',
    tiposSensor: [],
    modelos: [],
    almacenes: [],
  });

  // Drilldown Modal Context
  const [drillDownContext, setDrillDownContext] = useState<GenericDrillDownContext | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Sync specific slot
  const syncSlot = useCallback(async (tab: InventoryTab, slotConfigOverride?: SheetSlotConfig) => {
    const slotConfig = slotConfigOverride || masterConfig[tab];
    setIsSyncing(true);
    setErrorMessage(null);

    try {
      if (tab === 'sim') {
        const res = await fetchSimData(slotConfig);
        setSimItems(res.records);
        setSimDataSource(res.source);
      } else if (tab === 'router') {
        const res = await fetchRouterData(slotConfig);
        setRouterItems(res.records);
        setRouterDataSource(res.source);
      } else if (tab === 'flota') {
        const res = await fetchFlotaData(slotConfig);
        setFlotaItems(res.records);
        setFlotaDataSource(res.source);
      } else if (tab === 'sensorizeit') {
        const res = await fetchSensorizeitData(slotConfig);
        setSensorizeitItems(res.records);
        setSensorizeitDataSource(res.source);
      }

      setMasterConfig((prev) => {
        const updated = {
          ...prev,
          [tab]: {
            ...prev[tab],
            lastSyncTime: new Date(),
            syncStatus: 'success' as const,
            errorMessage: null,
          },
        };
        localStorage.setItem(STORAGE_KEY_MASTER_CONFIG, JSON.stringify(updated));
        return updated;
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al sincronizar';
      setErrorMessage(msg);
      setMasterConfig((prev) => {
        const updated = {
          ...prev,
          [tab]: {
            ...prev[tab],
            syncStatus: 'error' as const,
            errorMessage: msg,
          },
        };
        localStorage.setItem(STORAGE_KEY_MASTER_CONFIG, JSON.stringify(updated));
        return updated;
      });
      throw err;
    } finally {
      setIsSyncing(false);
    }
  }, [masterConfig]);

  // Sync all slots that have configuration
  const syncAllConfiguredSlots = useCallback(async (configToUse?: MultiSheetMasterConfig) => {
    const cfg = configToUse || masterConfig;
    setIsSyncing(true);
    setErrorMessage(null);

    const slots: InventoryTab[] = ['sim', 'router', 'flota', 'sensorizeit'];
    const errors: string[] = [];

    await Promise.allSettled(
      slots.map(async (tab) => {
        const slotCfg = cfg[tab];
        if (!slotCfg?.sheetIdOrUrl?.trim() && !slotCfg?.publishedCsvUrl?.trim()) {
          return;
        }

        try {
          if (tab === 'sim') {
            const res = await fetchSimData(slotCfg);
            setSimItems(res.records);
            setSimDataSource(res.source);
          } else if (tab === 'router') {
            const res = await fetchRouterData(slotCfg);
            setRouterItems(res.records);
            setRouterDataSource(res.source);
          } else if (tab === 'flota') {
            const res = await fetchFlotaData(slotCfg);
            setFlotaItems(res.records);
            setFlotaDataSource(res.source);
          } else if (tab === 'sensorizeit') {
            const res = await fetchSensorizeitData(slotCfg);
            setSensorizeitItems(res.records);
            setSensorizeitDataSource(res.source);
          }

          setMasterConfig((prev) => ({
            ...prev,
            [tab]: {
              ...prev[tab],
              lastSyncTime: new Date(),
              syncStatus: 'success' as const,
              errorMessage: null,
            },
          }));
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : `Error en ${tab.toUpperCase()}`;
          errors.push(`${tab.toUpperCase()}: ${msg}`);
          setMasterConfig((prev) => ({
            ...prev,
            [tab]: {
              ...prev[tab],
              syncStatus: 'error' as const,
              errorMessage: msg,
            },
          }));
        }
      })
    );

    if (errors.length > 0) {
      setErrorMessage(errors.join(' | '));
    }
    setIsSyncing(false);
  }, [masterConfig]);

  // Initial sync on mount if configs exist
  useEffect(() => {
    const hasAnyConfig = ['sim', 'router', 'flota', 'sensorizeit'].some(
      (tab) => Boolean(masterConfig[tab as InventoryTab]?.sheetIdOrUrl?.trim() || masterConfig[tab as InventoryTab]?.publishedCsvUrl?.trim())
    );
    if (hasAnyConfig) {
      syncAllConfiguredSlots(masterConfig);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save config to localStorage and trigger sync
  const handleSaveMasterConfig = (newConfig: MultiSheetMasterConfig) => {
    setMasterConfig(newConfig);
    localStorage.setItem(STORAGE_KEY_MASTER_CONFIG, JSON.stringify(newConfig));
    syncAllConfiguredSlots(newConfig);
  };

  // Reset to default global configurations (clears local overrides)
  const handleResetToDefaultConfig = () => {
    localStorage.removeItem(STORAGE_KEY_MASTER_CONFIG);
    setMasterConfig({ ...DEFAULT_MASTER_CONFIG });
    syncAllConfiguredSlots(DEFAULT_MASTER_CONFIG);
  };

  // Sync active tab or all configured
  const handleRefreshActive = () => {
    syncAllConfiguredSlots();
  };

  // Direct CSV load
  const handleDirectCsvLoad = (tab: InventoryTab, csvText: string, sourceName: string) => {
    if (tab === 'sim') {
      const records = parseCsvToSimCards(csvText);
      setSimItems(records);
      setSimDataSource(sourceName);
    } else if (tab === 'router') {
      const records = parseCsvToRouters(csvText);
      setRouterItems(records);
      setRouterDataSource(sourceName);
    } else if (tab === 'flota') {
      const records = parseCsvToFlota(csvText);
      setFlotaItems(records);
      setFlotaDataSource(sourceName);
    } else if (tab === 'sensorizeit') {
      const records = parseCsvToSensorizeit(csvText);
      setSensorizeitItems(records);
      setSensorizeitDataSource(sourceName);
    }
  };

  // Auto-refresh interval
  useEffect(() => {
    if (!masterConfig.autoRefreshIntervalSeconds || masterConfig.autoRefreshIntervalSeconds <= 0) return;
    const intervalMs = masterConfig.autoRefreshIntervalSeconds * 1000;
    const timer = setInterval(() => {
      syncSlot(activeTab).catch(() => {});
    }, intervalMs);
    return () => clearInterval(timer);
  }, [masterConfig.autoRefreshIntervalSeconds, activeTab, syncSlot]);

  // Filtered SIM items
  const filteredSimItems = useMemo(() => {
    return simItems.filter(item => {
      if (simFilters.searchQuery.trim()) {
        const q = simFilters.searchQuery.toLowerCase();
        const matchesQuery =
          item.serialSimcard.toLowerCase().includes(q) ||
          item.numeroTelefonico.toLowerCase().includes(q) ||
          item.comercio.toLowerCase().includes(q) ||
          item.direccionIp.toLowerCase().includes(q) ||
          item.codCliente.toLowerCase().includes(q) ||
          item.equipoAsignado.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }
      if (simFilters.propietarios.length > 0 && !simFilters.propietarios.includes(item.propietario)) {
        return false;
      }
      if (simFilters.operadoras.length > 0 && !simFilters.operadoras.includes(item.operadora)) {
        return false;
      }
      if (simFilters.almacenes.length > 0 && !simFilters.almacenes.includes(item.almacen)) {
        return false;
      }
      if (simFilters.simStatuses.length > 0 && !simFilters.simStatuses.includes(item.simStatus)) {
        return false;
      }
      if (simFilters.statuses.length > 0 && !simFilters.statuses.includes(item.status)) {
        return false;
      }
      return true;
    });
  }, [simItems, simFilters]);

  // Filtered Router items
  const filteredRouterItems = useMemo(() => {
    return routerItems.filter(item => {
      if (routerFilters.searchQuery.trim()) {
        const q = routerFilters.searchQuery.toLowerCase();
        const matchesQuery =
          item.serial.toLowerCase().includes(q) ||
          item.imei.toLowerCase().includes(q) ||
          item.comercio.toLowerCase().includes(q) ||
          item.codCliente.toLowerCase().includes(q) ||
          item.tecnico.toLowerCase().includes(q) ||
          item.simAsignada.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }
      if (routerFilters.marcas.length > 0 && !routerFilters.marcas.includes(item.marca)) {
        return false;
      }
      if (routerFilters.modelos.length > 0 && !routerFilters.modelos.includes(item.modelo)) {
        return false;
      }
      if (routerFilters.almacenes.length > 0 && !routerFilters.almacenes.includes(item.almacen)) {
        return false;
      }
      if (routerFilters.statuses.length > 0 && !routerFilters.statuses.includes(item.status)) {
        return false;
      }
      if (routerFilters.condiciones.length > 0 && !routerFilters.condiciones.includes(item.condicion)) {
        return false;
      }
      if (routerFilters.statuses2.length > 0 && !routerFilters.statuses2.includes(item.status2)) {
        return false;
      }
      return true;
    });
  }, [routerItems, routerFilters]);

  // Filtered Flota items
  const filteredFlotaItems = useMemo(() => {
    return flotaItems.filter(item => {
      if (flotaFilters.searchQuery.trim()) {
        const q = flotaFilters.searchQuery.toLowerCase();
        const matchesQuery =
          item.serial.toLowerCase().includes(q) ||
          item.imei.toLowerCase().includes(q) ||
          item.marca.toLowerCase().includes(q) ||
          item.modelo.toLowerCase().includes(q) ||
          item.comercio.toLowerCase().includes(q) ||
          item.rifCliente.toLowerCase().includes(q) ||
          item.observacion.toLowerCase().includes(q) ||
          item.simAsignada.toLowerCase().includes(q) ||
          item.tecnico.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }
      if (flotaFilters.marcas.length > 0 && !flotaFilters.marcas.includes(item.marca)) {
        return false;
      }
      if (flotaFilters.modelos.length > 0 && !flotaFilters.modelos.includes(item.modelo)) {
        return false;
      }
      if (flotaFilters.almacenes.length > 0 && !flotaFilters.almacenes.includes(item.almacen)) {
        return false;
      }
      if (flotaFilters.statuses.length > 0 && !flotaFilters.statuses.includes(item.status)) {
        return false;
      }
      if (flotaFilters.operadoras.length > 0 && !flotaFilters.operadoras.includes(item.operadora)) {
        return false;
      }
      if (flotaFilters.tecnicos.length > 0 && !flotaFilters.tecnicos.includes(item.tecnico)) {
        return false;
      }
      return true;
    });
  }, [flotaItems, flotaFilters]);

  // Filtered SensorizeIt items (Columnas J: tipoSensor, L: modelo, R: almacen)
  const filteredSensorizeitItems = useMemo(() => {
    return sensorizeitItems.filter(item => {
      if (sensorizeitFilters.searchQuery.trim()) {
        const q = sensorizeitFilters.searchQuery.toLowerCase();
        const matchesQuery =
          item.serial.toLowerCase().includes(q) ||
          item.imei.toLowerCase().includes(q) ||
          item.tipoSensor.toLowerCase().includes(q) ||
          item.marca.toLowerCase().includes(q) ||
          item.modelo.toLowerCase().includes(q) ||
          item.comercio.toLowerCase().includes(q) ||
          item.rifCliente.toLowerCase().includes(q) ||
          item.simAsignada.toLowerCase().includes(q) ||
          item.tecnico.toLowerCase().includes(q) ||
          item.status.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }
      if (sensorizeitFilters.tiposSensor.length > 0 && !sensorizeitFilters.tiposSensor.includes(item.tipoSensor)) {
        return false;
      }
      if (sensorizeitFilters.modelos.length > 0 && !sensorizeitFilters.modelos.includes(item.modelo)) {
        return false;
      }
      if (sensorizeitFilters.almacenes.length > 0 && !sensorizeitFilters.almacenes.includes(item.almacen)) {
        return false;
      }
      return true;
    });
  }, [sensorizeitItems, sensorizeitFilters]);

  const currentDataSourceName =
    activeTab === 'sim'
      ? simDataSource
      : activeTab === 'router'
      ? routerDataSource
      : activeTab === 'flota'
      ? flotaDataSource
      : sensorizeitDataSource;

  const currentSlotConfig = masterConfig[activeTab];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 selection:bg-rose-500 selection:text-white">
      
      {/* Header with 5-phase manager and clean tab switcher */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        slotConfig={currentSlotConfig}
        totalRecords={
          activeTab === 'sim'
            ? simItems.length
            : activeTab === 'router'
            ? routerItems.length
            : activeTab === 'flota'
            ? flotaItems.length
            : sensorizeitItems.length
        }
        filteredCount={
          activeTab === 'sim'
            ? filteredSimItems.length
            : activeTab === 'router'
            ? filteredRouterItems.length
            : activeTab === 'flota'
            ? filteredFlotaItems.length
            : filteredSensorizeitItems.length
        }
        onRefresh={handleRefreshActive}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isSyncing={isSyncing}
        dataSourceName={currentDataSourceName}
        simCount={simItems.length}
        routerCount={routerItems.length}
        flotaCount={flotaItems.length}
        sensorizeitCount={sensorizeitItems.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Error notice if sync failed */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start justify-between gap-3 text-xs text-rose-900 shadow-xs">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-800">Aviso de Sincronización:</p>
                <p className="text-rose-700 mt-0.5">{errorMessage}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-rose-500 hover:text-rose-800 font-bold cursor-pointer"
            >
              Entendido
            </button>
          </div>
        )}

        {/* Tab 1: RESUMEN DE SIMS */}
        {activeTab === 'sim' && (
          <section className="space-y-4">
            {/* KPI Cards for SIM */}
            <KpiOverview
              items={filteredSimItems}
              onOpenDrillDown={setDrillDownContext}
            />

            {/* Dynamic Multiselect Filter Bar */}
            <FilterBar
              filters={simFilters}
              onFilterChange={setSimFilters}
              allItems={simItems}
              filteredCount={filteredSimItems.length}
            />

            {/* Multi-Dimensional Pivot Dashboard */}
            <PivotDashboard
              items={filteredSimItems}
              onOpenDrillDown={setDrillDownContext}
            />
          </section>
        )}

        {/* Tab 2: RESUMEN DE ROUTERS */}
        {activeTab === 'router' && (
          <section className="space-y-4">
            {/* KPI Cards for Router */}
            <RouterKpiOverview
              items={filteredRouterItems}
              allItems={routerItems}
              onOpenDrillDown={setDrillDownContext}
            />

            {/* Dynamic Multiselect Filter Bar for Routers */}
            <RouterFilterBar
              filters={routerFilters}
              onFilterChange={setRouterFilters}
              allItems={routerItems}
              filteredCount={filteredRouterItems.length}
            />

            {/* Multi-Dimensional Pivot Dashboard for Routers */}
            <RouterPivotDashboard
              items={filteredRouterItems}
              onOpenDrillDown={setDrillDownContext}
            />
          </section>
        )}

        {/* Tab 3: RESUMEN DE FLOTA */}
        {activeTab === 'flota' && (
          <section className="space-y-4">
            {/* KPI Cards for Flota */}
            <FlotaKpiOverview
              items={filteredFlotaItems}
              allItems={flotaItems}
              onOpenDrillDown={setDrillDownContext}
            />

            {/* Dynamic Multiselect Filter Bar for Flota */}
            <FlotaFilterBar
              filters={flotaFilters}
              onFilterChange={setFlotaFilters}
              allItems={flotaItems}
              filteredCount={filteredFlotaItems.length}
            />

            {/* Multi-Dimensional Pivot Dashboard for Flota */}
            <FlotaPivotDashboard
              items={filteredFlotaItems}
              onOpenDrillDown={setDrillDownContext}
            />
          </section>
        )}

        {/* Tab 4: RESUMEN DE SENSORIZEIT (Fase 4) */}
        {activeTab === 'sensorizeit' && (
          <section className="space-y-4">
            {/* KPI Cards for SensorizeIt */}
            <SensorizeitKpiOverview
              items={filteredSensorizeitItems}
              allItems={sensorizeitItems}
              onOpenDrillDown={setDrillDownContext}
            />

            {/* Dynamic Filter Bar (J: TIPO DE SENSOR, L: MODELO, R: ALMACEN) */}
            <SensorizeitFilterBar
              filters={sensorizeitFilters}
              onFilterChange={setSensorizeitFilters}
              allItems={sensorizeitItems}
              filteredCount={filteredSensorizeitItems.length}
            />

            {/* Pivot Matrix Dashboard */}
            <SensorizeitPivotDashboard
              items={filteredSensorizeitItems}
              onOpenDrillDown={setDrillDownContext}
            />
          </section>
        )}

      </main>

      {/* Drill-down Modal (Excluye Cols C-I, N y T en SensorizeIt) */}
      <DrillDownModal
        context={drillDownContext}
        onClose={() => setDrillDownContext(null)}
      />

      {/* 5-Sheet Google Sheets Configuration Modal */}
      <GoogleSheetsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        masterConfig={masterConfig}
        onSaveMasterConfig={handleSaveMasterConfig}
        onResetDefaultConfig={handleResetToDefaultConfig}
        onTestAndSyncActive={(tab, cfg) => syncSlot(tab, cfg)}
        onDirectCsvLoad={handleDirectCsvLoad}
        isSyncing={isSyncing}
        activeInventoryTab={activeTab}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="font-bold text-slate-800">Silocom C.A.</span>
            <span>•</span>
            <span>Sistema Integral de Inventario (SIMS | ROUTERS | FLOTA | SENSORIZEIT)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-600 font-semibold">Listo para Producción</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
