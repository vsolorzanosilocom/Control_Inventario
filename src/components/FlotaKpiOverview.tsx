import React from 'react';
import { Truck, CheckCircle2, PackageCheck, AlertOctagon, Wrench, Radio, ShieldAlert } from 'lucide-react';
import { FlotaItem, GenericDrillDownContext } from '../types';

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

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* 1. TOTAL FLOTA */}
      <div
        id="kpi-flota-total"
        onClick={() => onOpenDrillDown({
          module: 'flota',
          title: 'Total Dispositivos de Flota & GPS',
          subtitle: `${total} equipos registrados en inventario`,
          filterDescription: 'Todos los registros de Flota/GPS filtrados',
          flotaRecords: items,
        })}
        className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Flota</span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
            <Truck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-slate-900">{total}</div>
          <div className="text-xs text-slate-500 mt-0.5">
            {total < totalAll ? `Filtrados de ${totalAll} totales` : 'Parque total registrado'}
          </div>
        </div>
      </div>

      {/* 2. INSTALADOS / EN COMERCIO */}
      <div
        id="kpi-flota-instalados"
        onClick={() => onOpenDrillDown({
          module: 'flota',
          title: 'Equipos Instalados / En Comercio',
          subtitle: `${instalados.length} dispositivos operativos en vehículos o clientes`,
          filterDescription: 'Status: INSTALADO o Almacén: EN COMERCIO',
          flotaRecords: instalados,
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
          <div className="text-xs text-emerald-600 font-medium mt-0.5">{pctInstalados}% en operación</div>
        </div>
      </div>

      {/* 3. DISPONIBLES EN STOCK */}
      <div
        id="kpi-flota-disponibles"
        onClick={() => onOpenDrillDown({
          module: 'flota',
          title: 'Equipos Disponibles en Almacén',
          subtitle: `${disponibles.length} dispositivos listos para asignación`,
          filterDescription: 'Status: DISPONIBLE o Almacén Principal/Regional',
          flotaRecords: disponibles,
        })}
        className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">En Stock</span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
            <PackageCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-blue-700">{disponibles.length}</div>
          <div className="text-xs text-blue-600 font-medium mt-0.5">{pctDisponibles}% disponible</div>
        </div>
      </div>

      {/* 4. CON SIM ASIGNADA */}
      <div
        id="kpi-flota-con-sim"
        onClick={() => onOpenDrillDown({
          module: 'flota',
          title: 'Equipos con SIM Card Vinculada',
          subtitle: `${conSim.length} dispositivos con enlace celular activo`,
          filterDescription: 'SIM Asignada no vacía',
          flotaRecords: conSim,
        })}
        className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md hover:border-cyan-300 transition-all cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Con SIM</span>
          <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600 group-hover:scale-110 transition-transform">
            <Radio className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-cyan-700">{conSim.length}</div>
          <div className="text-xs text-cyan-600 font-medium mt-0.5">Telemetría conectada</div>
        </div>
      </div>

      {/* 5. EN REVISIÓN */}
      <div
        id="kpi-flota-revision"
        onClick={() => onOpenDrillDown({
          module: 'flota',
          title: 'Equipos en Revisión Técnica',
          subtitle: `${revision.length} dispositivos en diagnóstico o mantenimiento`,
          filterDescription: 'Status: REVISIÓN',
          flotaRecords: revision,
        })}
        className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">En Revisión</span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
            <Wrench className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-amber-700">{revision.length}</div>
          <div className="text-xs text-amber-600 font-medium mt-0.5">Diagnóstico preventivo</div>
        </div>
      </div>

      {/* 6. DAÑADOS / RMA / ROBADOS */}
      <div
        id="kpi-flota-danados"
        onClick={() => onOpenDrillDown({
          module: 'flota',
          title: 'Equipos Dañados / RMA / Robados',
          subtitle: `${danados.length + robados.length} dispositivos no operativos`,
          filterDescription: 'Status: DAÑADO, RMA o ROBADO',
          flotaRecords: [...danados, ...robados],
        })}
        className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md hover:border-rose-300 transition-all cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dañados / Robados</span>
          <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-rose-700">{danados.length + robados.length}</div>
          <div className="text-xs text-rose-600 font-medium mt-0.5">{danados.length} daño / {robados.length} robado</div>
        </div>
      </div>
    </div>
  );
};
