import React from 'react';
import { Truck, CheckCircle2, PackageCheck, Wrench, Radio, ShieldAlert } from 'lucide-react';
import { FlotaItem, GenericDrillDownContext } from '../types';
import { KpiCard } from './KpiCard';

interface FlotaKpiOverviewProps {
  items: FlotaItem[];
  allItems: FlotaItem[];
  onOpenDrillDown: (ctx: GenericDrillDownContext) => void;
}

export const FlotaKpiOverview: React.FC<FlotaKpiOverviewProps> = ({
  items = [],
  allItems = [],
  onOpenDrillDown,
}) => {
  const total = items.length;
  const totalAll = allItems.length;

  const instalados = items.filter(r => 
    r.status.toUpperCase().includes('INSTALADO') || r.almacen.toUpperCase().includes('COMERCIO')
  );
  
  const disponibles = items.filter(r => 
    r.status.toUpperCase().includes('DISPONIBLE') || r.almacen.toUpperCase().includes('PRINCIPAL') || r.almacen.toUpperCase().includes('REGIONAL')
  );

  const danados = items.filter(r => 
    r.status.toUpperCase().includes('DAÑADO') || r.status.toUpperCase().includes('DANADO') || r.status.toUpperCase().includes('RMA') || (r.observacion || '').toUpperCase().includes('DAÑADO') || (r.observacion || '').toUpperCase().includes('DANADO')
  );

  const revision = items.filter(r => 
    r.status.toUpperCase().includes('REVISION') || r.status.toUpperCase().includes('REVISIÓN') || (r.observacion || '').toUpperCase().includes('REVISION')
  );

  const robados = items.filter(r => 
    r.status.toUpperCase().includes('ROBADO') || (r.observacion || '').toUpperCase().includes('ROBADO')
  );

  const conSim = items.filter(r => 
    Boolean(r.simAsignada && r.simAsignada.trim().length > 3)
  );

  const pctInstalados = total > 0 ? ((instalados.length / total) * 100).toFixed(1) : '0';
  const pctDisponibles = total > 0 ? ((disponibles.length / total) * 100).toFixed(1) : '0';

  const kpis = [
    {
      id: 'kpi-flota-total',
      label: 'Total Flota',
      count: total,
      detail: total < totalAll ? `Filtrados de ${totalAll} totales` : 'Parque total registrado',
      detailClass: 'text-slate-500',
      countClass: 'text-slate-900',
      icon: Truck,
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      hoverBorder: 'hover:border-indigo-300',
      onClick: () => onOpenDrillDown({
        module: 'flota',
        title: 'Total Dispositivos de Flota & GPS',
        subtitle: `${total} equipos registrados en inventario`,
        filterDescription: 'Todos los registros de Flota/GPS filtrados',
        flotaRecords: items,
      }),
    },
    {
      id: 'kpi-flota-instalados',
      label: 'Instalados',
      count: instalados.length,
      detail: `${pctInstalados}% en operación`,
      detailClass: 'text-emerald-600 font-medium',
      countClass: 'text-emerald-700',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      hoverBorder: 'hover:border-emerald-300',
      onClick: () => onOpenDrillDown({
        module: 'flota',
        title: 'Equipos Instalados / En Comercio',
        subtitle: `${instalados.length} dispositivos operativos en vehículos o clientes`,
        filterDescription: 'Status: INSTALADO o Almacén: EN COMERCIO',
        flotaRecords: instalados,
      }),
    },
    {
      id: 'kpi-flota-disponibles',
      label: 'En Stock',
      count: disponibles.length,
      detail: `${pctDisponibles}% disponible`,
      detailClass: 'text-blue-600 font-medium',
      countClass: 'text-blue-700',
      icon: PackageCheck,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      hoverBorder: 'hover:border-blue-300',
      onClick: () => onOpenDrillDown({
        module: 'flota',
        title: 'Equipos Disponibles en Almacén',
        subtitle: `${disponibles.length} dispositivos listos para asignación`,
        filterDescription: 'Status: DISPONIBLE o Almacén Principal/Regional',
        flotaRecords: disponibles,
      }),
    },
    {
      id: 'kpi-flota-con-sim',
      label: 'Con SIM',
      count: conSim.length,
      detail: 'Telemetría conectada',
      detailClass: 'text-cyan-600 font-medium',
      countClass: 'text-cyan-700',
      icon: Radio,
      iconBg: 'bg-cyan-50',
      iconColor: 'text-cyan-600',
      hoverBorder: 'hover:border-cyan-300',
      onClick: () => onOpenDrillDown({
        module: 'flota',
        title: 'Equipos con SIM Card Vinculada',
        subtitle: `${conSim.length} dispositivos con enlace celular activo`,
        filterDescription: 'SIM Asignada no vacía',
        flotaRecords: conSim,
      }),
    },
    {
      id: 'kpi-flota-revision',
      label: 'En Revisión',
      count: revision.length,
      detail: 'Diagnóstico preventivo',
      detailClass: 'text-amber-600 font-medium',
      countClass: 'text-amber-700',
      icon: Wrench,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      hoverBorder: 'hover:border-amber-300',
      onClick: () => onOpenDrillDown({
        module: 'flota',
        title: 'Equipos en Revisión Técnica',
        subtitle: `${revision.length} dispositivos en diagnóstico o mantenimiento`,
        filterDescription: 'Status: REVISIÓN',
        flotaRecords: revision,
      }),
    },
    {
      id: 'kpi-flota-danados',
      label: 'Dañados / Robados',
      count: danados.length + robados.length,
      detail: `${danados.length} daño / ${robados.length} robado`,
      detailClass: 'text-rose-600 font-medium',
      countClass: 'text-rose-700',
      icon: ShieldAlert,
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-600',
      hoverBorder: 'hover:border-rose-300',
      onClick: () => onOpenDrillDown({
        module: 'flota',
        title: 'Equipos Dañados / RMA / Robados',
        subtitle: `${danados.length + robados.length} dispositivos no operativos`,
        filterDescription: 'Status: DAÑADO, RMA o ROBADO',
        flotaRecords: [...danados, ...robados],
      }),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {kpis.map(kpi => (
        <KpiCard key={kpi.id} {...kpi} />
      ))}
    </div>
  );
};