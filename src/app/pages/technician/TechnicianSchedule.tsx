import { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { SCHEDULE_DATA, TECHNICIANS, SERVICES_BY_SPECIALTY } from '../../data/mockData';

export default function TechnicianSchedule() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const techData = TECHNICIANS.find(t => t.email === user?.email) || TECHNICIANS[0];
  const specialty = techData.specialty;
  const services = SERVICES_BY_SPECIALTY[specialty] || [];

  // Adaptar servicios del schedule a la especialidad del técnico logueado
  const scheduleData = Object.fromEntries(
    Object.entries(SCHEDULE_DATA).map(([date, appointments]) => [
      date,
      appointments.map((apt, i) => ({
        ...apt,
        service: services[i % services.length] || apt.service,
      })),
    ])
  );

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const days: (Date | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const formatDateKey = (date: Date) => date.toISOString().split('T')[0];

  const getAppointmentsForDate = (date: Date | null) => {
    if (!date) return [];
    return scheduleData[formatDateKey(date)] || [];
  };

  const selectedDateKey = formatDateKey(selectedDate);
  const todayAppointments = getAppointmentsForDate(selectedDate);

  const previousMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':  return 'bg-green-100 text-green-700';
      case 'pending':    return 'bg-yellow-100 text-yellow-700';
      case 'completed':  return 'bg-blue-100 text-blue-700';
      case 'cancelled':  return 'bg-red-100 text-red-700';
      default:           return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':  return <CheckCircle className="w-4 h-4" />;
      case 'pending':    return <AlertCircle className="w-4 h-4" />;
      case 'completed':  return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':  return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':  return 'Confirmado';
      case 'pending':    return 'Pendiente';
      case 'completed':  return 'Completado';
      case 'cancelled':  return 'Cancelado';
      default: return status;
    }
  };

  const days = getDaysInMonth(currentMonth);
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  // Total de citas y ganancias de la semana
  const totalWeekAppointments = Object.values(scheduleData).reduce((sum, apts) => sum + apts.length, 0);
  const totalWeekEarnings = Object.values(scheduleData).flat().reduce((sum, apt) => sum + apt.price, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-6">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => navigate('/technician/dashboard')} className="p-2 hover:bg-blue-500 rounded-lg transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl mb-1">Mi Agenda</h1>
            <p className="text-blue-100 text-sm">{specialty} · {user?.name?.split(' ')[0]}</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Calendario */}
        <div className="bg-white rounded-lg shadow-md p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h2>
            <div className="flex gap-2">
              <button onClick={previousMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-sm text-gray-600 py-2">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              if (!day) return <div key={`empty-${index}`} className="aspect-square" />;
              const isSelected = formatDateKey(day) === selectedDateKey;
              const isToday = formatDateKey(day) === formatDateKey(new Date());
              const appointments = getAppointmentsForDate(day);
              const hasAppointments = appointments.length > 0;
              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(day)}
                  className={`aspect-square rounded-lg border-2 p-2 transition-all relative
                    ${isSelected ? 'border-blue-600 bg-blue-50' : 'border-transparent hover:border-gray-300'}
                    ${isToday && !isSelected ? 'bg-blue-100' : ''}
                  `}
                >
                  <span className={`text-sm ${isSelected ? 'font-bold text-blue-600' : ''}`}>{day.getDate()}</span>
                  {hasAppointments && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                      {appointments.slice(0, 3).map((_, i) => (
                        <div key={i} className="w-1 h-1 bg-blue-600 rounded-full" />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Citas del día seleccionado */}
        <div>
          <h2 className="text-xl mb-4">
            Citas para {selectedDate.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </h2>

          {todayAppointments.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No tienes citas programadas para este día</p>
              <p className="text-sm text-gray-400 mt-2">¡Tiempo libre para descansar o aceptar nuevas solicitudes!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todayAppointments.map(appointment => (
                <div key={appointment.id} className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-700 font-semibold text-sm">
                          {appointment.clientName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{appointment.clientName}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${getStatusColor(appointment.status)}`}>
                            {getStatusIcon(appointment.status)}
                            {getStatusText(appointment.status)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{appointment.service}</p>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{appointment.time} · {appointment.duration}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{appointment.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            <span className="font-medium text-green-600">${appointment.price.toLocaleString()}</span>
                          </div>
                          {appointment.notes && (
                            <div className="mt-2 p-2 bg-yellow-50 border-l-4 border-yellow-400 text-sm">
                              <p className="text-yellow-800">📝 {appointment.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <a href={`tel:${appointment.phone}`} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                        <Phone className="w-5 h-5" />
                      </a>
                      <button onClick={() => navigate('/chat')} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                        <MessageSquare className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  {appointment.status === 'confirmed' && (
                    <div className="flex gap-2 pt-4 border-t">
                      <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                        Cancelar
                      </button>
                      <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                        Marcar como completado
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resumen semanal */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-5">
          <h3 className="font-semibold mb-3">Resumen de la Semana</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{totalWeekAppointments}</p>
              <p className="text-sm text-gray-600">Citas programadas</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">${totalWeekEarnings.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Ingresos estimados</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
