import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Calendar, MapPin, Phone, Mail, Star, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { BOOKING_HISTORY } from '../data/mockData';

type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export function MyBookings() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | BookingStatus>('all');

  const bookings = BOOKING_HISTORY;

  const filteredBookings = filter === 'all'
    ? bookings
    : bookings.filter(booking => booking.status === filter);

  const getStatusBadge = (status: BookingStatus) => {
    const statusConfig = {
      pending:   { label: 'Pendiente',   variant: 'secondary'    as const, icon: AlertCircle },
      confirmed: { label: 'Confirmado',  variant: 'default'      as const, icon: CheckCircle },
      completed: { label: 'Completado',  variant: 'default'      as const, icon: CheckCircle },
      cancelled: { label: 'Cancelado',   variant: 'destructive'  as const, icon: XCircle },
    };
    const config = statusConfig[status];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const stats = {
    total:     bookings.length,
    pending:   bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
  };

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
        <h1 className="text-3xl mb-2">Mis Contrataciones</h1>
        <p className="text-gray-600 mb-8">Gestiona y revisa todos tus servicios contratados</p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Total</p>
            <p className="text-2xl">{stats.total}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Pendientes</p>
            <p className="text-2xl text-orange-600">{stats.pending}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Confirmados</p>
            <p className="text-2xl text-blue-600">{stats.confirmed}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Completados</p>
            <p className="text-2xl text-green-600">{stats.completed}</p>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button variant={filter === 'all'       ? 'default' : 'outline'} onClick={() => setFilter('all')}       size="sm">Todos ({bookings.length})</Button>
          <Button variant={filter === 'pending'   ? 'default' : 'outline'} onClick={() => setFilter('pending')}   size="sm">Pendientes ({stats.pending})</Button>
          <Button variant={filter === 'confirmed' ? 'default' : 'outline'} onClick={() => setFilter('confirmed')} size="sm">Confirmados ({stats.confirmed})</Button>
          <Button variant={filter === 'completed' ? 'default' : 'outline'} onClick={() => setFilter('completed')} size="sm">Completados ({stats.completed})</Button>
          <Button variant={filter === 'cancelled' ? 'default' : 'outline'} onClick={() => setFilter('cancelled')} size="sm">Cancelados</Button>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.length === 0 ? (
            <Card className="p-8 text-center">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay contrataciones en esta categoría</p>
            </Card>
          ) : (
            filteredBookings.map((booking) => (
              <Card key={booking.id} className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Technician Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white flex-shrink-0">
                      <span className="text-lg">{booking.technicianInitials}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h3 className="text-lg mb-1">{booking.technicianName}</h3>
                          <p className="text-sm text-gray-600">{booking.category}</p>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>

                      <p className="mb-3">{booking.service}</p>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(booking.date).toLocaleDateString('es-MX', {
                              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                            })} — {booking.time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{booking.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>{booking.technicianPhone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>{booking.technicianEmail}</span>
                        </div>
                      </div>

                      {booking.rating && (
                        <div className="flex items-center gap-1 mt-3">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < booking.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                          ))}
                          <span className="text-sm text-gray-600 ml-1">Tu calificación</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price and Actions */}
                  <div className="flex flex-col items-end justify-between lg:w-48">
                    <div className="text-right mb-4">
                      <p className="text-2xl mb-1">${booking.price.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Precio total</p>
                    </div>

                    <div className="flex flex-col gap-2 w-full">
                      {booking.status === 'pending' && (
                        <>
                          <Button size="sm" className="w-full">Confirmar</Button>
                          <Button size="sm" variant="outline" className="w-full">Cancelar</Button>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <>
                          <Button size="sm" className="w-full" onClick={() => navigate('/chat')}>Contactar</Button>
                          <Button size="sm" variant="outline" className="w-full">Reagendar</Button>
                        </>
                      )}
                      {booking.status === 'completed' && !booking.rating && (
                        <Button size="sm" className="w-full">Calificar servicio</Button>
                      )}
                      {booking.status === 'completed' && booking.rating && (
                        <Button size="sm" variant="outline" className="w-full">Contratar de nuevo</Button>
                      )}
                      <Button size="sm" variant="ghost" className="w-full">Ver detalles</Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
