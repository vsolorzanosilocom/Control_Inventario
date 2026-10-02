import React, { useState, useRef, useEffect } from 'react';
import { Search, RotateCcw, Filter, ChevronDown, Check, X } from 'lucide-react';

/**
 * Shared inventory filter bar used by the Flota and Sensorizeit modules.
 * The two original bars (FlotaFilterBar / SensorizeitFilterBar) were visually
 * identical; only the dropdown definitions, placeholder text and panel width
 * differed. This generic component preserves that exact markup.
 */
export interface FilterBarDropdownConfig<T, F> {
  /** Key in the filter state (e.g. 'marcas') */
  key: keyof Omit<F, 'searchQuery'>;
  /** Key in the item type used to extract unique option values (e.g. 'marca') */
  valueKey: keyof T;
  label: string;
  /** Highlights the dropdown as a primary filter (slightly stronger border) */
  primary?: boolean;
}

interface GenericFilterBarProps<T, F extends { searchQuery: string }> {
  filters: F;
  onFilterChange: (newFilters: F) => void;
  allItems: T[];
  searchPlaceholder: string;
  /** Tailwind width class for the dropdown panel ('w-60' | 'w-64') */
  panelWidth?: string;
  dropdowns: FilterBarDropdownConfig<T, F>[];
  resetDefaults: F;
}

export function GenericFilterBar<T, F extends { searchQuery: string }>({
  filters,
  onFilterChange,
  allItems = [],
  searchPlaceholder,
  panelWidth = 'w-60',
  dropdowns,
  resetDefaults,
}: GenericFilterBarProps<T, F>) {
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

  const getUniqueValues = (key: keyof T): string[] => {
    const set = new Set<string>();
    (allItems || []).forEach(r => {
      const val = (r[key] as unknown as string || '').trim();
      if (val) set.add(val);
    });
    return Array.from(set).sort();
  };

  const toggleMultiSelect = (key: keyof Omit<F, 'searchQuery'>, val: string) => {
    const current = (filters[key] as unknown as string[]) || [];
    const updated = current.includes(val)
      ? current.filter(item => item !== val)
      : [...current, val];
    onFilterChange({ ...filters, [key]: updated } as F);
  };

  const resetAllFilters = () => {
    onFilterChange(resetDefaults);
  };

  const hasActiveFilters =
    Boolean(filters.searchQuery) ||
    dropdowns.some(d => ((filters[d.key] as unknown as string[]) || []).length > 0);

  const renderDropdown = (cfg: FilterBarDropdownConfig<T, F>) => {
    const selected = (filters[cfg.key] as unknown as string[]) || [];
    const options = getUniqueValues(cfg.valueKey);
    const isOpen = openDropdown === (cfg.key as string);

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenDropdown(isOpen ? null : (cfg.key as string))}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
            selected.length > 0
              ? cfg.primary
                ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-semibold shadow-xs'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm'
              : cfg.primary
              ? 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50 font-medium'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>{cfg.label}</span>
          {selected.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
              {selected.length}
            </span>
          )}
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {isOpen && (
          <div className={`absolute top-full left-0 mt-1 ${panelWidth} max-h-64 overflow-y-auto bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-2 text-xs`}>
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100 px-1">
              <span className="font-semibold text-slate-700">{cfg.label}</span>
              {selected.length > 0 && (
                <button
                  type="button"
                  onClick={() => onFilterChange({ ...filters, [cfg.key]: [] } as F)}
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
                      onClick={() => toggleMultiSelect(cfg.key, opt)}
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
            onChange={e => onFilterChange({ ...filters, searchQuery: e.target.value } as F)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 placeholder-slate-400"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ ...filters, searchQuery: '' } as F)}
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

          {dropdowns.map(cfg => renderDropdown(cfg))}

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
}