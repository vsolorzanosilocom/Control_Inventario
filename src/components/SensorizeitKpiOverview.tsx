import React from 'react';
import { Cpu, CheckCircle2, PackageCheck, AlertOctagon, Activity, Radio, Zap, BatteryLow } from 'lucide-react';
import { SensorizeitItem, GenericDrillDownContext } from '../types';

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

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* 1. TOTAL SENSORIZEIT */}
      <div
        id="kpi-sensorizeit-total"
        onClick={() => onOpenDrillDown({
          module: 'sensorizeit',
          title: 'Total Dispositivos SensorizeIt / IoT',
          subtitle: `${total} equipos registrados en inventario`,
          filterDescription: 'Todos los registros de SensorizeIt filtrados',
          sensorizeitRecords: items,
        })}
        className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Equipos</span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-slate-900">{total}</div>
          <div className="text-xs text-slate-500 mt-0.5">
            {total < totalAll ? `Filtrados de ${totalAll} totales` : 'Parque IoT global'}
          </div>
        </div>
      </div>

      {/* 2. INSTALADOS / EN COMERCIO */}
      <div
        id="kpi-sensorizeit-instalados"
        onClick={() => onOpenDrillDown({
          module: 'sensorizeit',
          title: 'Equipos Instalados en Comercio',
          subtitle: `${instalados.length} dispositivos operativos en sedes de clientes`,
          filterDescription: 'Status: INSTALADO o Almacén: EN COMERCIO',
          sensorizeitRecords: instalados,
        })}
        className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Instalados</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-emerald-700">{instalados.length}</div>
          <div className="text-xs text-emerald-600 font-medium mt-0.5">{pctInstalados}% en despliegue</div>
        </div>
      </div>

      {/* 3. DISPONIBLES EN STOCK */}
      <div
        id="kpi-sensorizeit-disponibles"
        onClick={() => onOpenDrillDown({
          module: 'sensorizeit',
          title: 'Equipos Disponibles en Almacén',
          subtitle: `${disponibles.length} dispositivos listos para instalación`,
          filterDescription: 'Status: DISPONIBLE o Almacén Principal/Regional/Empacado',
          sensorizeitRecords: disponibles,
        })}
        className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Disponibles</span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
            <PackageCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-blue-700">{disponibles.length}</div>
          <div className="text-xs text-blue-600 font-medium mt-0.5">{pctDisponibles}% en bodega</div>
        </div>
      </div>

      {/* 4. GATEWAYS LORAWAN */}
      <div
        id="kpi-sensorizeit-gateways"
        onClick={() => onOpenDrillDown({
          module: 'sensorizeit',
          title: 'Gateways LoRaWAN y Concentradores',
          subtitle: `${gateways.length} estaciones base registradas`,
          filterDescription: 'Tipo de Sensor: GATEWAY (Dragino LPS8N, DLOS8, LG308)',
          sensorizeitRecords: gateways,
        })}
        className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md hover:border-violet-300 transition-all cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gateways</span>
          <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600 group-hover:scale-110 transition-transform">
            <Radio className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-violet-700">{gateways.length}</div>
          <div className="text-xs text-violet-600 font-medium mt-0.5">Infraestructura LoRa</div>
        </div>
      </div>

      {/* 5. MEDIDORES, UPS & SWITCHES */}
      <div
        id="kpi-sensorizeit-medidores"
        onClick={() => onOpenDrillDown({
          module: 'sensorizeit',
          title: 'Medidores Eléctricos, Mini UPS & Switches',
          subtitle: `${medidoresYUps.length} equipos Shelly, Marsriva y Dahua`,
          filterDescription: 'Tipo de Sensor: Medidor Eléctrico, Mini UPS, Switch',
          sensorizeitRecords: medidoresYUps,
        })}
        className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Energía / Red</span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-amber-700">{medidoresYUps.length}</div>
          <div className="text-xs text-amber-600 font-medium mt-0.5">Shelly / UPS / Switch</div>
        </div>
      </div>

      {/* 6. DAÑADOS / SIN PILA */}
      <div
        id="kpi-sensorizeit-danados"
        onClick={() => onOpenDrillDown({
          module: 'sensorizeit',
          title: 'Equipos Dañados o Sin Pila',
          subtitle: `${danadosOSinPila.length} dispositivos en alerta técnica`,
          filterDescription: 'Status o Observación: DAÑADO o SIN PILA',
          sensorizeitRecords: danadosOSinPila,
        })}
        className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md hover:border-rose-300 transition-all cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dañados / Sin Pila</span>
          <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
            <BatteryLow className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-rose-700">{danadosOSinPila.length}</div>
          <div className="text-xs text-rose-600 font-medium mt-0.5">Requieren atención</div>
        </div>
      </div>
    </div>
  );
};
