import React, { useState } from 'react';
import { Search, Filter, X, ChevronDown, Check, RotateCcw } from 'lucide-react';
import { FilterState, SimCardItem } from '../types';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  allItems: SimCardItem[];
  filteredCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  allItems,
  filteredCount,
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Extract unique values
  const propietarios: string[] = Array.from(new Set<string>(allItems.map(i => i.propietario).filter(Boolean))).sort();
  const operadoras: string[] = Array.from(new Set<string>(allItems.map(i => i.operadora).filter(Boolean))).sort();
  const almacenes: string[] = Array.from(new Set<string>(allItems.map(i => i.almacen).filter(Boolean))).sort();
  const simStatuses: string[] = Array.from(new Set<string>(allItems.map(i => i.simStatus).filter(Boolean))).sort();
  const statuses: string[] = Array.from(new Set<string>(allItems.map(i => i.status).filter(Boolean))).sort();

  const toggleMultiSelect = (key: keyof FilterState, value: string) => {
    const currentList = (filters[key] as string[]) || [];
    const exists = currentList.includes(value);
    const updated = exists ? currentList.filter(item => item !== value) : [...currentList, value];
    onFilterChange({
      ...filters,
      [key]: updated,
    });
  };

  const clearKeyFilter = (key: keyof FilterState) => {
    onFilterChange({
      ...filters,
      [key]: [],
    });
  };

  const resetAllFilters = () => {
    onFilterChange({
      searchQuery: '',
      propietarios: [],
      operadoras: [],
      almacenes: [],
      simStatuses: [],
      statuses: [],
    });
  };

  const hasActiveFilters =
    filters.searchQuery.trim().length > 0 ||
    filters.propietarios.length > 0 ||
    filters.operadoras.length > 0 ||
    filters.almacenes.length > 0 ||
    filters.simStatuses.length > 0 ||
    filters.statuses.length > 0;

  const renderDropdown = (
    label: string,
    key: 'propietarios' | 'operadoras' | 'almacenes' | 'simStatuses' | 'statuses',
    options: string[],
    badgeColor: string
  ) => {
    const selected = filters[key] || [];
    const isOpen = openDropdown === key;

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenDropdown(isOpen ? null : key)}
          className={`flex items-center justify-between gap-2 px-3 py-2 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
            selected.length > 0
              ? 'bg-slate-900 text-white border-slate-800 shadow-sm ring-1 ring-rose-500/40'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-semibold text-slate-800">{label}:</span>
            {selected.length === 0 ? (
              <span className="text-slate-400">Todos ({options.length})</span>
            ) : selected.length === 1 ? (
              <span className="text-rose-600 font-semibold truncate max-w-[90px]">{selected[0]}</span>
            ) : (
              <span className="bg-rose-100 text-rose-800 text-[11px] font-bold px-1.5 py-0.2 rounded-full">
                {selected.length} selec.
              </span>
            )}
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-20"
              onClick={() => setOpenDropdown(null)}
            />
            <div className="absolute left-0 mt-1.5 w-60 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-2 text-xs divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-1.5 px-1">
                <span className="font-semibold text-slate-700">{label}</span>
                {selected.length > 0 && (
                  <button
                    onClick={() => clearKeyFilter(key)}
                    className="text-[11px] text-rose-600 hover:text-rose-800 font-medium cursor-pointer"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              <div className="py-1 max-h-52 overflow-y-auto space-y-0.5">
                {options.map((option) => {
                  const isChecked = selected.includes(option);
                  const count = allItems.filter(i => {
                    if (key === 'propietarios') return i.propietario === option;
                    if (key === 'operadoras') return i.operadora === option;
                    if (key === 'almacenes') return i.almacen === option;
                    if (key === 'simStatuses') return i.simStatus === option;
                    if (key === 'statuses') return i.status === option;
                    return false;
                  }).length;

                  return (
                    <label
                      key={option}
                      onClick={() => toggleMultiSelect(key, option)}
                      className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer hover:bg-slate-50 transition-colors ${
                        isChecked ? 'bg-rose-50/70 font-semibold text-rose-950' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            isChecked ? 'bg-rose-700 border-rose-700 text-white' : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="truncate" title={option}>{option}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono ml-2">
                        {count}
                      </span>
                    </label>
                  );
                })}
              </div>

              {selected.length > 0 && (
                <div className="pt-1.5 px-1 flex justify-end">
                  <button
                    onClick={() => setOpenDropdown(null)}
                    className="px-2 py-1 bg-slate-900 text-white text-[11px] font-medium rounded hover:bg-slate-800 cursor-pointer"
                  >
                    Aplicar
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-sm mb-6">
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        
        {/* Global Search box */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
            placeholder="Buscar por Serial, Teléfono, IP, Comercio, RIF/Código, Equipo..."
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 focus:bg-white transition-colors"
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

        {/* Dynamic Filters Group */}
        <div className="flex items-center flex-wrap gap-2">
          {renderDropdown('Propietario', 'propietarios', propietarios, 'rose')}
          {renderDropdown('Operadora', 'operadoras', operadoras, 'indigo')}
          {renderDropdown('Almacén', 'almacenes', almacenes, 'emerald')}
          {renderDropdown('Sim Status', 'simStatuses', simStatuses, 'amber')}
          {renderDropdown('Status Operativo', 'statuses', statuses, 'sky')}

          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
              title="Restablecer todos los filtros"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Limpiar filtros</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter summary chips if active */}
      {hasActiveFilters && (
        <div className="flex items-center flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100 text-xs">
          <span className="text-slate-500 text-[11px] font-medium flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3 text-slate-400" />
            Filtros activos:
          </span>

          {filters.searchQuery && (
            <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-800 px-2 py-0.5 rounded text-[11px]">
              Búsqueda: &ldquo;{filters.searchQuery}&rdquo;
              <button
                onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
                className="hover:text-rose-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.propietarios.map((p) => (
            <span key={p} className="inline-flex items-center gap-1 bg-rose-50 border border-rose-200 text-rose-800 px-2 py-0.5 rounded text-[11px] font-medium">
              Prop: {p}
              <button onClick={() => toggleMultiSelect('propietarios', p)} className="hover:text-rose-950">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {filters.operadoras.map((o) => (
            <span key={o} className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-200 text-indigo-800 px-2 py-0.5 rounded text-[11px] font-medium">
              Op: {o}
              <button onClick={() => toggleMultiSelect('operadoras', o)} className="hover:text-indigo-950">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {filters.almacenes.map((a) => (
            <span key={a} className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded text-[11px] font-medium">
              Alm: {a}
              <button onClick={() => toggleMultiSelect('almacenes', a)} className="hover:text-emerald-950">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {filters.simStatuses.map((s) => (
            <span key={s} className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-900 px-2 py-0.5 rounded text-[11px] font-medium">
              Sim Status: {s}
              <button onClick={() => toggleMultiSelect('simStatuses', s)} className="hover:text-amber-950">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {filters.statuses.map((st) => (
            <span key={st} className="inline-flex items-center gap-1 bg-sky-50 border border-sky-200 text-sky-800 px-2 py-0.5 rounded text-[11px] font-medium">
              Status: {st}
              <button onClick={() => toggleMultiSelect('statuses', st)} className="hover:text-sky-950">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          <span className="text-[11px] text-slate-400 ml-auto font-mono">
            {filteredCount} {filteredCount === 1 ? 'registro' : 'registros'} encontrados
          </span>
        </div>
      )}
    </div>
  );
};
