import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { SearchBar } from '../components/SearchBar';
import { FilterPanel, FilterState } from '../components/FilterPanel';
import { CategoryTabs } from '../components/CategoryTabs';
import { ServiceCard } from '../components/ServiceCard';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { TECHNICIANS } from '../data/mockData';

// Mapeo de especialidad → categoryId para las tabs
const SPECIALTY_TO_CATEGORY_ID: Record<string, string> = {
  Electricista: 'electricista',
  Plomero: 'plomero',
  Carpintero: 'carpintero',
  Climatización: 'hvac',
  Pintor: 'pintor',
  Mecánico: 'mecanico',
};

// Imágenes por técnico (mismas que tenía el Home original)
const TECHNICIAN_IMAGES: Record<string, string> = {
  'tec-001': 'https://images.unsplash.com/photo-1660330590022-9f4ff56b63f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
  'tec-002': 'https://images.unsplash.com/photo-1676210133055-eab6ef033ce3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
  'tec-003': 'https://images.unsplash.com/photo-1641893979088-87d4d9604c36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
  'tec-004': 'https://images.unsplash.com/photo-1546079406-046e141edf3d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
  'tec-005': 'https://images.unsplash.com/photo-1758101755915-462eddc23f57?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
};

export function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    priceRange: 'all',
    rating: 'all',
    availability: 'all',
  });

  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirigir técnicos a su panel
  useEffect(() => {
    if (isAuthenticated && user?.userType === 'Técnico') {
      navigate('/technician/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSearch = (query: string) => setSearchQuery(query);
  const handleFilterChange = (newFilters: FilterState) => setFilters(newFilters);
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    // Sincronizar el filtro de categoría con la tab activa
    setFilters(prev => ({ ...prev, category: category }));
  };

  // Filtrar técnicos con lógica correcta
  const filteredServices = TECHNICIANS.filter((tech) => {
    const categoryId = SPECIALTY_TO_CATEGORY_ID[tech.specialty] ?? tech.specialty.toLowerCase();

    // Búsqueda por texto
    const matchesSearch =
      searchQuery === '' ||
      tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.location.toLowerCase().includes(searchQuery.toLowerCase());

    // Tab de categoría activa
    const matchesActiveTab = activeCategory === 'all' || categoryId === activeCategory;

    // Filtro de categoría del panel
    const matchesFilterCategory = filters.category === 'all' || categoryId === filters.category;

    // Filtro de precio (precios en MXN: 300–420/hora)
    const matchesPriceRange = (() => {
      if (filters.priceRange === 'all') return true;
      if (filters.priceRange === 'low')    return tech.price <= 300;
      if (filters.priceRange === 'medium') return tech.price > 300 && tech.price <= 380;
      if (filters.priceRange === 'high')   return tech.price > 380;
      return true;
    })();

    // Filtro de calificación mínima
    const matchesRating =
      filters.rating === 'all' || tech.rating >= parseFloat(filters.rating);

    // Filtro de disponibilidad
    const matchesAvailability = (() => {
      if (filters.availability === 'all') return true;
      if (filters.availability === 'today') return tech.availability === 'Disponible hoy';
      if (filters.availability === 'week')  return tech.availability !== 'No disponible';
      return true;
    })();

    return matchesSearch && matchesActiveTab && matchesFilterCategory && matchesPriceRange && matchesRating && matchesAvailability;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Sub-header con búsqueda */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="mb-6">Contratación de Técnicos Profesionales</h1>

          <div className="flex gap-3 mb-6">
            <SearchBar onSearch={handleSearch} />
            <FilterPanel onFilterChange={handleFilterChange} />
          </div>

          <CategoryTabs
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
          />
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredServices.length}{' '}
            {filteredServices.length === 1 ? 'técnico disponible' : 'técnicos disponibles'}
          </p>
        </div>

        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredServices.map((tech) => (
              <ServiceCard
                key={tech.id}
                id={tech.id}
                title={tech.name}
                category={tech.specialty}
                categoryId={SPECIALTY_TO_CATEGORY_ID[tech.specialty] ?? tech.specialty.toLowerCase()}
                image={TECHNICIAN_IMAGES[tech.id] ?? 'https://images.unsplash.com/photo-1660330590022-9f4ff56b63f6?w=600'}
                rating={tech.rating}
                reviews={tech.reviewCount}
                price={`$${tech.price}/hora`}
                priceNum={tech.price}
                location={tech.location}
                availability={tech.availability}
                online={tech.online}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              No se encontraron técnicos con los criterios seleccionados
            </p>
            <p className="text-gray-400 mt-2">Intenta ajustar tus filtros o búsqueda</p>
          </div>
        )}
      </main>
    </div>
  );
}
