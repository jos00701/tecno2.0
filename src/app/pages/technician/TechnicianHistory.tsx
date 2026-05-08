import { useState } from 'react';
import {
  ChevronLeft,
  Star,
  MapPin,
  Calendar,
  DollarSign,
  MessageSquare,
  Search,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { JOB_HISTORY, TECHNICIANS, SERVICES_BY_SPECIALTY } from '../../data/mockData';

export default function TechnicianHistory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'cancelled'>('all');

  const techData = TECHNICIANS.find(t => t.email === user?.email) || TECHNICIANS[0];
  const specialty = techData.specialty;
  const services = SERVICES_BY_SPECIALTY[specialty] || [];

  // Adaptar historial a la especialidad del técnico
  const jobs = JOB_HISTORY.map((job, i) => ({
    ...job,
    service: services[i % services.length] || job.service,
  }));

  const filteredJobs = jobs.filter(job => {
    const matchesSearch =
      job.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || job.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const completedJobs = jobs.filter(j => j.status === 'completed').length;
  const totalEarnings = jobs.filter(j => j.status === 'completed').reduce((sum, j) => sum + j.price, 0);
  const ratedJobs = jobs.filter(j => j.rating);
  const averageRating = ratedJobs.length > 0
    ? ratedJobs.reduce((sum, j) => sum + (j.rating || 0), 0) / ratedJobs.length
    : 0;

  const bestReview = jobs.filter(j => j.review && j.rating === 5)[0];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-6">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => navigate('/technician/dashboard')} className="p-2 hover:bg-purple-500 rounded-lg transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl mb-1">Historial de Trabajos</h1>
            <p className="text-purple-100 text-sm">{specialty} · {user?.name?.split(' ')[0]}</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">Total trabajos</p>
            <p className="text-2xl font-bold">{jobs.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">Completados</p>
            <p className="text-2xl font-bold text-green-600">{completedJobs}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">Ingresos totales</p>
            <p className="text-2xl font-bold text-green-600">${totalEarnings.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">Calificación</p>
            <div className="flex items-center gap-1">
              <p className="text-2xl font-bold text-yellow-600">{averageRating.toFixed(1)}</p>
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            </div>
          </div>
        </div>

        {/* Búsqueda y filtros */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por cliente, servicio o ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${filterStatus === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterStatus('completed')}
                className={`px-4 py-2 rounded-lg transition-colors ${filterStatus === 'completed' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Completados
              </button>
              <button
                onClick={() => setFilterStatus('cancelled')}
                className={`px-4 py-2 rounded-lg transition-colors ${filterStatus === 'cancelled' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Cancelados
              </button>
            </div>
          </div>
        </div>

        {/* Lista de trabajos */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl">Trabajos Anteriores</h2>
            <span className="text-sm text-gray-600">{filteredJobs.length} resultado{filteredJobs.length !== 1 ? 's' : ''}</span>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No se encontraron resultados</p>
              <p className="text-sm text-gray-400 mt-2">Intenta con otros términos de búsqueda</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map(job => (
                <div key={job.id} className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{job.clientName}</h3>
                        {job.status === 'completed' ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />Completado
                          </span>
                        ) : (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full flex items-center gap-1">
                            <XCircle className="w-3 h-3" />Cancelado
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{job.service}</p>

                      <div className="space-y-1 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(job.date).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-medium text-green-600">${job.price.toLocaleString()} · {job.paymentMethod}</span>
                        </div>
                      </div>

                      {job.rating && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex items-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < job.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                            ))}
                            <span className="text-sm text-gray-600 ml-1">{job.rating}.0</span>
                          </div>
                          {job.review && (
                            <p className="text-sm text-gray-600 italic">"{job.review}"</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="text-right ml-4">
                      <p className="text-2xl font-bold text-green-600 mb-2">${job.price.toLocaleString()}</p>
                      <button onClick={() => navigate('/chat')} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                        <MessageSquare className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mejor reseña */}
        {bestReview && (
          <div className="mt-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg shadow-md p-5 border border-yellow-200">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              <h3 className="font-semibold text-gray-900">Tu Mejor Reseña</h3>
            </div>
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <p className="text-gray-700 italic mb-2">"{bestReview.review}"</p>
            <p className="text-sm text-gray-600">
              — {bestReview.clientName} · {new Date(bestReview.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
