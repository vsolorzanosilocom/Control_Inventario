import React from 'react';
import { SimCardItem, GenericDrillDownContext } from '../types';
import { Layers, Radio, Warehouse, CheckCircle, ShieldCheck } from 'lucide-react';

interface KpiOverviewProps {
  items: SimCardItem[];
  onOpenDrillDown: (ctx: GenericDrillDownContext) => void;
}

export const KpiOverview: React.FC<KpiOverviewProps> = ({ items, onOpenDrillDown }) => {
  const total = items.length;

  const disponibles = items.filter(
    i => i.status.toUpperCase().includes('DISPONIBLE') || i.almacen.toUpperCase().includes('ALMACEN')
  );
  
  const instalados = items.filter(
    i => i.status.toUpperCase().includes('INSTALADO') || i.almacen.toUpperCase().includes('COMERCIO')
  );

  const operadoraDigitel = items.filter(i => i.operadora.toUpperCase().includes('DIGITEL'));
  const operadoraMovistar = items.filter(i => i.operadora.toUpperCase().includes('MOVISTAR'));

  const propietarioSilocom = items.filter(i => i.propietario.toUpperCase().includes('SILOCOM'));
  const propietarioPlatco = items.filter(i => i.propietario.toUpperCase().includes('PLATCO'));

  const simStatusActiva = items.filter(i => i.simStatus.toUpperCase().includes('ACTIVA'));

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      
      {/* Total SIMs */}
      <div
        onClick={() =>
          onOpenDrillDown({
            module: 'sim',
            title: 'Inventario Total de SIM Cards',
            subtitle: 'Todos los registros bajo los filtros actuales',
            filterDescription: 'Total acumulado en RESUMEN DE SIMS',
            simRecords: items,
            appliedFilterTag: 'TOTAL',
          })
        }
        className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-sm hover:shadow-md hover:border-slate-400 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between text-slate-500 mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Total Stock</span>
          <Layers className="w-4 h-4 text-slate-700 group-hover:scale-110 transition-transform" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-slate-900 tracking-tight">{total}</span>
          <span className="text-[10px] text-slate-500 font-semibold">SIMs</span>
        </div>
        <div className="mt-2 text-[10px] text-slate-500 font-medium flex items-center justify-between border-t border-slate-100 pt-1.5">
          <span>Ver detalle</span>
          <span className="text-rose-700 font-bold group-hover:translate-x-0.5 transition-transform">→</span>
        </div>
      </div>

      {/* En Comercio / Instalado */}
      <div
        onClick={() =>
          onOpenDrillDown({
            module: 'sim',
            title: 'SIMs en Comercio / Instaladas',
            subtitle: 'Equipos operativos en puntos de comercio',
            filterDescription: 'Almacén = EN COMERCIO o Status = INSTALADO',
            simRecords: instalados,
            appliedFilterTag: 'INSTALADO_COMERCIO',
          })
        }
        className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between text-emerald-700 mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">En Comercio</span>
          <CheckCircle className="w-4 h-4 text-emerald-700 group-hover:scale-110 transition-transform" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-emerald-900 tracking-tight">{instalados.length}</span>
          <span className="text-[10px] text-emerald-700 font-bold">
            ({((instalados.length / (total || 1)) * 100).toFixed(0)}%)
          </span>
        </div>
        <div className="mt-2 text-[10px] text-emerald-700 font-medium flex items-center justify-between border-t border-emerald-50 pt-1.5">
          <span>Instalados en POS</span>
          <span className="text-emerald-800 font-bold group-hover:translate-x-0.5 transition-transform">→</span>
        </div>
      </div>

      {/* Disponibles en Almacén */}
      <div
        onClick={() =>
          onOpenDrillDown({
            module: 'sim',
            title: 'SIMs Disponibles en Almacén',
            subtitle: 'Tarjetas SIM listas para asignación',
            filterDescription: 'Status = DISPONIBLE o Almacén = ALMACEN',
            simRecords: disponibles,
            appliedFilterTag: 'DISPONIBLE',
          })
        }
        className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-sm hover:shadow-md hover:border-blue-400 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between text-blue-700 mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800">Disponibles</span>
          <Warehouse className="w-4 h-4 text-blue-700 group-hover:scale-110 transition-transform" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-blue-900 tracking-tight">{disponibles.length}</span>
          <span className="text-[10px] text-blue-700 font-bold">
            ({((disponibles.length / (total || 1)) * 100).toFixed(0)}%)
          </span>
        </div>
        <div className="mt-2 text-[10px] text-blue-700 font-medium flex items-center justify-between border-t border-blue-50 pt-1.5">
          <span>En Stock Almacén</span>
          <span className="text-blue-800 font-bold group-hover:translate-x-0.5 transition-transform">→</span>
        </div>
      </div>

      {/* Operadora Digitel vs Movistar */}
      <div
        onClick={() =>
          onOpenDrillDown({
            module: 'sim',
            title: 'SIMs Digitel',
            subtitle: 'Tarjetas correspondientes a la operadora Digitel',
            filterDescription: 'Operadora = DIGITEL',
            simRecords: operadoraDigitel,
            appliedFilterTag: 'DIGITEL',
          })
        }
        className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-sm hover:shadow-md hover:border-indigo-400 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between text-indigo-700 mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800">Digitel</span>
          <Radio className="w-4 h-4 text-indigo-700 group-hover:scale-110 transition-transform" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-indigo-900 tracking-tight">{operadoraDigitel.length}</span>
          <span className="text-[10px] text-indigo-600 font-medium">/ {operadoraMovistar.length} Movistar</span>
        </div>
        <div className="mt-2 text-[10px] text-indigo-700 font-medium flex items-center justify-between border-t border-indigo-50 pt-1.5">
          <span>{((operadoraDigitel.length / (total || 1)) * 100).toFixed(0)}% Digitel</span>
          <span className="text-indigo-800 font-bold group-hover:translate-x-0.5 transition-transform">→</span>
        </div>
      </div>

      {/* Propietario Silocom vs Platco */}
      <div
        onClick={() =>
          onOpenDrillDown({
            module: 'sim',
            title: 'SIMs Propias Silocom',
            subtitle: 'Líneas registradas a nombre de Silocom',
            filterDescription: 'Propietario = SILOCOM',
            simRecords: propietarioSilocom,
            appliedFilterTag: 'SILOCOM',
          })
        }
        className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-sm hover:shadow-md hover:border-rose-400 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between text-rose-700 mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">Silocom</span>
          <span className="text-xs font-black px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">Propio</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-rose-900 tracking-tight">{propietarioSilocom.length}</span>
          <span className="text-[10px] text-rose-600 font-medium">/ {propietarioPlatco.length} Platco</span>
        </div>
        <div className="mt-2 text-[10px] text-rose-700 font-medium flex items-center justify-between border-t border-rose-50 pt-1.5">
          <span>{((propietarioSilocom.length / (total || 1)) * 100).toFixed(0)}% Silocom</span>
          <span className="text-rose-800 font-bold group-hover:translate-x-0.5 transition-transform">→</span>
        </div>
      </div>

      {/* Sim Status Activas */}
      <div
        onClick={() =>
          onOpenDrillDown({
            module: 'sim',
            title: 'SIMs con Status ACTIVA',
            subtitle: 'Tarjetas con línea activa registrada',
            filterDescription: 'Sim Status = ACTIVA',
            simRecords: simStatusActiva,
            appliedFilterTag: 'SIM_ACTIVA',
          })
        }
        className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between text-emerald-700 mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Sim Status</span>
          <ShieldCheck className="w-4 h-4 text-emerald-700 group-hover:scale-110 transition-transform" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-emerald-900 tracking-tight">{simStatusActiva.length}</span>
          <span className="text-[10px] text-emerald-700 font-bold">Activas</span>
        </div>
        <div className="mt-2 text-[10px] text-emerald-700 font-medium flex items-center justify-between border-t border-emerald-50 pt-1.5">
          <span>{((simStatusActiva.length / (total || 1)) * 100).toFixed(0)}% del total</span>
          <span className="text-emerald-800 font-bold group-hover:translate-x-0.5 transition-transform">→</span>
        </div>
      </div>

    </div>
  );
};
