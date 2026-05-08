import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Heart, MapPin, Star, Trash2, Search } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { TECHNICIANS } from '../data/mockData';

interface Favorite {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  location: string;
  price: number;
  availability: string;
  initials: string;
  verified: boolean;
}

export function Favorites() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const [favorites, setFavorites] = useState<Favorite[]>(
    TECHNICIANS.map(t => ({
      id: t.id,
      name: t.name,
      category: t.specialty,
      rating: t.rating,
      reviews: t.reviewCount,
      location: t.location,
      price: t.price,
      availability: t.availability,
      initials: t.initials,
      verified: true,
    }))
  );

  const filteredFavorites = favorites.filter(fav =>
    fav.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fav.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const removeFavorite = (id: string) => {
    setFavorites(favorites.filter(fav => fav.id !== id));
  };

  const categoryStats = favorites.reduce((acc, fav) => {
    acc[fav.category] = (acc[fav.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al inicio</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-2">
          <Heart className="w-8 h-8 text-red-500 fill-red-500" />
          <h1 className="text-3xl">Mis Favoritos</h1>
        </div>
        <p className="text-gray-600 mb-8">Técnicos que has guardado para futuras contrataciones</p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Total favoritos</p>
            <p className="text-2xl">{favorites.length}</p>
          </Card>
          {Object.entries(categoryStats).slice(0, 3).map(([category, count]) => (
            <Card key={category} className="p-4">
              <p className="text-sm text-gray-600 mb-1">{category}s</p>
              <p className="text-2xl">{count}</p>
            </Card>
          ))}
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar en favoritos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Favorites Grid */}
        {filteredFavorites.length === 0 ? (
          <Card className="p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl mb-2">
              {searchQuery ? 'No se encontraron resultados' : 'No tienes favoritos aún'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? 'Intenta con otros términos de búsqueda'
                : 'Empieza a guardar técnicos para acceder rápidamente a ellos'}
            </p>
            {!searchQuery && <Button onClick={() => navigate('/')}>Explorar técnicos</Button>}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map((favorite) => (
              <Card key={favorite.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  {/* Avatar */}
                  <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                    <span className="text-white text-5xl">{favorite.initials}</span>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFavorite(favorite.id)}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors group"
                  >
                    <Trash2 className="w-5 h-5 text-gray-600 group-hover:text-red-600" />
                  </button>

                  {/* Verified Badge */}
                  {favorite.verified && (
                    <div className="absolute top-3 left-3 px-2 py-1 bg-blue-600 text-white text-xs rounded-full flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verificado
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-lg mb-1">{favorite.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{favorite.category}</p>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{favorite.rating}</span>
                    </div>
                    <span className="text-sm text-gray-500">({favorite.reviews} reseñas)</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>{favorite.location}</span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-xl">${favorite.price}</span>
                      <span className="text-sm text-gray-600">/hora</span>
                    </div>
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      {favorite.availability}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1" size="sm">Contratar</Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate('/chat')}>Mensajear</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
