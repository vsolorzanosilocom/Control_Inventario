import React from 'react';
import { RouterItem, GenericDrillDownContext } from '../types';
import { Cpu, CheckCircle2, Warehouse, AlertCircle, Wrench, ShieldAlert, Radio } from 'lucide-react';

interface RouterKpiOverviewProps {
  items: RouterItem[];
  allItems: RouterItem[];
  onOpenDrillDown: (ctx: GenericDrillDownContext) => void;
}

export const RouterKpiOverview: React.FC<RouterKpiOverviewProps> = ({
  items,
  allItems,
  onOpenDrillDown,
}) => {
  const total = items.length;
  const totalAll = allItems.length;

  // Calculos de KPIs para Routers
  const enComercio = items.filter(i => i.almacen.toUpperCase().includes('COMERCIO') || i.status.toUpperCase() === 'INSTALADO');
  const disponibles = items.filter(i => i.status.toUpperCase().includes('DISPONIBLE') || i.status2.toUpperCase().includes('DISPONIBLE'));
  const usados = items.filter(i => i.status.toUpperCase().includes('USADO') || i.status2.toUpperCase().includes('USADO'));
  const pruebasOPrestamo = items.filter(i => i.status.toUpperCase().includes('PRUEBA') || i.status.toUpperCase().includes('PRESTAMO'));
  const cortePreventivo = items.filter(i => i.status2.toUpperCase().includes('CORTE') || i.status2.toUpperCase().includes('RETIRAR'));

  const kpis = [
    {
      id: 'kpi-total-routers',
      title: 'TOTAL ROUTERS',
      subtitle: total < totalAll ? `Filtrados de ${totalAll} totales` : 'Parque total de routers',
      count: total,
      icon: Cpu,
      color: 'bg-slate-900 text-white',
      accentColor: 'text-rose-400',
      badgeColor: 'bg-rose-950/60 text-rose-300 border-rose-800/60',
      records: items,
      filterDesc: 'Total de registros seleccionados',
    },
    {
      id: 'kpi-en-comercio',
      title: 'EN COMERCIO / INSTALADOS',
      subtitle: `${((enComercio.length / (total || 1)) * 100).toFixed(1)}% del inventario`,
      count: enComercio.length,
      icon: CheckCircle2,
      color: 'bg-emerald-700 text-white',
      accentColor: 'text-emerald-200',
      badgeColor: 'bg-emerald-900/60 text-emerald-300 border-emerald-700/60',
      records: enComercio,
      filterDesc: 'Routers asignados o instalados en comercio',
    },
    {
      id: 'kpi-disponibles',
      title: 'DISPONIBLES EN STOCK',
      subtitle: 'En almacén listos para despacho',
      count: disponibles.length,
      icon: Warehouse,
      color: 'bg-blue-700 text-white',
      accentColor: 'text-blue-200',
      badgeColor: 'bg-blue-900/60 text-blue-300 border-blue-700/60',
      records: disponibles,
      filterDesc: 'Routers disponibles en stock',
    },
    {
      id: 'kpi-usados',
      title: 'USADOS / EN DEPÓSITO',
      subtitle: 'Equipos desincorporados o usados',
      count: usados.length,
      icon: Wrench,
      color: 'bg-amber-700 text-white',
      accentColor: 'text-amber-200',
      badgeColor: 'bg-amber-900/60 text-amber-300 border-amber-700/60',
      records: usados,
      filterDesc: 'Routers en condición usado o depósito',
    },
    {
      id: 'kpi-pruebas',
      title: 'PRUEBAS / PRÉSTAMOS',
      subtitle: 'Nodos, pilotos y demostraciones',
      count: pruebasOPrestamo.length,
      icon: Radio,
      color: 'bg-violet-800 text-white',
      accentColor: 'text-violet-200',
      badgeColor: 'bg-violet-950/60 text-violet-300 border-violet-800/60',
      records: pruebasOPrestamo,
      filterDesc: 'Routers en pruebas, nodos o préstamos',
    },
    {
      id: 'kpi-cortes',
      title: 'CORTE / POR RETIRAR',
      subtitle: 'Atención técnica o administrativa',
      count: cortePreventivo.length,
      icon: ShieldAlert,
      color: 'bg-rose-800 text-white',
      accentColor: 'text-rose-200',
      badgeColor: 'bg-rose-950/60 text-rose-300 border-rose-800/60',
      records: cortePreventivo,
      filterDesc: 'Routers con corte preventivo o retiro pendiente',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <button
            key={kpi.id}
            type="button"
            onClick={() =>
              onOpenDrillDown({
                module: 'router',
                title: kpi.title,
                subtitle: kpi.subtitle,
                filterDescription: kpi.filterDesc,
                routerRecords: kpi.records,
                appliedFilterTag: kpi.id,
              })
            }
            className={`${kpi.color} p-4 rounded-xl shadow-xs text-left relative overflow-hidden transition-all hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer group flex flex-col justify-between`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-90">
                  {kpi.title}
                </span>
                <Icon className={`w-4 h-4 ${kpi.accentColor} opacity-80 group-hover:opacity-100 transition-opacity`} />
              </div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight leading-none mb-1">
                {kpi.count.toLocaleString()}
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
              <span className="text-[10px] opacity-80 truncate" title={kpi.subtitle}>
                {kpi.subtitle}
              </span>
              <span className="text-[9px] font-bold underline opacity-90 group-hover:opacity-100 ml-1 shrink-0">
                Ver detalle →
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
