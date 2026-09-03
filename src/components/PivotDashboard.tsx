import React, { useState } from 'react';
import { SimCardItem, GenericDrillDownContext, PivotRowDimension, PivotColDimension } from '../types';
import { Table, ArrowUpDown, Layers, Maximize2 } from 'lucide-react';

interface PivotDashboardProps {
  items: SimCardItem[];
  onOpenDrillDown: (ctx: GenericDrillDownContext) => void;
}

export const PivotDashboard: React.FC<PivotDashboardProps> = ({ items, onOpenDrillDown }) => {
  const [activeView, setActiveView] = useState<'matrix_custom' | 'matrix_prop_op' | 'matrix_prop_alm' | 'matrix_alm_status'>('matrix_prop_alm');
  const [rowDimension, setRowDimension] = useState<PivotRowDimension>('propietario');
  const [colDimension, setColDimension] = useState<PivotColDimension>('almacen');

  const dimensionLabels: Record<string, string> = {
    propietario: 'Propietario',
    operadora: 'Operadora',
    almacen: 'Almacén',
    simStatus: 'Sim Status',
    status: 'Status Operativo',
  };

  const getDimensionValue = (item: SimCardItem, dim: PivotRowDimension | PivotColDimension): string => {
    switch (dim) {
      case 'propietario':
        return item.propietario || 'SIN PROPIETARIO';
      case 'operadora':
        return item.operadora || 'SIN OPERADORA';
      case 'almacen':
        return item.almacen || 'SIN ALMACEN';
      case 'simStatus':
        return item.simStatus || 'ACTIVA';
      case 'status':
        return item.status || 'SIN STATUS';
      default:
        return 'OTRO';
    }
  };

  // Generic Pivot Matrix Generator
  const renderPivotMatrix = (
    rDim: PivotRowDimension,
    cDim: PivotColDimension,
    matrixTitle: string,
    matrixSubtitle?: string
  ) => {
    const rowKeys: string[] = Array.from(new Set<string>(items.map(i => getDimensionValue(i, rDim)))).sort();
    const colKeys: string[] = Array.from(new Set<string>(items.map(i => getDimensionValue(i, cDim)))).sort();

    const cellMap: Record<string, SimCardItem[]> = {};
    const rowTotals: Record<string, SimCardItem[]> = {};
    const colTotals: Record<string, SimCardItem[]> = {};

    rowKeys.forEach(r => {
      rowTotals[r] = [];
    });
    colKeys.forEach(c => {
      colTotals[c] = [];
    });

    items.forEach(item => {
      const rVal = getDimensionValue(item, rDim);
      const cVal = getDimensionValue(item, cDim);
      const key = `${rVal}:::${cVal}`;

      if (!cellMap[key]) cellMap[key] = [];
      cellMap[key].push(item);

      if (rowTotals[rVal]) rowTotals[rVal].push(item);
      if (colTotals[cVal]) colTotals[cVal].push(item);
    });

    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Table className="w-4 h-4 text-rose-700" />
              {matrixTitle}
            </h3>
            {matrixSubtitle && (
              <p className="text-xs text-slate-500 mt-0.5">{matrixSubtitle}</p>
            )}
          </div>
          <div className="text-[11px] text-slate-500 font-medium bg-white px-2.5 py-1 rounded-md border border-slate-200 self-start sm:self-auto">
            Haz click en cualquier número para ver el desglose
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-200">
                <th className="py-3 px-4 font-bold text-slate-800 uppercase tracking-wider text-[11px] min-w-[160px] sticky left-0 bg-slate-100/95 z-10">
                  {dimensionLabels[rDim]} ↓ / {dimensionLabels[cDim]} →
                </th>
                {colKeys.map(cKey => (
                  <th key={cKey} className="py-3 px-3.5 font-bold text-slate-700 text-center uppercase tracking-wider text-[11px] min-w-[95px] border-l border-slate-200/80">
                    {cKey}
                  </th>
                ))}
                <th className="py-3 px-4 font-bold text-slate-900 text-right uppercase tracking-wider text-[11px] min-w-[95px] bg-slate-200/80 border-l border-slate-300">
                  Total General
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rowKeys.map(rKey => {
                const totalRowItems = rowTotals[rKey] || [];
                return (
                  <tr key={rKey} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4 font-bold text-slate-800 sticky left-0 bg-white hover:bg-slate-50 z-10 border-r border-slate-200/60 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.05)]">
                      <button
                        type="button"
                        onClick={() =>
                          onOpenDrillDown({
                            module: 'sim',
                            title: `${dimensionLabels[rDim]}: ${rKey}`,
                            subtitle: `Todos los registros correspondientes a ${dimensionLabels[rDim]} ${rKey}`,
                            filterDescription: `${dimensionLabels[rDim]}: ${rKey}`,
                            simRecords: totalRowItems,
                            appliedFilterTag: `r_${rKey}`,
                          })
                        }
                        className="text-left font-bold text-slate-800 hover:text-rose-700 hover:underline cursor-pointer"
                      >
                        {rKey}
                      </button>
                    </td>

                    {colKeys.map(cKey => {
                      const cellItems = cellMap[`${rKey}:::${cKey}`] || [];
                      const count = cellItems.length;

                      return (
                        <td key={cKey} className="py-2.5 px-3.5 text-center border-l border-slate-100 font-mono">
                          {count > 0 ? (
                            <button
                              type="button"
                              onClick={() =>
                                onOpenDrillDown({
                                  module: 'sim',
                                  title: `${rKey} en ${cKey}`,
                                  subtitle: `${dimensionLabels[rDim]}: ${rKey} | ${dimensionLabels[cDim]}: ${cKey}`,
                                  filterDescription: `${dimensionLabels[rDim]} = ${rKey} y ${dimensionLabels[cDim]} = ${cKey}`,
                                  simRecords: cellItems,
                                  appliedFilterTag: `${rKey}_${cKey}`,
                                })
                              }
                              className="px-2.5 py-1 rounded-md font-bold text-slate-900 bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-200/70 hover:border-rose-600 transition-all cursor-pointer shadow-xs inline-block text-xs"
                            >
                              {count.toLocaleString()}
                            </button>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                      );
                    })}

                    <td className="py-2.5 px-4 text-right font-bold text-slate-900 bg-slate-50/90 border-l border-slate-200 font-mono">
                      <button
                        type="button"
                        onClick={() =>
                          onOpenDrillDown({
                            module: 'sim',
                            title: `Total ${rKey}`,
                            subtitle: `Todos los registros de ${dimensionLabels[rDim]} ${rKey}`,
                            filterDescription: `${dimensionLabels[rDim]}: ${rKey}`,
                            simRecords: totalRowItems,
                            appliedFilterTag: `row_total_${rKey}`,
                          })
                        }
                        className="px-2.5 py-1 rounded-md font-bold text-slate-900 bg-slate-200/80 hover:bg-slate-900 hover:text-white transition-all cursor-pointer shadow-xs text-xs"
                      >
                        {totalRowItems.length.toLocaleString()}
                      </button>
                    </td>
                  </tr>
                );
              })}

              <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                <td className="py-3 px-4 uppercase tracking-wider text-[11px] sticky left-0 bg-slate-100 z-10">
                  Total General
                </td>
                {colKeys.map(cKey => {
                  const totalColItems = colTotals[cKey] || [];
                  return (
                    <td key={cKey} className="py-3 px-3.5 text-center border-l border-slate-200 font-mono">
                      <button
                        type="button"
                        onClick={() =>
                          onOpenDrillDown({
                            module: 'sim',
                            title: `Total en ${cKey}`,
                            subtitle: `Todos los registros clasificados en ${dimensionLabels[cDim]} ${cKey}`,
                            filterDescription: `${dimensionLabels[cDim]}: ${cKey}`,
                            simRecords: totalColItems,
                            appliedFilterTag: `col_total_${cKey}`,
                          })
                        }
                        className="px-2.5 py-1 rounded-md font-bold text-slate-900 bg-slate-200/80 hover:bg-slate-900 hover:text-white transition-all cursor-pointer shadow-xs text-xs"
                      >
                        {totalColItems.length.toLocaleString()}
                      </button>
                    </td>
                  );
                })}
                <td className="py-3 px-4 text-right text-sm font-black text-rose-800 bg-rose-100/80 border-l border-slate-300 font-mono">
                  <button
                    type="button"
                    onClick={() =>
                      onOpenDrillDown({
                        module: 'sim',
                        title: 'Total General de SIMs',
                        subtitle: 'Todos los registros incluidos en la vista actual',
                        filterDescription: 'Todos los registros',
                        simRecords: items,
                        appliedFilterTag: 'all_items',
                      })
                    }
                    className="px-3 py-1 rounded-md font-black text-rose-900 bg-rose-200 hover:bg-rose-700 hover:text-white transition-all cursor-pointer shadow-xs"
                  >
                    {items.length.toLocaleString()}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Top View Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveView('matrix_prop_alm')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeView === 'matrix_prop_alm'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Propietario vs Almacén
          </button>
          <button
            type="button"
            onClick={() => setActiveView('matrix_prop_op')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeView === 'matrix_prop_op'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Propietario vs Operadora
          </button>
          <button
            type="button"
            onClick={() => setActiveView('matrix_alm_status')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeView === 'matrix_alm_status'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Almacén vs Sim Status
          </button>
          <button
            type="button"
            onClick={() => setActiveView('matrix_custom')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
              activeView === 'matrix_custom'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Matriz Personalizada</span>
          </button>
        </div>

        {activeView === 'matrix_custom' && (
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1">
              <span className="font-bold text-slate-700">Filas:</span>
              <select
                value={rowDimension}
                onChange={(e) => setRowDimension(e.target.value as PivotRowDimension)}
                className="bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-rose-500"
              >
                <option value="propietario">Propietario</option>
                <option value="operadora">Operadora</option>
                <option value="almacen">Almacén</option>
                <option value="simStatus">Sim Status</option>
                <option value="status">Status Operativo</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <span className="font-bold text-slate-700">Columnas:</span>
              <select
                value={colDimension}
                onChange={(e) => setColDimension(e.target.value as PivotColDimension)}
                className="bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-rose-500"
              >
                <option value="almacen">Almacén</option>
                <option value="operadora">Operadora</option>
                <option value="propietario">Propietario</option>
                <option value="simStatus">Sim Status</option>
                <option value="status">Status Operativo</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Render Matrices according to selection */}
      {activeView === 'matrix_prop_alm' && (
        renderPivotMatrix('propietario', 'almacen', 'Matriz de Distribución: Propietario vs Almacén', 'Stock de líneas agrupado por dueño de cuenta y ubicación física')
      )}
      {activeView === 'matrix_prop_op' && (
        renderPivotMatrix('propietario', 'operadora', 'Matriz de Líneas: Propietario vs Operadora', 'Distribución de líneas telefónicas por empresa y compañía de telecomunicaciones')
      )}
      {activeView === 'matrix_alm_status' && (
        renderPivotMatrix('almacen', 'simStatus', 'Matriz de Estado: Almacén vs Sim Status', 'Estado de operatividad (Activa / Inactiva) por cada almacén')
      )}
      {activeView === 'matrix_custom' && (
        renderPivotMatrix(rowDimension, colDimension, `Matriz Personalizada: ${dimensionLabels[rowDimension]} vs ${dimensionLabels[colDimension]}`)
      )}
    </div>
  );
};
