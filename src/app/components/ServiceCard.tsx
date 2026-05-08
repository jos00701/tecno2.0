import { Star, MapPin, Clock, MessageCircle, Wifi } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

interface ServiceCardProps {
  id: string;
  title: string;
  category: string;
  categoryId: string;
  image: string;
  rating: number;
  reviews: number;
  price: string;
  priceNum?: number;
  location: string;
  availability: string;
  online?: boolean;
}

export function ServiceCard({
  id,
  title,
  category,
  image,
  rating,
  reviews,
  price,
  location,
  availability,
  online,
}: ServiceCardProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleContratar = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // Navegar al chat con este técnico seleccionado
    navigate(`/chat?tecnico=${id}`);
  };

  const handleCardClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/chat?tecnico=${id}`);
  };

  const isAvailableToday = availability === 'Disponible hoy';

  return (
    <div
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
      onClick={handleCardClick}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        {/* Badge de categoría */}
        <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full shadow-sm">
          <span className="text-sm font-medium">{category}</span>
        </div>
        {/* Indicador online */}
        {online && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            <Wifi className="w-3 h-3" />
            En línea
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="mb-2 text-base font-semibold text-gray-900 leading-tight">{title}</h3>

        <div className="flex items-center gap-1 mb-3">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{rating}</span>
          <span className="text-sm text-gray-500">({reviews} reseñas)</span>
        </div>

        <div className="flex items-center gap-2 mb-2 text-gray-600">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm truncate">{location}</span>
        </div>

        <div className="flex items-center gap-2 mb-4 text-gray-600">
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span className={`text-sm ${isAvailableToday ? 'text-green-600 font-medium' : ''}`}>
            {availability}
          </span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div>
            <span className="text-xs text-gray-500">Desde</span>
            <p className="text-blue-600 font-semibold">{price}</p>
          </div>
          <button
            onClick={handleContratar}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition-all text-sm font-medium"
          >
            <MessageCircle className="w-4 h-4" />
            Contratar
          </button>
        </div>
      </div>
    </div>
  );
}
