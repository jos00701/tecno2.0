import { SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';

interface FilterPanelProps {
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  category: string;
  priceRange: string;
  rating: string;
  availability: string;
}

export function FilterPanel({ onFilterChange }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    priceRange: 'all',
    rating: 'all',
    availability: 'all',
  });

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters: FilterState = {
      category: 'all',
      priceRange: 'all',
      rating: 'all',
      availability: 'all',
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const activeCount = Object.values(filters).filter(v => v !== 'all').length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <SlidersHorizontal className="w-5 h-5" />
        <span>Filtros</span>
        {activeCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {activeCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl z-50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3>Filtros</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Categoría */}
              <div>
                <label className="block text-sm mb-2">Categoría</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todas las categorías</option>
                  <option value="electricista">Electricista</option>
                  <option value="plomero">Plomero</option>
                  <option value="carpintero">Carpintero</option>
                  <option value="hvac">Climatización</option>
                  <option value="pintor">Pintor</option>
                  <option value="mecanico">Mecánico</option>
                </select>
              </div>

              {/* Rango de precio — valores en MXN/hora */}
              <div>
                <label className="block text-sm mb-2">Precio por hora (MXN)</label>
                <select
                  value={filters.priceRange}
                  onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos los precios</option>
                  <option value="low">Hasta $300/hora</option>
                  <option value="medium">$301 – $380/hora</option>
                  <option value="high">Más de $380/hora</option>
                </select>
              </div>

              {/* Calificación */}
              <div>
                <label className="block text-sm mb-2">Calificación mínima</label>
                <select
                  value={filters.rating}
                  onChange={(e) => handleFilterChange('rating', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todas</option>
                  <option value="4">4+ estrellas</option>
                  <option value="4.5">4.5+ estrellas</option>
                  <option value="4.8">4.8+ estrellas</option>
                </select>
              </div>

              {/* Disponibilidad */}
              <div>
                <label className="block text-sm mb-2">Disponibilidad</label>
                <select
                  value={filters.availability}
                  onChange={(e) => handleFilterChange('availability', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Cualquier momento</option>
                  <option value="today">Disponible hoy</option>
                  <option value="week">Esta semana</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={resetFilters}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Limpiar
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
