import React, { useState } from 'react';
import { Search, Filter, X, ChevronDown, Check, RotateCcw } from 'lucide-react';
import { RouterFilterState, RouterItem } from '../types';

interface RouterFilterBarProps {
  filters: RouterFilterState;
  onFilterChange: (newFilters: RouterFilterState) => void;
  allItems: RouterItem[];
  filteredCount: number;
}

export const RouterFilterBar: React.FC<RouterFilterBarProps> = ({
  filters,
  onFilterChange,
  allItems,
  filteredCount,
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const marcas: string[] = Array.from(new Set<string>(allItems.map(i => i.marca).filter(Boolean))).sort();
  const modelos: string[] = Array.from(new Set<string>(allItems.map(i => i.modelo).filter(Boolean))).sort();
  const almacenes: string[] = Array.from(new Set<string>(allItems.map(i => i.almacen).filter(Boolean))).sort();
  const statuses: string[] = Array.from(new Set<string>(allItems.map(i => i.status).filter(Boolean))).sort();
  const condiciones: string[] = Array.from(new Set<string>(allItems.map(i => i.condicion).filter(Boolean))).sort();
  const statuses2: string[] = Array.from(new Set<string>(allItems.map(i => i.status2).filter(Boolean))).sort();

  const toggleMultiSelect = (key: keyof RouterFilterState, value: string) => {
    const currentList = (filters[key] as string[]) || [];
    const exists = currentList.includes(value);
    const updated = exists ? currentList.filter(item => item !== value) : [...currentList, value];
    onFilterChange({
      ...filters,
      [key]: updated,
    });
  };

  const clearKeyFilter = (key: keyof RouterFilterState) => {
    onFilterChange({
      ...filters,
      [key]: [],
    });
  };

  const resetAllFilters = () => {
    onFilterChange({
      searchQuery: '',
      marcas: [],
      modelos: [],
      almacenes: [],
      statuses: [],
      condiciones: [],
      statuses2: [],
    });
  };

  const activeFiltersCount =
    (filters.searchQuery ? 1 : 0) +
    filters.marcas.length +
    filters.modelos.length +
    filters.almacenes.length +
    filters.statuses.length +
    filters.condiciones.length +
    filters.statuses2.length;

  const filterConfigs = [
    { key: 'marcas' as const, label: 'Marca', options: marcas, current: filters.marcas },
    { key: 'modelos' as const, label: 'Modelo', options: modelos, current: filters.modelos },
    { key: 'almacenes' as const, label: 'Almacén', options: almacenes, current: filters.almacenes },
    { key: 'statuses' as const, label: 'Status', options: statuses, current: filters.statuses },
    { key: 'condiciones' as const, label: 'Condición', options: condiciones, current: filters.condiciones },
    { key: 'statuses2' as const, label: 'Status 2', options: statuses2, current: filters.statuses2 },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm mb-6">
      
      {/* Top Search and Stats */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
            placeholder="Buscar por Serial, IMEI, Comercio, SIM, Técnico..."
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all font-medium"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-600 font-semibold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            Mostrando: <span className="font-bold text-slate-900">{filteredCount}</span> de{' '}
            <span className="font-bold text-slate-900">{allItems.length}</span> routers
          </div>

          {activeFiltersCount > 0 && (
            <button
              onClick={resetAllFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg border border-rose-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar Filtros ({activeFiltersCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Multi-select filter dropdown buttons */}
      <div className="pt-3 flex flex-wrap gap-2.5 items-center">
        <div className="text-xs font-bold text-slate-700 flex items-center gap-1 mr-1">
          <Filter className="w-3.5 h-3.5 text-rose-700" />
          <span>Filtros Dinámicos:</span>
        </div>

        {filterConfigs.map((fc) => {
          const isOpen = openDropdown === fc.key;
          const count = fc.current.length;

          return (
            <div key={fc.key} className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown(isOpen ? null : fc.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  count > 0
                    ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{fc.label}</span>
                {count > 0 && (
                  <span className="px-1.5 py-0.2 bg-rose-700 text-white rounded-full text-[10px] font-bold">
                    {count}
                  </span>
                )}
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setOpenDropdown(null)}
                  />
                  <div className="absolute top-full left-0 mt-1.5 w-60 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 text-xs animate-in fade-in slide-in-from-top-1 duration-100">
                    <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-100 mb-1">
                      <span className="font-bold text-slate-800">{fc.label}</span>
                      {count > 0 && (
                        <button
                          onClick={() => clearKeyFilter(fc.key)}
                          className="text-[11px] text-rose-600 hover:underline font-semibold"
                        >
                          Limpiar
                        </button>
                      )}
                    </div>
                    <div className="max-h-56 overflow-y-auto space-y-0.5">
                      {fc.options.map((opt) => {
                        const isSelected = fc.current.includes(opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => toggleMultiSelect(fc.key, opt)}
                            className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center justify-between transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-rose-50 text-rose-900 font-semibold'
                                : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span className="truncate mr-2">{opt}</span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
