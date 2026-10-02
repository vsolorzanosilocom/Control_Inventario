import React from 'react';
import { CheckCircle2, PackageCheck, Activity, Radio, Zap, BatteryLow } from 'lucide-react';
import { SensorizeitItem, GenericDrillDownContext } from '../types';
import { KpiCard } from './KpiCard';

interface SensorizeitKpiOverviewProps {
  items: SensorizeitItem[];
  allItems: SensorizeitItem[];
  onOpenDrillDown: (ctx: GenericDrillDownContext) => void;
}

export const SensorizeitKpiOverview: React.FC<SensorizeitKpiOverviewProps> = ({
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
    r.status.toUpperCase().includes('DISPONIBLE') || r.almacen.toUpperCase().includes('PRINCIPAL') || r.almacen.toUpperCase().includes('REGIONAL') || r.almacen.toUpperCase().includes('EMPACADO')
  );

  const danadosOSinPila = items.filter(r => 
    r.status.toUpperCase().includes('DAÑADO') || 
    r.status.toUpperCase().includes('DANADO') || 
    r.status.toUpperCase().includes('SIN PILA') || 
    (r.observacion || '').toUpperCase().includes('DAÑADO') ||
    (r.observacion || '').toUpperCase().includes('DANADO') ||
    (r.observacion || '').toUpperCase().includes('SIN PILA')
  );

  const gateways = items.filter(r => 
    r.tipoSensor.toUpperCase().includes('GATEWAY') || r.modelo.toUpperCase().includes('LPS8') || r.modelo.toUpperCase().includes('DLOS') || r.modelo.toUpperCase().includes('LG308')
  );

  const medidoresYUps = items.filter(r => 
    r.tipoSensor.toUpperCase().includes('MEDIDOR') || r.tipoSensor.toUpperCase().includes('UPS') || r.tipoSensor.toUpperCase().includes('SWITCH')
  );

  const pctInstalados = total > 0 ? ((instalados.length / total) * 100).toFixed(1) : '0';
  const pctDisponibles = total > 0 ? ((disponibles.length / total) * 100).toFixed(1) : '0';

  const kpis = [
    {
      id: 'kpi-sensorizeit-total',
      label: 'Total Equipos',
      count: total,
      detail: total < totalAll ? `Filtrados de ${totalAll} totales` : 'Parque IoT global',
      detailClass: 'text-slate-500',
      countClass: 'text-slate-900',
      icon: Activity,
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      hoverBorder: 'hover:border-indigo-300',
      onClick: () => onOpenDrillDown({
        module: 'sensorizeit',
        title: 'Total Dispositivos SensorizeIt / IoT',
        subtitle: `${total} equipos registrados en inventario`,
        filterDescription: 'Todos los registros de SensorizeIt filtrados',
        sensorizeitRecords: items,
      }),
    },
    {
      id: 'kpi-sensorizeit-instalados',
      label: 'Instalados',
      count: instalados.length,
      detail: `${pctInstalados}% en despliegue`,
      detailClass: 'text-emerald-600 font-medium',
      countClass: 'text-emerald-700',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      hoverBorder: 'hover:border-emerald-300',
      onClick: () => onOpenDrillDown({
        module: 'sensorizeit',
        title: 'Equipos Instalados en Comercio',
        subtitle: `${instalados.length} dispositivos operativos en sedes de clientes`,
        filterDescription: 'Status: INSTALADO o Almacén: EN COMERCIO',
        sensorizeitRecords: instalados,
      }),
    },
    {
      id: 'kpi-sensorizeit-disponibles',
      label: 'Disponibles',
      count: disponibles.length,
      detail: `${pctDisponibles}% en bodega`,
      detailClass: 'text-blue-600 font-medium',
      countClass: 'text-blue-700',
      icon: PackageCheck,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      hoverBorder: 'hover:border-blue-300',
      onClick: () => onOpenDrillDown({
        module: 'sensorizeit',
        title: 'Equipos Disponibles en Almacén',
        subtitle: `${disponibles.length} dispositivos listos para instalación`,
        filterDescription: 'Status: DISPONIBLE o Almacén Principal/Regional/Empacado',
        sensorizeitRecords: disponibles,
      }),
    },
    {
      id: 'kpi-sensorizeit-gateways',
      label: 'Gateways',
      count: gateways.length,
      detail: 'Infraestructura LoRa',
      detailClass: 'text-violet-600 font-medium',
      countClass: 'text-violet-700',
      icon: Radio,
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
      hoverBorder: 'hover:border-violet-300',
      onClick: () => onOpenDrillDown({
        module: 'sensorizeit',
        title: 'Gateways LoRaWAN y Concentradores',
        subtitle: `${gateways.length} estaciones base registradas`,
        filterDescription: 'Tipo de Sensor: GATEWAY (Dragino LPS8N, DLOS8, LG308)',
        sensorizeitRecords: gateways,
      }),
    },
    {
      id: 'kpi-sensorizeit-medidores',
      label: 'Energía / Red',
      count: medidoresYUps.length,
      detail: 'Shelly / UPS / Switch',
      detailClass: 'text-amber-600 font-medium',
      countClass: 'text-amber-700',
      icon: Zap,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      hoverBorder: 'hover:border-amber-300',
      onClick: () => onOpenDrillDown({
        module: 'sensorizeit',
        title: 'Medidores Eléctricos, Mini UPS & Switches',
        subtitle: `${medidoresYUps.length} equipos Shelly, Marsriva y Dahua`,
        filterDescription: 'Tipo de Sensor: Medidor Eléctrico, Mini UPS, Switch',
        sensorizeitRecords: medidoresYUps,
      }),
    },
    {
      id: 'kpi-sensorizeit-danados',
      label: 'Dañados / Sin Pila',
      count: danadosOSinPila.length,
      detail: 'Requieren atención',
      detailClass: 'text-rose-600 font-medium',
      countClass: 'text-rose-700',
      icon: BatteryLow,
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-600',
      hoverBorder: 'hover:border-rose-300',
      onClick: () => onOpenDrillDown({
        module: 'sensorizeit',
        title: 'Equipos Dañados o Sin Pila',
        subtitle: `${danadosOSinPila.length} dispositivos en alerta técnica`,
        filterDescription: 'Status o Observación: DAÑADO o SIN PILA',
        sensorizeitRecords: danadosOSinPila,
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