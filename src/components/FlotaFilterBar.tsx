import React from 'react';
import { FlotaFilterState, FlotaItem } from '../types';
import { GenericFilterBar } from './GenericFilterBar';

interface FlotaFilterBarProps {
  filters: FlotaFilterState;
  onFilterChange: (newFilters: FlotaFilterState) => void;
  allItems: FlotaItem[];
  filteredCount: number;
}

export const FlotaFilterBar: React.FC<FlotaFilterBarProps> = ({
  filters,
  onFilterChange,
  allItems = [],
}) => {
  return (
    <GenericFilterBar<FlotaItem, FlotaFilterState>
      filters={filters}
      onFilterChange={onFilterChange}
      allItems={allItems}
      searchPlaceholder="Buscar por Serial, IMEI, Comercio, SIM, Técnico..."
      panelWidth="w-60"
      resetDefaults={{
        searchQuery: '',
        marcas: [],
        modelos: [],
        almacenes: [],
        statuses: [],
        operadoras: [],
        comercios: [],
        tecnicos: [],
      }}
      dropdowns={[
        { key: 'marcas', valueKey: 'marca', label: 'Marca' },
        { key: 'modelos', valueKey: 'modelo', label: 'Modelo' },
        { key: 'almacenes', valueKey: 'almacen', label: 'Almacén' },
        { key: 'statuses', valueKey: 'status', label: 'Status' },
        { key: 'operadoras', valueKey: 'operadora', label: 'Operadora' },
        { key: 'tecnicos', valueKey: 'tecnico', label: 'Técnico' },
      ]}
    />
  );
};