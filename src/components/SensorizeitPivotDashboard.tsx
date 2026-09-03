import React, { useState, useMemo } from 'react';
import { Table, SlidersHorizontal, ArrowUpDown, ChevronRight, Layers, Activity } from 'lucide-react';
import { SensorizeitItem, GenericDrillDownContext, SensorizeitPivotRowDim, SensorizeitPivotColDim } from '../types';

interface SensorizeitPivotDashboardProps {
  items: SensorizeitItem[];
  onOpenDrillDown: (ctx: GenericDrillDownContext) => void;
}

export const SensorizeitPivotDashboard: React.FC<SensorizeitPivotDashboardProps> = ({
  items = [],
  onOpenDrillDown,
}) => {
  const [activeTab, setActiveTab] = useState<'preset' | 'custom'>('preset');
  const [activePreset, setActivePreset] = useState<'tipo_almacen' | 'modelo_almacen' | 'tipo_status' | 'marca_tipo'>('tipo_almacen');

  // Configuración de la Matriz Personalizada
  const [customRowDim, setCustomRowDim] = useState<SensorizeitPivotRowDim>('tipoSensor');
  const [customColDim, setCustomColDim] = useState<SensorizeitPivotColDim>('almacen');

  const dimensionLabels: Record<SensorizeitPivotRowDim | SensorizeitPivotColDim, string> = {
    tipoSensor: 'Tipo de Sensor',
    modelo: 'Modelo',
    almacen: 'Almacén',
    status: 'Status',
    marca: 'Marca',
    comercio: 'Comercio',
  };

  const getDimensionValue = (item: SensorizeitItem, dim: SensorizeitPivotRowDim | SensorizeitPivotColDim): string => {
    switch (dim) {
      case 'tipoSensor': return item.tipoSensor || 'SIN TIPO';
      case 'modelo': return item.modelo || 'SIN MODELO';
      case 'almacen': return item.almacen || 'SIN ALMACEN';
      case 'status': return item.status || 'SIN STATUS';
      case 'marca': return item.marca || 'SIN MARCA';
      case 'comercio': return item.comercio || 'SIN COMERCIO';
      default: return 'OTRO';
    }
  };

  const buildPivotTable = (rowDim: SensorizeitPivotRowDim, colDim: SensorizeitPivotColDim) => {
    const rowValuesSet = new Set<string>();
    const colValuesSet = new Set<string>();
    const matrix: Record<string, Record<string, SensorizeitItem[]>> = {};

    (items || []).forEach(r => {
      const rowVal = getDimensionValue(r, rowDim);
      const colVal = getDimensionValue(r, colDim);

      rowValuesSet.add(rowVal);
      colValuesSet.add(colVal);

      if (!matrix[rowVal]) matrix[rowVal] = {};
      if (!matrix[rowVal][colVal]) matrix[rowVal][colVal] = [];
      matrix[rowVal][colVal].push(r);
    });

    const rowValues = Array.from(rowValuesSet).sort();
    const colValues = Array.from(colValuesSet).sort();

    const rowTotals: Record<string, number> = {};
    const colTotals: Record<string, number> = {};
    let grandTotal = 0;

    rowValues.forEach(r => {
      rowTotals[r] = 0;
      colValues.forEach(c => {
        const count = matrix[r]?.[c]?.length || 0;
        rowTotals[r] += count;
        colTotals[c] = (colTotals[c] || 0) + count;
        grandTotal += count;
      });
    });

    return { rowValues, colValues, matrix, rowTotals, colTotals, grandTotal };
  };

  const currentPivotConfig = useMemo(() => {
    if (activeTab === 'custom') {
      return { rowDim: customRowDim, colDim: customColDim };
    }
    switch (activePreset) {
      case 'tipo_almacen':
        return { rowDim: 'tipoSensor' as SensorizeitPivotRowDim, colDim: 'almacen' as SensorizeitPivotColDim };
      case 'modelo_almacen':
        return { rowDim: 'modelo' as SensorizeitPivotRowDim, colDim: 'almacen' as SensorizeitPivotColDim };
      case 'tipo_status':
        return { rowDim: 'tipoSensor' as SensorizeitPivotRowDim, colDim: 'status' as SensorizeitPivotColDim };
      case 'marca_tipo':
        return { rowDim: 'marca' as SensorizeitPivotRowDim, colDim: 'tipoSensor' as SensorizeitPivotColDim };
    }
  }, [activeTab, activePreset, customRowDim, customColDim]);

  const pivotData = useMemo(() => {
    return buildPivotTable(currentPivotConfig.rowDim, currentPivotConfig.colDim);
  }, [items, currentPivotConfig]);

  const handleCellClick = (rowVal: string, colVal: string, cellItems: SensorizeitItem[]) => {
    if (cellItems.length === 0) return;
    onOpenDrillDown({
      module: 'sensorizeit',
      title: `${dimensionLabels[currentPivotConfig.rowDim]}: ${rowVal} × ${dimensionLabels[currentPivotConfig.colDim]}: ${colVal}`,
      subtitle: `${cellItems.length} dispositivos encontrados`,
      filterDescription: `${dimensionLabels[currentPivotConfig.rowDim]} = "${rowVal}" y ${dimensionLabels[currentPivotConfig.colDim]} = "${colVal}"`,
      sensorizeitRecords: cellItems,
    });
  };

  const handleRowTotalClick = (rowVal: string) => {
    const rowItems = (items || []).filter(r => getDimensionValue(r, currentPivotConfig.rowDim) === rowVal);
    if (rowItems.length === 0) return;
    onOpenDrillDown({
      module: 'sensorizeit',
      title: `Total ${dimensionLabels[currentPivotConfig.rowDim]}: ${rowVal}`,
      subtitle: `${rowItems.length} dispositivos en esta categoría`,
      filterDescription: `${dimensionLabels[currentPivotConfig.rowDim]} = "${rowVal}"`,
      sensorizeitRecords: rowItems,
    });
  };

  const handleColTotalClick = (colVal: string) => {
    const colItems = (items || []).filter(r => getDimensionValue(r, currentPivotConfig.colDim) === colVal);
    if (colItems.length === 0) return;
    onOpenDrillDown({
      module: 'sensorizeit',
      title: `Total ${dimensionLabels[currentPivotConfig.colDim]}: ${colVal}`,
      subtitle: `${colItems.length} dispositivos en esta categoría`,
      filterDescription: `${dimensionLabels[currentPivotConfig.colDim]} = "${colVal}"`,
      sensorizeitRecords: colItems,
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      {/* Header & Controls */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Table className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Tabla Dinámica / Matriz de SensorizeIt
            </h3>
            <p className="text-xs text-slate-500">
              Cruce multidimensional de sensores, modelos, tipos y almacenes
            </p>
          </div>
        </div>

        {/* Tab switcher: Vistas Rápidas vs Personalizada */}
        <div className="flex items-center bg-slate-200/70 p-1 rounded-lg text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('preset')}
            className={`px-3 py-1 rounded-md transition-all ${
              activeTab === 'preset'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Vistas Predefinidas
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`px-3 py-1 rounded-md transition-all ${
              activeTab === 'custom'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Matriz Personalizada
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        {activeTab === 'preset' ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500 font-medium">Vistas sugeridas:</span>
            {[
              { id: 'tipo_almacen', label: 'Tipo Sensor × Almacén' },
              { id: 'modelo_almacen', label: 'Modelo × Almacén' },
              { id: 'tipo_status', label: 'Tipo Sensor × Status' },
              { id: 'marca_tipo', label: 'Marca × Tipo Sensor' },
            ].map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActivePreset(p.id as typeof activePreset)}
                className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
                  activePreset === p.id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-medium">Filas (Vertical):</span>
              <select
                value={customRowDim}
                onChange={e => setCustomRowDim(e.target.value as SensorizeitPivotRowDim)}
                className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="tipoSensor">Tipo de Sensor</option>
                <option value="modelo">Modelo</option>
                <option value="almacen">Almacén</option>
                <option value="status">Status</option>
                <option value="marca">Marca</option>
                <option value="comercio">Comercio</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-medium">Columnas (Horizontal):</span>
              <select
                value={customColDim}
                onChange={e => setCustomColDim(e.target.value as SensorizeitPivotColDim)}
                className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="almacen">Almacén</option>
                <option value="status">Status</option>
                <option value="tipoSensor">Tipo de Sensor</option>
                <option value="modelo">Modelo</option>
                <option value="marca">Marca</option>
              </select>
            </div>
          </div>
        )}

        <div className="text-slate-500 text-[11px] font-medium ml-auto">
          Total analizado: <span className="font-bold text-slate-800">{pivotData.grandTotal}</span> equipos
        </div>
      </div>

      {/* Pivot Table Rendering */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white border-b border-slate-800 select-none">
              <th className="py-2.5 px-4 font-bold text-slate-200 sticky left-0 z-10 bg-slate-900 min-w-[160px] border-r border-slate-800">
                {dimensionLabels[currentPivotConfig.rowDim]} \ {dimensionLabels[currentPivotConfig.colDim]}
              </th>
              {pivotData.colValues.map(col => (
                <th
                  key={col}
                  onClick={() => handleColTotalClick(col)}
                  className="py-2.5 px-3 font-semibold text-center hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap min-w-[90px]"
                  title={`Clic para ver todos de ${col}`}
                >
                  <div className="text-slate-200">{col}</div>
                  <div className="text-[10px] text-slate-400 font-normal">
                    {pivotData.colTotals[col] || 0}
                  </div>
                </th>
              ))}
              <th className="py-2.5 px-4 font-bold text-center bg-slate-950 text-indigo-300 min-w-[90px]">
                TOTAL
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {pivotData.rowValues.length === 0 ? (
              <tr>
                <td colSpan={pivotData.colValues.length + 2} className="py-8 text-center text-slate-400">
                  No hay registros disponibles para generar la tabla dinámica con los filtros actuales.
                </td>
              </tr>
            ) : (
              pivotData.rowValues.map((row, rIdx) => {
                const isEven = rIdx % 2 === 0;
                return (
                  <tr
                    key={row}
                    className={`hover:bg-indigo-50/40 transition-colors ${
                      isEven ? 'bg-white' : 'bg-slate-50/60'
                    }`}
                  >
                    <td
                      onClick={() => handleRowTotalClick(row)}
                      className="py-2 px-4 font-bold text-slate-800 sticky left-0 z-10 bg-inherit border-r border-slate-200 hover:text-indigo-700 cursor-pointer whitespace-nowrap"
                      title={`Clic para ver todos de ${row}`}
                    >
                      {row}
                    </td>

                    {pivotData.colValues.map(col => {
                      const cellItems = pivotData.matrix[row]?.[col] || [];
                      const count = cellItems.length;

                      return (
                        <td
                          key={col}
                          onClick={() => handleCellClick(row, col, cellItems)}
                          className={`py-2 px-3 text-center transition-colors ${
                            count > 0
                              ? 'hover:bg-indigo-100 text-slate-900 font-bold cursor-pointer'
                              : 'text-slate-300 font-normal select-none'
                          }`}
                        >
                          {count > 0 ? (
                            <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 hover:bg-indigo-600 hover:text-white transition-all text-xs font-bold text-slate-800">
                              {count}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                      );
                    })}

                    <td
                      onClick={() => handleRowTotalClick(row)}
                      className="py-2 px-4 text-center font-extrabold text-indigo-700 bg-slate-100/70 hover:bg-indigo-100 cursor-pointer"
                    >
                      {pivotData.rowTotals[row] || 0}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot>
            <tr className="bg-slate-900 text-white font-bold border-t-2 border-slate-800">
              <td className="py-2.5 px-4 sticky left-0 z-10 bg-slate-900 border-r border-slate-800 text-slate-200">
                TOTAL GENERAL
              </td>
              {pivotData.colValues.map(col => (
                <td
                  key={col}
                  onClick={() => handleColTotalClick(col)}
                  className="py-2.5 px-3 text-center text-slate-200 hover:bg-slate-800 cursor-pointer"
                >
                  {pivotData.colTotals[col] || 0}
                </td>
              ))}
              <td className="py-2.5 px-4 text-center text-indigo-300 bg-slate-950 text-sm font-black">
                {pivotData.grandTotal}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
