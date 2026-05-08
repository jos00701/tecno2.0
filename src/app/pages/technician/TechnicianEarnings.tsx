import { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  ChevronLeft,
  Download,
  Filter,
  Clock,
  CheckCircle,
  CreditCard
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { TRANSACTIONS, TECHNICIANS, SERVICES_BY_SPECIALTY } from '../../data/mockData';

export default function TechnicianEarnings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  const techData = TECHNICIANS.find(t => t.email === user?.email) || TECHNICIANS[0];
  const specialty = techData.specialty;
  const services = SERVICES_BY_SPECIALTY[specialty] || [];

  // Adaptar transacciones a la especialidad del técnico
  const transactions = TRANSACTIONS.map((tx, i) => ({
    ...tx,
    service: services[i % services.length] || tx.service,
  }));

  // Estadísticas por período (personalizadas por especialidad)
  const baseMultiplier = specialty === 'Carpintero' ? 1.15 : specialty === 'Climatización' ? 1.05 : specialty === 'Plomero' ? 0.95 : 1;

  const stats = {
    week: {
      total: Math.round(3200 * baseMultiplier),
      completed: 8,
      pending: Math.round(1200 * baseMultiplier),
      average: Math.round(400 * baseMultiplier),
    },
    month: {
      total: Math.round(12450 * baseMultiplier),
      completed: 35,
      pending: Math.round(2100 * baseMultiplier),
      average: Math.round(355 * baseMultiplier),
    },
    year: {
      total: Math.round(145680 * baseMultiplier),
      completed: 420,
      pending: Math.round(8500 * baseMultiplier),
      average: Math.round(347 * baseMultiplier),
    },
  };

  const currentStats = stats[selectedPeriod];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':  return 'text-green-600 bg-green-100';
      case 'pending':    return 'text-yellow-600 bg-yellow-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      default:           return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':  return 'Completado';
      case 'pending':    return 'Pendiente';
      case 'processing': return 'Procesando';
      default: return status;
    }
  };

  const getPeriodText = (period: string) => {
    switch (period) {
      case 'week':  return 'Esta Semana';
      case 'month': return 'Este Mes';
      case 'year':  return 'Este Año';
      default: return '';
    }
  };

  // Gráfico de ingresos mensuales
  const monthlyData = [
    { month: 'Febrero', amount: Math.round(11200 * baseMultiplier), percentage: 75 },
    { month: 'Marzo',   amount: Math.round(13450 * baseMultiplier), percentage: 90 },
    { month: 'Abril',   amount: Math.round(12450 * baseMultiplier), percentage: 83 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-6">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => navigate('/technician/dashboard')} className="p-2 hover:bg-green-500 rounded-lg transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl mb-1">Mis Ingresos</h1>
            <p className="text-green-100 text-sm">{specialty} · {user?.name?.split(' ')[0]}</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Selector de período */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {(['week', 'month', 'year'] as const).map(period => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                selectedPeriod === period ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {getPeriodText(period)}
            </button>
          ))}
        </div>

        {/* Tarjeta de resumen */}
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg shadow-lg p-6 mb-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5" />
            <p className="text-green-100">Ingresos totales</p>
          </div>
          <p className="text-4xl font-bold mb-1">${currentStats.total.toLocaleString()}</p>
          <div className="flex items-center gap-2 text-green-100">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">+12% vs período anterior</span>
          </div>
        </div>

        {/* Estadísticas detalladas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-gray-600">Trabajos completados</p>
            </div>
            <p className="text-2xl font-bold mb-1">{currentStats.completed}</p>
            <p className="text-xs text-gray-500">Servicios finalizados</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <p className="text-sm text-gray-600">Pagos pendientes</p>
            </div>
            <p className="text-2xl font-bold mb-1">${currentStats.pending.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Por cobrar</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <p className="text-sm text-gray-600">Promedio por trabajo</p>
            </div>
            <p className="text-2xl font-bold mb-1">${currentStats.average.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Precio medio</p>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow flex items-center justify-center gap-2 text-blue-600">
            <Download className="w-5 h-5" />
            <span>Descargar Reporte</span>
          </button>
          <button className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow flex items-center justify-center gap-2 text-gray-700">
            <Filter className="w-5 h-5" />
            <span>Filtrar</span>
          </button>
        </div>

        {/* Historial de transacciones */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl">Historial de Transacciones</h2>
            <span className="text-sm text-gray-600">{transactions.length} transacciones</span>
          </div>

          <div className="space-y-3">
            {transactions.map(transaction => (
              <div key={transaction.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{transaction.clientName}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(transaction.status)}`}>
                        {getStatusText(transaction.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{transaction.service}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(transaction.date).toLocaleDateString('es-MX', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CreditCard className="w-3 h-3" />
                        <span>{transaction.paymentMethod}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className={`text-2xl font-bold ${transaction.status === 'completed' ? 'text-green-600' : 'text-gray-600'}`}>
                      ${transaction.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico de ingresos */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-5">
          <h3 className="font-semibold mb-4">Ingresos por Mes</h3>
          <div className="space-y-3">
            {monthlyData.map(item => (
              <div key={item.month}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">{item.month}</span>
                  <span className="text-sm font-semibold">${item.amount.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full transition-all" style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Método de pago */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-5">
          <h3 className="font-semibold mb-3">Método de Pago</h3>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Cuenta Bancaria</p>
                <p className="text-sm text-gray-600">**** **** **** 4567</p>
              </div>
            </div>
            <button className="text-blue-600 text-sm hover:underline">Cambiar</button>
          </div>
          <p className="text-xs text-gray-500 mt-3">Los pagos se procesan automáticamente cada viernes</p>
        </div>
      </div>
    </div>
  );
}
