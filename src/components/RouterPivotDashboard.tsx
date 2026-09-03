import React, { useState } from 'react';
import { RouterItem, GenericDrillDownContext, RouterPivotRowDim, RouterPivotColDim } from '../types';
import { Table, ArrowUpDown, Layers, Cpu, Warehouse, CheckCircle2 } from 'lucide-react';

interface RouterPivotDashboardProps {
  items: RouterItem[];
  onOpenDrillDown: (ctx: GenericDrillDownContext) => void;
}

export const RouterPivotDashboard: React.FC<RouterPivotDashboardProps> = ({
  items,
  onOpenDrillDown,
}) => {
  const [activeView, setActiveView] = useState<'matrix_custom' | 'matrix_marca_alm' | 'matrix_marca_status' | 'matrix_modelo_alm' | 'matrix_alm_status2'>('matrix_marca_alm');
  const [rowDimension, setRowDimension] = useState<RouterPivotRowDim>('marca');
  const [colDimension, setColDimension] = useState<RouterPivotColDim>('almacen');

  const dimensionLabels: Record<string, string> = {
    marca: 'Marca',
    modelo: 'Modelo',
    almacen: 'Almacén',
    status: 'Status',
    condicion: 'Condición',
    status2: 'Status 2',
  };

  const getDimensionValue = (item: RouterItem, dim: RouterPivotRowDim | RouterPivotColDim): string => {
    switch (dim) {
      case 'marca':
        return item.marca || 'OTRA';
      case 'modelo':
        return item.modelo || 'DESCONOCIDO';
      case 'almacen':
        return item.almacen || 'SIN ALMACEN';
      case 'status':
        return item.status || 'SIN STATUS';
      case 'condicion':
        return item.condicion || 'NO DEFINIDA';
      case 'status2':
        return item.status2 || 'ACTIVO';
      default:
        return 'OTRO';
    }
  };

  const renderPivotMatrix = (
    rDim: RouterPivotRowDim,
    cDim: RouterPivotColDim,
    matrixTitle: string,
    matrixSubtitle?: string
  ) => {
    const rowKeys: string[] = Array.from(new Set<string>(items.map(i => getDimensionValue(i, rDim)))).sort();
    const colKeys: string[] = Array.from(new Set<string>(items.map(i => getDimensionValue(i, cDim)))).sort();

    const cellMap: Record<string, RouterItem[]> = {};
    const rowTotals: Record<string, RouterItem[]> = {};
    const colTotals: Record<string, RouterItem[]> = {};

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
            Haz click en cualquier valor para abrir el desglose
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-200">
                <th className="py-3 px-4 font-bold text-slate-800 uppercase tracking-wider text-[11px] min-w-[170px] sticky left-0 bg-slate-100/95 z-10">
                  {dimensionLabels[rDim]} ↓ / {dimensionLabels[cDim]} →
                </th>
                {colKeys.map(cKey => (
                  <th key={cKey} className="py-3 px-3.5 font-bold text-slate-700 text-center uppercase tracking-wider text-[11px] min-w-[100px] border-l border-slate-200/80">
                    {cKey}
                  </th>
                ))}
                <th className="py-3 px-4 font-bold text-slate-900 text-right uppercase tracking-wider text-[11px] min-w-[100px] bg-slate-200/80 border-l border-slate-300">
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
                            module: 'router',
                            title: `${dimensionLabels[rDim]}: ${rKey}`,
                            subtitle: `Todos los routers correspondientes a ${dimensionLabels[rDim]} ${rKey}`,
                            filterDescription: `${dimensionLabels[rDim]}: ${rKey}`,
                            routerRecords: totalRowItems,
                            appliedFilterTag: `r_${rKey}`,
                          })
                        }
                        className="text-left font-bold text-slate-800 hover:text-rose-700 hover:underline cursor-pointer flex items-center gap-1.5"
                      >
                        <span>{rKey}</span>
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
                                  module: 'router',
                                  title: `${rKey} en ${cKey}`,
                                  subtitle: `${dimensionLabels[rDim]}: ${rKey} | ${dimensionLabels[cDim]}: ${cKey}`,
                                  filterDescription: `${dimensionLabels[rDim]} = ${rKey} y ${dimensionLabels[cDim]} = ${cKey}`,
                                  routerRecords: cellItems,
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
                            module: 'router',
                            title: `Total ${rKey}`,
                            subtitle: `Todos los routers de ${dimensionLabels[rDim]} ${rKey}`,
                            filterDescription: `${dimensionLabels[rDim]}: ${rKey}`,
                            routerRecords: totalRowItems,
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
                            module: 'router',
                            title: `Total en ${cKey}`,
                            subtitle: `Todos los routers clasificados en ${dimensionLabels[cDim]} ${cKey}`,
                            filterDescription: `${dimensionLabels[cDim]}: ${cKey}`,
                            routerRecords: totalColItems,
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
                        module: 'router',
                        title: 'Total General de Routers',
                        subtitle: 'Todos los registros incluidos en la vista actual',
                        filterDescription: 'Todos los registros',
                        routerRecords: items,
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
            onClick={() => setActiveView('matrix_marca_alm')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeView === 'matrix_marca_alm'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Marca vs Almacén
          </button>
          <button
            type="button"
            onClick={() => setActiveView('matrix_marca_status')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeView === 'matrix_marca_status'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Marca vs Status
          </button>
          <button
            type="button"
            onClick={() => setActiveView('matrix_modelo_alm')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeView === 'matrix_modelo_alm'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Modelo vs Almacén
          </button>
          <button
            type="button"
            onClick={() => setActiveView('matrix_alm_status2')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeView === 'matrix_alm_status2'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Almacén vs Status 2
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
                onChange={(e) => setRowDimension(e.target.value as RouterPivotRowDim)}
                className="bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-rose-500"
              >
                <option value="marca">Marca</option>
                <option value="modelo">Modelo</option>
                <option value="almacen">Almacén</option>
                <option value="status">Status</option>
                <option value="condicion">Condición</option>
                <option value="status2">Status 2</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <span className="font-bold text-slate-700">Columnas:</span>
              <select
                value={colDimension}
                onChange={(e) => setColDimension(e.target.value as RouterPivotColDim)}
                className="bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-rose-500"
              >
                <option value="almacen">Almacén</option>
                <option value="status">Status</option>
                <option value="marca">Marca</option>
                <option value="modelo">Modelo</option>
                <option value="status2">Status 2</option>
                <option value="condicion">Condición</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Render Matrices according to selection */}
      {activeView === 'matrix_marca_alm' && (
        renderPivotMatrix('marca', 'almacen', 'Matriz de Distribución: Marca vs Almacén', 'Cantidad de routers por fabricante y almacén físico')
      )}
      {activeView === 'matrix_marca_status' && (
        renderPivotMatrix('marca', 'status', 'Matriz de Estado: Marca vs Status', 'Estado operativo (Instalado, Disponible, Usado) por marca')
      )}
      {activeView === 'matrix_modelo_alm' && (
        renderPivotMatrix('modelo', 'almacen', 'Matriz por Modelo: Modelo vs Almacén', 'Desglose detallado por modelo de router (RUT240, TRB245, etc.)')
      )}
      {activeView === 'matrix_alm_status2' && (
        renderPivotMatrix('almacen', 'status2', 'Matriz de Condición Operativa: Almacén vs Status 2', 'Activos, Cortes preventivos y retiros según ubicación')
      )}
      {activeView === 'matrix_custom' && (
        renderPivotMatrix(rowDimension, colDimension, `Matriz Personalizada: ${dimensionLabels[rowDimension]} vs ${dimensionLabels[colDimension]}`)
      )}
    </div>
  );
};
