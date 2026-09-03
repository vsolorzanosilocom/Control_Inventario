import React from 'react';
import { RefreshCw, Database, CheckCircle2, AlertCircle, Settings, FileSpreadsheet, Radio, Cpu, Truck, Activity } from 'lucide-react';
import { InventoryTab, SheetSlotConfig } from '../types';

interface HeaderProps {
  activeTab: InventoryTab;
  onTabChange: (tab: InventoryTab) => void;
  slotConfig: SheetSlotConfig;
  totalRecords: number;
  filteredCount: number;
  onRefresh: () => void;
  onOpenSettings: () => void;
  isSyncing: boolean;
  dataSourceName: string;
  simCount: number;
  routerCount: number;
  flotaCount: number;
  sensorizeitCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  slotConfig,
  totalRecords,
  filteredCount,
  onRefresh,
  onOpenSettings,
  isSyncing,
  dataSourceName,
  simCount,
  routerCount,
  flotaCount,
  sensorizeitCount,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Branding Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between py-3 gap-4 border-b border-slate-800/80">
          
          {/* Logo & Corporate Brand */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-white px-3.5 py-1.5 rounded-lg shadow-inner">
              <div className="flex flex-col items-center">
                <div className="flex items-center tracking-tight font-black text-2xl leading-none">
                  <span className="text-slate-900 font-extrabold">S</span>
                  <span className="text-rose-700 font-black px-0.5 inline-block text-2xl">I</span>
                  <span className="text-slate-900 font-extrabold">locom</span>
                </div>
                <span className="text-[9px] font-bold text-slate-800 tracking-wider mt-0.5">
                  RIF: J-30725192-1
                </span>
              </div>
            </div>

            <div className="border-l border-slate-700 pl-3">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-1.5">
                  Sistema de Control de Inventarios
                </h1>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Monitoreo ejecutivo, tablas dinámicas y análisis en tiempo real
              </p>
            </div>
          </div>

          {/* Sync status & Actions */}
          <div className="flex items-center flex-wrap gap-2.5 self-end md:self-auto">
            {/* Source badge */}
            <div className="flex items-center gap-1.5 text-xs bg-slate-800/90 border border-slate-700/80 px-2.5 py-1.5 rounded-md text-slate-300">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate max-w-[140px] sm:max-w-[200px]" title={dataSourceName}>
                {dataSourceName}
              </span>
            </div>

            {/* Refresh button */}
            <button
              onClick={onRefresh}
              disabled={isSyncing}
              title="Actualizar datos de Google Sheets"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-700 hover:bg-rose-600 disabled:bg-slate-700 text-white rounded-md text-xs font-semibold shadow transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sincronizando...' : 'Actualizar'}</span>
            </button>

            {/* Config modal toggle button */}
            <button
              onClick={onOpenSettings}
              title="Gestionar IDs de Google Sheets (5 Archivos)"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-md text-xs font-medium transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span>IDs / Conexiones</span>
            </button>
          </div>

        </div>

        {/* Inventory Navigation Tabs */}
        <div className="flex items-center justify-between pt-2 overflow-x-auto gap-2">
          <div className="flex items-center gap-2">
            
            {/* Tab 1: RESUMEN DE SIMS */}
            <button
              type="button"
              onClick={() => onTabChange('sim')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-t-lg transition-all cursor-pointer border-b-2 ${
                activeTab === 'sim'
                  ? 'bg-slate-800 text-white border-rose-600 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-transparent'
              }`}
            >
              <Radio className={`w-4 h-4 ${activeTab === 'sim' ? 'text-rose-500' : 'text-slate-500'}`} />
              <span>RESUMEN DE SIMS</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                activeTab === 'sim' ? 'bg-rose-700 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {simCount}
              </span>
            </button>

            {/* Tab 2: RESUMEN DE ROUTERS */}
            <button
              type="button"
              onClick={() => onTabChange('router')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-t-lg transition-all cursor-pointer border-b-2 ${
                activeTab === 'router'
                  ? 'bg-slate-800 text-white border-rose-600 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-transparent'
              }`}
            >
              <Cpu className={`w-4 h-4 ${activeTab === 'router' ? 'text-rose-500' : 'text-slate-500'}`} />
              <span>RESUMEN DE ROUTERS</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                activeTab === 'router' ? 'bg-rose-700 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {routerCount}
              </span>
            </button>

            {/* Tab 3: RESUMEN DE FLOTA */}
            <button
              type="button"
              onClick={() => onTabChange('flota')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-t-lg transition-all cursor-pointer border-b-2 ${
                activeTab === 'flota'
                  ? 'bg-slate-800 text-white border-indigo-500 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-transparent'
              }`}
            >
              <Truck className={`w-4 h-4 ${activeTab === 'flota' ? 'text-indigo-400' : 'text-slate-500'}`} />
              <span>RESUMEN DE FLOTA</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                activeTab === 'flota' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {flotaCount}
              </span>
            </button>

            {/* Tab 4: RESUMEN DE SENSORIZEIT */}
            <button
              type="button"
              onClick={() => onTabChange('sensorizeit')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-t-lg transition-all cursor-pointer border-b-2 ${
                activeTab === 'sensorizeit'
                  ? 'bg-slate-800 text-white border-emerald-500 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-transparent'
              }`}
            >
              <Activity className={`w-4 h-4 ${activeTab === 'sensorizeit' ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span>RESUMEN DE SENSORIZEIT</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                activeTab === 'sensorizeit' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {sensorizeitCount}
              </span>
            </button>

          </div>
        </div>

      </div>
    </header>
  );
};

