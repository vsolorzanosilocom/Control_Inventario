import React, { useState, useRef, useEffect } from 'react';
import { Search, RotateCcw, Filter, ChevronDown, Check, X } from 'lucide-react';
import { SensorizeitFilterState, SensorizeitItem } from '../types';

interface SensorizeitFilterBarProps {
  filters: SensorizeitFilterState;
  onFilterChange: (newFilters: SensorizeitFilterState) => void;
  allItems: SensorizeitItem[];
  filteredCount: number;
}

export const SensorizeitFilterBar: React.FC<SensorizeitFilterBarProps> = ({
  filters,
  onFilterChange,
  allItems = [],
  filteredCount,
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getUniqueValues = (key: keyof SensorizeitItem): string[] => {
    const set = new Set<string>();
    (allItems || []).forEach(r => {
      const val = (r[key] as string || '').trim();
      if (val) set.add(val);
    });
    return Array.from(set).sort();
  };

  // The 3 required primary filter columns:
  // J: TIPO DE SENSOR, L: MODELO, R: ALMACEN
  const tiposSensor = getUniqueValues('tipoSensor');
  const modelos = getUniqueValues('modelo');
  const almacenes = getUniqueValues('almacen');
  const marcas = getUniqueValues('marca');
  const statuses = getUniqueValues('status');

  const toggleMultiSelect = (
    key: keyof Omit<SensorizeitFilterState, 'searchQuery'>,
    val: string
  ) => {
    const current = (filters[key] as string[]) || [];
    const updated = current.includes(val)
      ? current.filter(item => item !== val)
      : [...current, val];
    onFilterChange({ ...filters, [key]: updated });
  };

  const resetAllFilters = () => {
    onFilterChange({
      searchQuery: '',
      tiposSensor: [],
      modelos: [],
      almacenes: [],
      marcas: [],
      statuses: [],
    });
  };

  const hasActiveFilters =
    Boolean(filters.searchQuery) ||
    (filters.tiposSensor || []).length > 0 ||
    (filters.modelos || []).length > 0 ||
    (filters.almacenes || []).length > 0 ||
    (filters.marcas || []).length > 0 ||
    (filters.statuses || []).length > 0;

  const renderDropdown = (
    label: string,
    filterKey: keyof Omit<SensorizeitFilterState, 'searchQuery'>,
    options: string[],
    isPrimary: boolean = false
  ) => {
    const selected = (filters[filterKey] as string[]) || [];
    const isOpen = openDropdown === filterKey;

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenDropdown(isOpen ? null : (filterKey as string))}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
            selected.length > 0
              ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-semibold shadow-xs'
              : isPrimary
              ? 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50 font-medium'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>{label}</span>
          {selected.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
              {selected.length}
            </span>
          )}
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-64 max-h-64 overflow-y-auto bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-2 text-xs">
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100 px-1">
              <span className="font-semibold text-slate-700">{label}</span>
              {selected.length > 0 && (
                <button
                  type="button"
                  onClick={() => onFilterChange({ ...filters, [filterKey]: [] })}
                  className="text-indigo-600 hover:underline text-[11px]"
                >
                  Limpiar ({selected.length})
                </button>
              )}
            </div>
            <div className="space-y-0.5">
              {options.length === 0 ? (
                <div className="text-slate-400 italic px-2 py-1">Sin opciones</div>
              ) : (
                options.map(opt => {
                  const isChecked = selected.includes(opt);
                  return (
                    <div
                      key={opt}
                      onClick={() => toggleMultiSelect(filterKey, opt)}
                      className={`flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                        isChecked ? 'bg-indigo-50 text-indigo-900 font-medium' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="truncate pr-2">{opt}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div ref={containerRef} className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.searchQuery || ''}
            onChange={e => onFilterChange({ ...filters, searchQuery: e.target.value })}
            placeholder="Buscar por Serial, IMEI, Tipo, Comercio, RIF, Técnico..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 placeholder-slate-400"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters and Reset */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium mr-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filtros:</span>
          </div>

          {/* Primary 3 filter dimensions as requested */}
          {renderDropdown('Tipo de Sensor', 'tiposSensor', tiposSensor, true)}
          {renderDropdown('Modelo', 'modelos', modelos, true)}
          {renderDropdown('Almacén', 'almacenes', almacenes, true)}

          {/* Additional helpful filters */}
          {renderDropdown('Marca', 'marcas', marcas)}
          {renderDropdown('Status', 'statuses', statuses)}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
              title="Restablecer todos los filtros"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
