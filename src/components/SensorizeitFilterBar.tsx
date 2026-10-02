import React from 'react';
import { SensorizeitFilterState, SensorizeitItem } from '../types';
import { GenericFilterBar } from './GenericFilterBar';

interface SensorizeitFilterBarProps {
  filters: SensorizeitFilterState;
  onFilterChange: (newFilters: SensorizeitFilterState) => void;
  allItems: SensorizeitItem[];
  filteredCount: number;
}

export const SensorizeitFilterBar: React.FC<SensorizeitFilterBarProps> = ({
  filters,
  onFilterChange,
  allItems = [],
}) => {
  return (
    <GenericFilterBar<SensorizeitItem, SensorizeitFilterState>
      filters={filters}
      onFilterChange={onFilterChange}
      allItems={allItems}
      searchPlaceholder="Buscar por Serial, IMEI, Tipo, Comercio, RIF, Técnico..."
      panelWidth="w-64"
      resetDefaults={{
        searchQuery: '',
        tiposSensor: [],
        modelos: [],
        almacenes: [],
        marcas: [],
        statuses: [],
      }}
      dropdowns={[
        { key: 'tiposSensor', valueKey: 'tipoSensor', label: 'Tipo de Sensor', primary: true },
        { key: 'modelos', valueKey: 'modelo', label: 'Modelo', primary: true },
        { key: 'almacenes', valueKey: 'almacen', label: 'Almacén', primary: true },
        { key: 'marcas', valueKey: 'marca', label: 'Marca' },
        { key: 'statuses', valueKey: 'status', label: 'Status' },
      ]}
    />
  );
};