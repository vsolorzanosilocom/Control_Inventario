import React, { useState, useMemo } from 'react';
import { X, Search, Download, Copy, Check, Filter, Layers, Radio, Cpu, Truck, Activity } from 'lucide-react';
import { GenericDrillDownContext, SimCardItem, RouterItem, FlotaItem, SensorizeitItem } from '../types';

interface DrillDownModalProps {
  context: GenericDrillDownContext | null;
  onClose: () => void;
}

export const DrillDownModal: React.FC<DrillDownModalProps> = ({ context, onClose }) => {
  const [search, setSearch] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 50;

  const currentModule = context?.module || 'sim';
  const isSim = currentModule === 'sim';
  const isRouter = currentModule === 'router';
  const isFlota = currentModule === 'flota';
  const isSensorizeit = currentModule === 'sensorizeit';

  const simRecords = context?.simRecords || [];
  const routerRecords = context?.routerRecords || [];
  const flotaRecords = context?.flotaRecords || [];
  const sensorizeitRecords = context?.sensorizeitRecords || [];

  // Filter SIM records
  const filteredSimRecords = useMemo(() => {
    if (!isSim || !simRecords.length) return [];
    if (!search.trim()) return simRecords;
    const q = search.toLowerCase();
    return simRecords.filter(item =>
      item.serialSimcard.toLowerCase().includes(q) ||
      item.numeroTelefonico.toLowerCase().includes(q) ||
      item.direccionIp.toLowerCase().includes(q) ||
      item.operadora.toLowerCase().includes(q) ||
      item.propietario.toLowerCase().includes(q) ||
      item.comercio.toLowerCase().includes(q) ||
      item.almacen.toLowerCase().includes(q) ||
      item.status.toLowerCase().includes(q) ||
      item.simStatus.toLowerCase().includes(q) ||
      item.equipoAsignado.toLowerCase().includes(q) ||
      item.tecnicos.toLowerCase().includes(q) ||
      item.codCliente.toLowerCase().includes(q) ||
      item.procesador.toLowerCase().includes(q)
    );
  }, [isSim, simRecords, search]);

  // Filter Router records
  const filteredRouterRecords = useMemo(() => {
    if (!isRouter || !routerRecords.length) return [];
    if (!search.trim()) return routerRecords;
    const q = search.toLowerCase();
    return routerRecords.filter(item =>
      item.serial.toLowerCase().includes(q) ||
      item.imei.toLowerCase().includes(q) ||
      item.marca.toLowerCase().includes(q) ||
      item.modelo.toLowerCase().includes(q) ||
      item.comercio.toLowerCase().includes(q) ||
      item.almacen.toLowerCase().includes(q) ||
      item.status.toLowerCase().includes(q) ||
      item.condicion.toLowerCase().includes(q) ||
      item.tecnico.toLowerCase().includes(q) ||
      item.simAsignada.toLowerCase().includes(q) ||
      item.codCliente.toLowerCase().includes(q) ||
      item.status2.toLowerCase().includes(q)
    );
  }, [isRouter, routerRecords, search]);

  // Filter Flota records
  const filteredFlotaRecords = useMemo(() => {
    if (!isFlota || !flotaRecords.length) return [];
    if (!search.trim()) return flotaRecords;
    const q = search.toLowerCase();
    return flotaRecords.filter(item =>
      item.serial.toLowerCase().includes(q) ||
      item.imei.toLowerCase().includes(q) ||
      item.marca.toLowerCase().includes(q) ||
      item.modelo.toLowerCase().includes(q) ||
      item.comercio.toLowerCase().includes(q) ||
      item.almacen.toLowerCase().includes(q) ||
      item.status.toLowerCase().includes(q) ||
      item.operadora.toLowerCase().includes(q) ||
      item.tecnico.toLowerCase().includes(q) ||
      item.simAsignada.toLowerCase().includes(q) ||
      item.rifCliente.toLowerCase().includes(q) ||
      item.observacion.toLowerCase().includes(q)
    );
  }, [isFlota, flotaRecords, search]);

  // Filter SensorizeIt records
  const filteredSensorizeitRecords = useMemo(() => {
    if (!isSensorizeit || !sensorizeitRecords.length) return [];
    if (!search.trim()) return sensorizeitRecords;
    const q = search.toLowerCase();
    return sensorizeitRecords.filter(item =>
      item.serial.toLowerCase().includes(q) ||
      item.imei.toLowerCase().includes(q) ||
      item.tipoSensor.toLowerCase().includes(q) ||
      item.marca.toLowerCase().includes(q) ||
      item.modelo.toLowerCase().includes(q) ||
      item.comercio.toLowerCase().includes(q) ||
      item.almacen.toLowerCase().includes(q) ||
      item.status.toLowerCase().includes(q) ||
      item.tecnico.toLowerCase().includes(q) ||
      item.simAsignada.toLowerCase().includes(q) ||
      item.rifCliente.toLowerCase().includes(q)
    );
  }, [isSensorizeit, sensorizeitRecords, search]);

  const totalFiltered = isSim
    ? filteredSimRecords.length
    : isRouter
    ? filteredRouterRecords.length
    : isFlota
    ? filteredFlotaRecords.length
    : filteredSensorizeitRecords.length;

  const totalRaw = isSim
    ? simRecords.length
    : isRouter
    ? routerRecords.length
    : isFlota
    ? flotaRecords.length
    : sensorizeitRecords.length;

  const paginatedSim = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSimRecords.slice(start, start + itemsPerPage);
  }, [filteredSimRecords, currentPage]);

  const paginatedRouters = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRouterRecords.slice(start, start + itemsPerPage);
  }, [filteredRouterRecords, currentPage]);

  const paginatedFlota = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredFlotaRecords.slice(start, start + itemsPerPage);
  }, [filteredFlotaRecords, currentPage]);

  const paginatedSensorizeit = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSensorizeitRecords.slice(start, start + itemsPerPage);
  }, [filteredSensorizeitRecords, currentPage]);

  if (!context) return null;

  const handleExportCsv = () => {
    let csvContent = '';
    if (isSim) {
      const headers = [
        'SERIAL SIMCARD',
        'NUMERO TELEFONICO',
        'DIRECCION IP',
        'OPERADORA',
        'PROPIETARIO',
        'PROCESADOR',
        'FECHA DE ENTRADA',
        'COD CLIENTE',
        'COMERCIO',
        'EQUIPO ASIGNADO',
        'ALMACEN',
        'STATUS',
        'SIM STATUS',
      ];
      const rows = filteredSimRecords.map(item => [
        `"${item.serialSimcard}"`,
        `"${item.numeroTelefonico}"`,
        `"${item.direccionIp}"`,
        `"${item.operadora}"`,
        `"${item.propietario}"`,
        `"${item.procesador}"`,
        `"${item.fechaEntrada}"`,
        `"${item.codCliente}"`,
        `"${item.comercio}"`,
        `"${item.equipoAsignado}"`,
        `"${item.almacen}"`,
        `"${item.status}"`,
        `"${item.simStatus}"`,
      ].join(','));
      csvContent = [headers.join(','), ...rows].join('\n');
    } else if (isRouter) {
      const headers = [
        'SERIAL',
        'IMEI',
        'MARCA',
        'MODELO',
        'FECHA DE ENTRADA',
        'COD CLIENTE',
        'COMERCIO',
        'SIM ASIGNADA',
        'ALMACEN',
        'TECNICO',
        'STATUS',
        'CONDICION',
        'STATUS 2',
      ];
      const rows = filteredRouterRecords.map(item => [
        `"${item.serial}"`,
        `"${item.imei}"`,
        `"${item.marca}"`,
        `"${item.modelo}"`,
        `"${item.fechaEntrada}"`,
        `"${item.codCliente}"`,
        `"${item.comercio}"`,
        `"${item.simAsignada}"`,
        `"${item.almacen}"`,
        `"${item.tecnico}"`,
        `"${item.status}"`,
        `"${item.condicion}"`,
        `"${item.status2}"`,
      ].join(','));
      csvContent = [headers.join(','), ...rows].join('\n');
    } else if (isFlota) {
      const headers = [
        'SERIAL',
        'IMEI',
        'MARCA',
        'MODELO',
        'FECHA DE ENTRADA',
        'OBSERVACION',
        'RIF CLIENTE',
        'COMERCIO',
        'SIM ASIGNADA',
        'OPERADORA',
        'ALMACEN',
        'TECNICO',
        'FECHA DE SALIDA',
        'PERMANENCIA',
        'STATUS',
        'FECHA DE INSTALACION',
      ];
      const rows = filteredFlotaRecords.map(item => [
        `"${item.serial}"`,
        `"${item.imei}"`,
        `"${item.marca}"`,
        `"${item.modelo}"`,
        `"${item.fechaEntrada}"`,
        `"${item.observacion}"`,
        `"${item.rifCliente}"`,
        `"${item.comercio}"`,
        `"${item.simAsignada}"`,
        `"${item.operadora}"`,
        `"${item.almacen}"`,
        `"${item.tecnico}"`,
        `"${item.fechaSalida}"`,
        `"${item.permanencia}"`,
        `"${item.status}"`,
        `"${item.fechaInstalacion}"`,
      ].join(','));
      csvContent = [headers.join(','), ...rows].join('\n');
    } else {
      // SENSORIZEIT: Excluyendo Col C-I, Col N y Col T explícitamente
      const headers = [
        'SERIAL',
        'IMEI',
        'TIPO DE SENSOR',
        'MARCA',
        'MODELO',
        'FECHA DE ENTRADA',
        'RIF CLIENTE',
        'COMERCIO',
        'SIM ASIGNADA',
        'ALMACEN',
        'TECNICO',
        'STATUS',
        'FECHA DE INSTALACION',
      ];
      const rows = filteredSensorizeitRecords.map(item => [
        `"${item.serial}"`,
        `"${item.imei}"`,
        `"${item.tipoSensor}"`,
        `"${item.marca}"`,
        `"${item.modelo}"`,
        `"${item.fechaEntrada}"`,
        `"${item.rifCliente}"`,
        `"${item.comercio}"`,
        `"${item.simAsignada}"`,
        `"${item.almacen}"`,
        `"${item.tecnico}"`,
        `"${item.status}"`,
        `"${item.fechaInstalacion}"`,
      ].join(','));
      csvContent = [headers.join(','), ...rows].join('\n');
    }

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `desglose_${context.module}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopySerials = () => {
    let list: string[] = [];
    if (isSim) {
      list = filteredSimRecords.map(i => i.serialSimcard).filter(Boolean);
    } else if (isRouter) {
      list = filteredRouterRecords.map(i => i.serial).filter(Boolean);
    } else if (isFlota) {
      list = filteredFlotaRecords.map(i => i.serial).filter(Boolean);
    } else {
      list = filteredSensorizeitRecords.map(i => i.serial).filter(Boolean);
    }
    navigator.clipboard.writeText(list.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalPages = Math.ceil(totalFiltered / itemsPerPage) || 1;

  const getModuleBadge = () => {
    if (isSim) return { label: 'RESUMEN DE SIMS', icon: <Radio className="w-5 h-5" />, bg: 'bg-rose-700' };
    if (isRouter) return { label: 'RESUMEN DE ROUTERS', icon: <Cpu className="w-5 h-5" />, bg: 'bg-rose-700' };
    if (isFlota) return { label: 'RESUMEN DE FLOTA', icon: <Truck className="w-5 h-5" />, bg: 'bg-indigo-700' };
    return { label: 'RESUMEN DE SENSORIZEIT', icon: <Activity className="w-5 h-5" />, bg: 'bg-indigo-700' };
  };

  const badgeInfo = getModuleBadge();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-7xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 ${badgeInfo.bg} rounded-xl text-white shadow-sm`}>
              {badgeInfo.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/60">
                  {badgeInfo.label}
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                  {context.title}
                </h2>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1.5">
                <span>{context.filterDescription}</span>
                <span className="text-slate-500">•</span>
                <span className="font-semibold text-rose-300">{totalFiltered} registros</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={
                isSim
                  ? "Buscar por serial, teléfono, IP, cliente, comercio..."
                  : isRouter
                  ? "Buscar por serial, IMEI, marca, modelo, comercio..."
                  : isFlota
                  ? "Buscar por serial, IMEI, marca, modelo, comercio, SIM, técnico..."
                  : "Buscar por serial, IMEI, tipo sensor, modelo, comercio, almacén..."
              }
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleCopySerials}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">¡Copiados!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copiar Seriales ({totalFiltered})</span>
                </>
              )}
            </button>

            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar CSV</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-100/50">
          {totalFiltered === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
              <Filter className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700">No se encontraron registros</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No hay equipos en este segmento que coincidan con los criterios de búsqueda actuales.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto max-h-[58vh]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-900 text-white sticky top-0 z-10 select-none text-[11px]">
                    {isSim ? (
                      <tr>
                        <th className="py-2.5 px-3 font-semibold text-slate-300 text-center w-12">#</th>
                        <th className="py-2.5 px-3 font-semibold">SERIAL SIMCARD</th>
                        <th className="py-2.5 px-3 font-semibold">NUMERO TELEFONICO</th>
                        <th className="py-2.5 px-3 font-semibold">DIRECCION IP</th>
                        <th className="py-2.5 px-3 font-semibold">OPERADORA</th>
                        <th className="py-2.5 px-3 font-semibold">PROPIETARIO</th>
                        <th className="py-2.5 px-3 font-semibold">PROCESADOR</th>
                        <th className="py-2.5 px-3 font-semibold">FECHA ENTRADA</th>
                        <th className="py-2.5 px-3 font-semibold">COMERCIO</th>
                        <th className="py-2.5 px-3 font-semibold">ALMACEN</th>
                        <th className="py-2.5 px-3 font-semibold">STATUS</th>
                        <th className="py-2.5 px-3 font-semibold">SIM STATUS</th>
                      </tr>
                    ) : isRouter ? (
                      <tr>
                        <th className="py-2.5 px-3 font-semibold text-slate-300 text-center w-12">#</th>
                        <th className="py-2.5 px-3 font-semibold">SERIAL</th>
                        <th className="py-2.5 px-3 font-semibold">IMEI</th>
                        <th className="py-2.5 px-3 font-semibold">MARCA</th>
                        <th className="py-2.5 px-3 font-semibold">MODELO</th>
                        <th className="py-2.5 px-3 font-semibold">FECHA ENTRADA</th>
                        <th className="py-2.5 px-3 font-semibold">COD CLIENTE</th>
                        <th className="py-2.5 px-3 font-semibold">COMERCIO</th>
                        <th className="py-2.5 px-3 font-semibold">SIM ASIGNADA</th>
                        <th className="py-2.5 px-3 font-semibold">ALMACEN</th>
                        <th className="py-2.5 px-3 font-semibold">TECNICO</th>
                        <th className="py-2.5 px-3 font-semibold">STATUS</th>
                        <th className="py-2.5 px-3 font-semibold">CONDICION</th>
                        <th className="py-2.5 px-3 font-semibold">STATUS 2</th>
                      </tr>
                    ) : isFlota ? (
                      <tr>
                        <th className="py-2.5 px-3 font-semibold text-slate-300 text-center w-12">#</th>
                        <th className="py-2.5 px-3 font-semibold">SERIAL</th>
                        <th className="py-2.5 px-3 font-semibold">IMEI</th>
                        <th className="py-2.5 px-3 font-semibold">MARCA</th>
                        <th className="py-2.5 px-3 font-semibold">MODELO</th>
                        <th className="py-2.5 px-3 font-semibold">FECHA ENTRADA</th>
                        <th className="py-2.5 px-3 font-semibold">OBSERVACION</th>
                        <th className="py-2.5 px-3 font-semibold">RIF CLIENTE</th>
                        <th className="py-2.5 px-3 font-semibold">COMERCIO</th>
                        <th className="py-2.5 px-3 font-semibold">SIM ASIGNADA</th>
                        <th className="py-2.5 px-3 font-semibold">OPERADORA</th>
                        <th className="py-2.5 px-3 font-semibold">ALMACEN</th>
                        <th className="py-2.5 px-3 font-semibold">TECNICO</th>
                        <th className="py-2.5 px-3 font-semibold">STATUS</th>
                        <th className="py-2.5 px-3 font-semibold">FECHA INSTALACION</th>
                      </tr>
                    ) : (
                      /* SENSORIZEIT: Excluyendo Col C-I, Col N y Col T */
                      <tr>
                        <th className="py-2.5 px-3 font-semibold text-slate-300 text-center w-12">#</th>
                        <th className="py-2.5 px-3 font-semibold">SERIAL</th>
                        <th className="py-2.5 px-3 font-semibold">IMEI</th>
                        <th className="py-2.5 px-3 font-semibold">TIPO DE SENSOR</th>
                        <th className="py-2.5 px-3 font-semibold">MARCA</th>
                        <th className="py-2.5 px-3 font-semibold">MODELO</th>
                        <th className="py-2.5 px-3 font-semibold">FECHA ENTRADA</th>
                        <th className="py-2.5 px-3 font-semibold">RIF CLIENTE</th>
                        <th className="py-2.5 px-3 font-semibold">COMERCIO</th>
                        <th className="py-2.5 px-3 font-semibold">SIM ASIGNADA</th>
                        <th className="py-2.5 px-3 font-semibold">ALMACEN</th>
                        <th className="py-2.5 px-3 font-semibold">TECNICO</th>
                        <th className="py-2.5 px-3 font-semibold">STATUS</th>
                        <th className="py-2.5 px-3 font-semibold">FECHA INSTALACION</th>
                      </tr>
                    )}
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {isSim ? (
                      paginatedSim.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-rose-50/50 transition-colors text-slate-700">
                          <td className="py-2 px-3 text-center text-slate-400 font-mono text-[10px]">
                            {(currentPage - 1) * itemsPerPage + idx + 1}
                          </td>
                          <td className="py-2 px-3 font-mono font-semibold text-slate-900 select-all">
                            {item.serialSimcard || '-'}
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-700 select-all">
                            {item.numeroTelefonico || '-'}
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-600">
                            {item.direccionIp || '-'}
                          </td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-100 text-slate-800 border border-slate-300">
                              {item.operadora || '-'}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-medium text-slate-800">
                            {item.propietario || '-'}
                          </td>
                          <td className="py-2 px-3 text-slate-600">
                            {item.procesador || '-'}
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-600">
                            {item.fechaEntrada || '-'}
                          </td>
                          <td className="py-2 px-3 font-medium text-slate-800 max-w-[200px] truncate" title={item.comercio}>
                            {item.comercio || '-'}
                          </td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              item.almacen.includes('COMERCIO')
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : item.almacen.includes('PRINCIPAL')
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {item.almacen || '-'}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.status === 'INSTALADO'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : item.status === 'DISPONIBLE'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {item.status || '-'}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                              item.simStatus === 'ACTIVA'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              {item.simStatus || '-'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : isRouter ? (
                      paginatedRouters.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-rose-50/50 transition-colors text-slate-700">
                          <td className="py-2 px-3 text-center text-slate-400 font-mono text-[10px]">
                            {(currentPage - 1) * itemsPerPage + idx + 1}
                          </td>
                          <td className="py-2 px-3 font-mono font-semibold text-slate-900 select-all">
                            {item.serial || '-'}
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-700 select-all">
                            {item.imei || '-'}
                          </td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-100 text-slate-800 border border-slate-300">
                              {item.marca || '-'}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-mono font-semibold text-slate-800">
                            {item.modelo || '-'}
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-600">
                            {item.fechaEntrada || '-'}
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-600">
                            {item.codCliente || '-'}
                          </td>
                          <td className="py-2 px-3 font-medium text-slate-800 max-w-[220px] truncate" title={item.comercio}>
                            {item.comercio || '-'}
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-700">
                            {item.simAsignada || '-'}
                          </td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              item.almacen.includes('COMERCIO')
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : item.almacen.includes('PRINCIPAL')
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {item.almacen || '-'}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-600 font-medium">
                            {item.tecnico || '-'}
                          </td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.status === 'INSTALADO'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : item.status === 'DISPONIBLE'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : item.status.includes('USADO')
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {item.status || '-'}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-semibold text-slate-800 text-[11px]">
                            {item.condicion || '-'}
                          </td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.status2 === 'ACTIVO'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : item.status2.includes('CORTE') || item.status2.includes('RETIRAR')
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}>
                              {item.status2 || '-'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : isFlota ? (
                      paginatedFlota.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-indigo-50/50 transition-colors text-slate-700">
                          <td className="py-2 px-3 text-center text-slate-400 font-mono text-[10px]">
                            {(currentPage - 1) * itemsPerPage + idx + 1}
                          </td>
                          <td className="py-2 px-3 font-mono font-semibold text-slate-900 select-all">
                            {item.serial || '-'}
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-700 select-all">
                            {item.imei || '-'}
                          </td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-100 text-slate-800 border border-slate-300">
                              {item.marca || '-'}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-mono font-semibold text-slate-800">
                            {item.modelo || '-'}
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-600">
                            {item.fechaEntrada || '-'}
                          </td>
                          <td className="py-2 px-3 text-slate-600 text-[11px] max-w-[150px] truncate" title={item.observacion}>
                            {item.observacion || '-'}
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-600">
                            {item.rifCliente || '-'}
                          </td>
                          <td className="py-2 px-3 font-medium text-slate-800 max-w-[200px] truncate" title={item.comercio}>
                            {item.comercio || '-'}
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-700">
                            {item.simAsignada || '-'}
                          </td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-100 text-slate-700 border border-slate-300">
                              {item.operadora || '-'}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              item.almacen.includes('COMERCIO')
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : item.almacen.includes('PRINCIPAL')
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {item.almacen || '-'}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-600 font-medium">
                            {item.tecnico || '-'}
                          </td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.status === 'INSTALADO'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : item.status === 'DISPONIBLE'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : item.status.includes('DAÑADO') || item.status.includes('DANADO') || item.status.includes('RMA')
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : item.status.includes('REVISION')
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {item.status || '-'}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-600">
                            {item.fechaInstalacion || '-'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      /* SENSORIZEIT: Excluyendo Col C-I, Col N y Col T */
                      paginatedSensorizeit.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-indigo-50/50 transition-colors text-slate-700">
                          <td className="py-2 px-3 text-center text-slate-400 font-mono text-[10px]">
                            {(currentPage - 1) * itemsPerPage + idx + 1}
                          </td>
                          <td className="py-2 px-3 font-mono font-semibold text-slate-900 select-all">
                            {item.serial || '-'}
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-700 select-all">
                            {item.imei || '-'}
                          </td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {item.tipoSensor || '-'}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-100 text-slate-800 border border-slate-300">
                              {item.marca || '-'}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-mono font-semibold text-slate-800">
                            {item.modelo || '-'}
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-600">
                            {item.fechaEntrada || '-'}
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-600">
                            {item.rifCliente || '-'}
                          </td>
                          <td className="py-2 px-3 font-medium text-slate-800 max-w-[200px] truncate" title={item.comercio}>
                            {item.comercio || '-'}
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-700">
                            {item.simAsignada || '-'}
                          </td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              item.almacen.includes('COMERCIO')
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : item.almacen.includes('PRINCIPAL')
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {item.almacen || '-'}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-600 font-medium">
                            {item.tecnico || '-'}
                          </td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.status === 'INSTALADO'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : item.status === 'DISPONIBLE'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : item.status.includes('DAÑADO') || item.status.includes('DANADO') || item.status.includes('SIN PILA')
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {item.status || '-'}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-600">
                            {item.fechaInstalacion || '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer & Pagination */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-slate-500 font-medium">
            Mostrando {totalFiltered === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, totalFiltered)} de {totalFiltered} registros {search ? `(filtrados de ${totalRaw})` : ''}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Anterior
            </button>
            <span className="px-2 text-slate-600 font-semibold">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Siguiente
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
