import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Calendar, Clock, DollarSign, TrendingUp, Star, MapPin, Phone,
  MessageSquare, Check, X, User, Briefcase, AlertCircle, Send,
  ChevronLeft, Wifi, Activity, ZapOff, Zap, Circle,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { useMessages } from '../../context/MessagesContext';
import { useNotifications } from '../../context/NotificationsContext';
import { PENDING_REQUESTS, UPCOMING_JOBS, TECHNICIANS, SERVICES_BY_SPECIALTY } from '../../data/mockData';

interface JobRequest {
  id: string; clientName: string; clientInitials: string; clientPhone: string;
  location: string; date: string; time: string; price: number; urgent: boolean;
  description: string; service: string; status: 'pending' | 'accepted' | 'rejected'; isNew?: boolean;
}

interface ChatMessage {
  id: string; senderId: string; text: string; time: string; fromMe: boolean;
}

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  'cli-001': [
    { id: '1', senderId: 'cli-001', text: 'Buenos días, ¿podría confirmar la cita del martes a las 10?', time: '08:30', fromMe: false },
    { id: '2', senderId: 'me', text: 'Hola María, sí confirmo la cita para el martes 22 de abril a las 10 AM.', time: '08:45', fromMe: true },
    { id: '3', senderId: 'cli-001', text: 'Perfecto, muchas gracias. La dirección es Colonia Narvarte, Insurgentes Sur 890, int. 4B.', time: '09:00', fromMe: false },
  ],
  'rs-001': [
    { id: '1', senderId: 'rs-001', text: 'Buen día, quería confirmar que el jueves sigo adelante con el servicio.', time: 'Ayer', fromMe: false },
    { id: '2', senderId: 'me', text: 'Perfecto Roberto, el jueves a las 2 PM estoy con usted.', time: 'Ayer', fromMe: true },
    { id: '3', senderId: 'rs-001', text: 'Perfecto, nos vemos el jueves. Gracias.', time: 'Hace 1 h', fromMe: false },
  ],
  'aj-001': [
    { id: '1', senderId: 'aj-001', text: 'Muchas gracias por la rápida atención, excelente servicio.', time: 'Hace 3 h', fromMe: false },
    { id: '2', senderId: 'me', text: 'Con mucho gusto Ana, para eso estamos. Cualquier cosa me avisa.', time: 'Hace 2 h', fromMe: true },
  ],
};

const CLIENT_REPLIES: Record<string, string[]> = {
  'cli-001': ['¡Perfecto, muchas gracias!', 'De acuerdo, allí estaré.', '¿Necesita que tenga algo listo?', 'Genial, lo espero con gusto.'],
  'rs-001': ['Entendido, gracias por confirmar.', 'Perfecto, hasta entonces.', '¿Trae usted las herramientas?', 'Ok, aquí lo espero.'],
  'aj-001': ['Gracias por la rápida respuesta.', '¡Excelente! Muy amable.', 'Perfecto, nos vemos entonces.', 'Muchas gracias de nuevo.'],
};

const SIMULATED_REQUESTS = [
  { id: 'sim-a', clientName: 'Luis Mendoza Ruiz', clientInitials: 'LM', clientPhone: '+52 55 8899 0011', location: 'Del Valle, CDMX', date: '2026-04-23', time: '11:00 AM', price: 750, urgent: false, description: 'Necesito cambiar 4 contactos y revisar el tablero general del departamento.', service: 'Instalación eléctrica' },
  { id: 'sim-b', clientName: 'Sofía Vargas Téllez', clientInitials: 'SV', clientPhone: '+52 55 3322 1100', location: 'Condesa, CDMX', date: '2026-04-22', time: '3:00 PM', price: 1500, urgent: true, description: 'Se fue la luz en toda la planta baja. Urge revisión.', service: 'Revisión urgente' },
  { id: 'sim-c', clientName: 'Carlos Peña Morales', clientInitials: 'CP', clientPhone: '+52 55 4411 2233', location: 'Coyoacán, CDMX', date: '2026-04-24', time: '9:00 AM', price: 600, urgent: false, description: 'Instalar 2 abanicos de techo en recámara y sala.', service: 'Instalación de luminarias' },
];

export default function TechnicianDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { conversations, updateConversation, markConversationRead } = useMessages();
  const { addNotification } = useNotifications();

  const techData = TECHNICIANS.find(t => t.email === user?.email) || TECHNICIANS[0];
  const specialty = techData.specialty;
  const services = SERVICES_BY_SPECIALTY[specialty] || [];

  const [liveTime, setLiveTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(true);
  const [earnings, setEarnings] = useState(
    specialty === 'Electricista' ? 12450 : specialty === 'Plomero' ? 10800 : specialty === 'Carpintero' ? 14200 : 11600
  );

  const initialRequests: JobRequest[] = PENDING_REQUESTS.map((req, i) => ({
    ...req, service: services[i % services.length] || 'Servicio técnico', status: 'pending', isNew: false,
  }));
  const [jobRequests, setJobRequests] = useState<JobRequest[]>(initialRequests);
  const simIdx = useRef(0);

  const [chatOpen, setChatOpen] = useState(false);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [msgInput, setMsgInput] = useState('');
  const [typing, setTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const currentConvMessages = selectedConv ? (messagesMap[selectedConv] || []) : [];
  const currentConv = conversations.find(c => c.contactId === selectedConv);
  const totalUnread = conversations.reduce((s, c) => s + c.unread, 0);

  // Reloj en tiempo real
  useEffect(() => {
    const t = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Scroll al último mensaje del chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConvMessages, typing]);

  // Nuevas solicitudes simuladas cada 30 s
  useEffect(() => {
    const t = setInterval(() => {
      const sim = SIMULATED_REQUESTS[simIdx.current % SIMULATED_REQUESTS.length];
      simIdx.current++;
      const newReq: JobRequest = { ...sim, id: `sim-${Date.now()}`, status: 'pending', isNew: true };
      setJobRequests(prev => [newReq, ...prev]);
      addNotification({ type: 'booking', title: '🔔 Nueva solicitud de servicio', message: `${sim.clientName} — ${sim.service}${sim.urgent ? ' · URGENTE' : ''}`, actionUrl: '/technician/dashboard' });
      setTimeout(() => setJobRequests(prev => prev.map(r => r.id === newReq.id ? { ...r, isNew: false } : r)), 5000);
    }, 30000);
    return () => clearInterval(t);
  }, [addNotification]);

  const handleSendMessage = useCallback(() => {
    if (!msgInput.trim() || !selectedConv) return;
    const now = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    const myMsg: ChatMessage = { id: Date.now().toString(), senderId: 'me', text: msgInput, time: now, fromMe: true };
    setMessagesMap(prev => ({ ...prev, [selectedConv]: [...(prev[selectedConv] || []), myMsg] }));
    updateConversation(selectedConv, msgInput);
    setMsgInput('');
    const delay = 2000 + Math.random() * 2000;
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const replies = CLIENT_REPLIES[selectedConv] || ['Gracias, recibido.'];
      const replyText = replies[Math.floor(Math.random() * replies.length)];
      const replyTime = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
      const replyMsg: ChatMessage = { id: (Date.now() + 1).toString(), senderId: selectedConv, text: replyText, time: replyTime, fromMe: false };
      setMessagesMap(prev => ({ ...prev, [selectedConv]: [...(prev[selectedConv] || []), replyMsg] }));
      updateConversation(selectedConv, replyText);
      addNotification({ type: 'message', title: `Mensaje de ${currentConv?.contactName || 'Cliente'}`, message: replyText, actionUrl: '/technician/dashboard' });
    }, delay);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [msgInput, selectedConv, currentConv, updateConversation, addNotification]);

  const handleAccept = (id: string) => {
    const req = jobRequests.find(r => r.id === id);
    setJobRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'accepted' } : r));
    if (req) setEarnings(prev => prev + req.price);
    setTimeout(() => setJobRequests(prev => prev.filter(r => r.id !== id)), 1200);
  };
  const handleReject = (id: string) => {
    setJobRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
    setTimeout(() => setJobRequests(prev => prev.filter(r => r.id !== id)), 1200);
  };
  const openConv = (contactId: string) => { setSelectedConv(contactId); markConversationRead(contactId); };

  const timeStr = liveTime.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = liveTime.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });

  const stats = [
    { label: 'Solicitudes', value: jobRequests.length, icon: <AlertCircle className="w-4 h-4" />, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Próximos', value: UPCOMING_JOBS.length, icon: <Calendar className="w-4 h-4" />, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Este mes', value: `$${earnings.toLocaleString()}`, icon: <DollarSign className="w-4 h-4" />, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Rating', value: techData.rating, icon: <Star className="w-4 h-4" />, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { label: 'Trabajos', value: techData.reviewCount, icon: <Briefcase className="w-4 h-4" />, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Resp.', value: '98%', icon: <TrendingUp className="w-4 h-4" />, color: 'text-teal-500', bg: 'bg-teal-50' },
  ];

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pb-24 relative">

      {/* Header con reloj en tiempo real */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 text-white px-6 pt-6 pb-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-blue-200 text-xs mb-0.5 uppercase tracking-wide">Panel del Técnico</p>
              <h1 className="text-2xl font-bold">{user?.name?.split(' ').slice(0,2).join(' ')}</h1>
              <p className="text-blue-200 text-sm">{specialty}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end mb-1">
                <Activity className="w-4 h-4 text-green-300 animate-pulse" />
                <span className="font-mono text-xl font-bold tracking-widest tabular-nums">{timeStr}</span>
              </div>
              <p className="text-blue-200 text-xs capitalize">{dateStr}</p>
            </div>
          </div>
          <button
            onClick={() => setIsOnline(v => !v)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              isOnline ? 'bg-green-500/20 text-green-200 border border-green-400/30' : 'bg-gray-500/20 text-gray-300 border border-gray-400/30'
            }`}
          >
            {isOnline ? <><Wifi className="w-3 h-3" />En línea · Recibiendo solicitudes<Circle className="w-2 h-2 fill-green-400 text-green-400" /></> : <><ZapOff className="w-3 h-3" />Desconectado</>}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-6">

        {/* Stats */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5 mb-5">
          {stats.map(s => (
            <div key={s.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
              <div className={`${s.bg} ${s.color} w-7 h-7 rounded-lg flex items-center justify-center mb-1.5`}>{s.icon}</div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide leading-none mb-0.5">{s.label}</p>
              <p className="text-base font-bold text-gray-900 leading-none">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-5 gap-5">

          {/* Columna izquierda: solicitudes + próximos */}
          <div className="md:col-span-3 space-y-5">

            {/* Solicitudes pendientes */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-gray-900">Solicitudes Pendientes</h2>
                  {jobRequests.length > 0 && <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{jobRequests.length}</span>}
                </div>
                <span className="flex items-center gap-1 text-[11px] text-green-600 font-medium"><Zap className="w-3 h-3" />Tiempo real</span>
              </div>

              {jobRequests.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center">
                  <AlertCircle className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400 font-medium">Sin solicitudes pendientes</p>
                  <p className="text-xs text-gray-300 mt-0.5">Las nuevas llegarán aquí automáticamente</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {jobRequests.map(req => (
                    <div key={req.id} className={`bg-white rounded-2xl border shadow-sm p-4 transition-all duration-300 ${
                      req.isNew ? 'border-blue-400 ring-2 ring-blue-100' :
                      req.status === 'accepted' ? 'border-green-400 bg-green-50/30' :
                      req.status === 'rejected' ? 'border-red-200 opacity-60' : 'border-gray-100'
                    }`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-2.5 flex-1">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                            <span className="text-blue-700 font-bold text-xs">{req.clientInitials}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                              <span className="font-semibold text-sm text-gray-900">{req.clientName}</span>
                              {req.urgent && <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">URGENTE</span>}
                              {req.isNew && <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-bold animate-bounce">NUEVA ●</span>}
                            </div>
                            <p className="text-xs text-blue-600 font-medium">{req.service}</p>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{req.description}</p>
                            <div className="flex flex-wrap gap-2 mt-1.5 text-[11px] text-gray-400">
                              <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{req.location}</span>
                              <span className="flex items-center gap-0.5"><Calendar className="w-3 h-3" />{new Date(req.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</span>
                              <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{req.time}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <p className="text-lg font-bold text-green-600">${req.price.toLocaleString()}</p>
                          <p className="text-[10px] text-gray-400">estimado</p>
                        </div>
                      </div>
                      {req.status === 'pending' && (
                        <div className="flex gap-2 pt-3 border-t border-gray-50">
                          <button onClick={() => handleReject(req.id)} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition-colors">
                            <X className="w-3.5 h-3.5" />Rechazar
                          </button>
                          <button onClick={() => handleAccept(req.id)} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors">
                            <Check className="w-3.5 h-3.5" />Aceptar
                          </button>
                        </div>
                      )}
                      {req.status === 'accepted' && <p className="pt-2.5 border-t border-gray-50 text-center text-green-600 text-xs font-semibold flex items-center justify-center gap-1"><Check className="w-3.5 h-3.5" />Aceptada — agendada</p>}
                      {req.status === 'rejected' && <p className="pt-2.5 border-t border-gray-50 text-center text-gray-400 text-xs flex items-center justify-center gap-1"><X className="w-3.5 h-3.5" />Rechazada</p>}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Próximos trabajos */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-gray-900">Próximos Trabajos</h2>
                <button onClick={() => navigate('/technician/schedule')} className="text-xs text-blue-600 hover:underline">Ver agenda →</button>
              </div>
              <div className="space-y-2">
                {UPCOMING_JOBS.map((job, i) => (
                  <div key={job.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5 flex items-center gap-3">
                    <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-green-700 font-bold text-[11px]">{job.clientInitials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{job.clientName}</p>
                      <p className="text-xs text-gray-500">{services[i % services.length] || job.service}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-400">
                        <span className="flex items-center gap-0.5"><Calendar className="w-2.5 h-2.5" />{new Date(job.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</span>
                        <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{job.time}</span>
                        <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{job.location.split(',')[0]}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-green-600 mb-1.5">${job.price.toLocaleString()}</p>
                      <div className="flex gap-1 justify-end">
                        <a href={`tel:${job.clientPhone}`} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"><Phone className="w-3 h-3" /></a>
                        <button onClick={() => { setChatOpen(true); openConv(Object.keys(INITIAL_MESSAGES)[i] || 'cli-001'); }} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"><MessageSquare className="w-3 h-3" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Acciones rápidas */}
            <div className="grid grid-cols-4 gap-2.5">
              {[
                { label: 'Agenda', icon: <Calendar className="w-6 h-6" />, color: 'text-blue-600 bg-blue-50', route: '/technician/schedule' },
                { label: 'Ingresos', icon: <DollarSign className="w-6 h-6" />, color: 'text-green-600 bg-green-50', route: '/technician/earnings' },
                { label: 'Historial', icon: <Briefcase className="w-6 h-6" />, color: 'text-purple-600 bg-purple-50', route: '/technician/history' },
                { label: 'Mi Perfil', icon: <User className="w-6 h-6" />, color: 'text-orange-600 bg-orange-50', route: '/technician/profile' },
              ].map(a => (
                <button key={a.label} onClick={() => navigate(a.route)} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5 hover:shadow-md transition-shadow text-center flex flex-col items-center gap-2">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${a.color}`}>{a.icon}</div>
                  <p className="text-xs font-medium text-gray-600">{a.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Columna derecha: panel de mensajes (desktop) */}
          <aside className="md:col-span-2 hidden md:flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-gray-900">Mensajes</h2>
              {totalUnread > 0 && <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">{totalUnread} nuevos</span>}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex-1 flex flex-col overflow-hidden" style={{ minHeight: 500 }}>
              {!selectedConv ? (
                <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                  {conversations.length === 0 && (
                    <div className="p-8 text-center text-gray-400">
                      <MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                      <p className="text-sm">Sin conversaciones</p>
                    </div>
                  )}
                  {conversations.map(conv => (
                    <button key={conv.contactId} onClick={() => openConv(conv.contactId)} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left">
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-xs font-bold">{conv.contactAvatar}</div>
                        {conv.online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between">
                          <p className={`text-sm truncate ${conv.unread > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{conv.contactName}</p>
                          <span className="text-[10px] text-gray-400 shrink-0 ml-1">{conv.lastMessageTime}</span>
                        </div>
                        <p className="text-[11px] text-blue-500 font-medium">{conv.contactRole}</p>
                        <p className="text-[11px] text-gray-500 truncate">{conv.lastMessage}</p>
                      </div>
                      {conv.unread > 0 && <span className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold shrink-0">{conv.unread}</span>}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100 bg-gray-50/80">
                    <button onClick={() => setSelectedConv(null)} className="p-1 hover:bg-gray-200 rounded-lg transition-colors"><ChevronLeft className="w-4 h-4 text-gray-500" /></button>
                    <div className="relative">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-[11px] font-bold">{currentConv?.contactAvatar}</div>
                      {currentConv?.online && <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border-[1.5px] border-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{currentConv?.contactName}</p>
                      <p className="text-[10px] text-gray-400">{currentConv?.online ? '● En línea' : 'Desconectado'}</p>
                    </div>
                    <button onClick={() => navigate('/chat')} className="text-[10px] text-blue-600 hover:underline shrink-0 font-medium">Abrir completo</button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
                    {currentConvMessages.map(msg => (
                      <div key={msg.id} className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[82%] px-3 py-2 rounded-2xl text-xs leading-relaxed shadow-sm ${
                          msg.fromMe ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
                        }`}>
                          <p>{msg.text}</p>
                          <p className={`text-[9px] mt-0.5 ${msg.fromMe ? 'text-blue-200' : 'text-gray-400'}`}>{msg.time}</p>
                        </div>
                      </div>
                    ))}
                    {typing && (
                      <div className="flex justify-start">
                        <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm">
                          <div className="flex items-center gap-1">
                            {[0, 150, 300].map(d => <span key={d} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  <div className="p-3 border-t border-gray-100 bg-white">
                    <div className="flex items-center gap-2">
                      <input
                        value={msgInput}
                        onChange={e => setMsgInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                        placeholder="Escribe un mensaje..."
                        className="flex-1 text-xs bg-gray-100 rounded-full px-3.5 py-2 outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                      />
                      <button onClick={handleSendMessage} disabled={!msgInput.trim()} className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-40 transition-all shrink-0">
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Botón flotante de mensajes (solo mobile) */}
      <button onClick={() => { setChatOpen(true); setSelectedConv(null); }} className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-blue-700 transition-all z-40">
        <MessageSquare className="w-6 h-6" />
        {totalUnread > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">{totalUnread}</span>}
      </button>

      {/* Panel de mensajes mobile (slide-over) */}
      {chatOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col bg-white">
          {!selectedConv ? (
            <>
              <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100 bg-gray-50">
                <button onClick={() => setChatOpen(false)} className="p-2 hover:bg-gray-200 rounded-xl"><X className="w-5 h-5 text-gray-600" /></button>
                <div className="flex-1">
                  <h2 className="font-bold text-gray-900">Mensajes de Clientes</h2>
                  {totalUnread > 0 && <p className="text-xs text-blue-600">{totalUnread} sin leer</p>}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                {conversations.map(conv => (
                  <button key={conv.contactId} onClick={() => openConv(conv.contactId)} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 text-left">
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-sm font-bold">{conv.contactAvatar}</div>
                      {conv.online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between">
                        <p className={`text-sm ${conv.unread > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{conv.contactName}</p>
                        <span className="text-xs text-gray-400 shrink-0">{conv.lastMessageTime}</span>
                      </div>
                      <p className="text-xs text-blue-500 font-medium">{conv.contactRole}</p>
                      <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                    </div>
                    {conv.unread > 0 && <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs text-white font-bold shrink-0">{conv.unread}</span>}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100 bg-gray-50">
                <button onClick={() => setSelectedConv(null)} className="p-2 hover:bg-gray-200 rounded-xl"><ChevronLeft className="w-5 h-5" /></button>
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-sm font-bold">{currentConv?.contactAvatar}</div>
                  {currentConv?.online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{currentConv?.contactName}</p>
                  <p className="text-xs text-gray-400">{currentConv?.online ? '● En línea' : 'Desconectado'}</p>
                </div>
                <button onClick={() => { setChatOpen(false); navigate('/chat'); }} className="text-sm text-blue-600 font-medium">Chat completo</button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {currentConvMessages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      msg.fromMe ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
                    }`}>
                      <p>{msg.text}</p>
                      <p className={`text-[11px] mt-0.5 ${msg.fromMe ? 'text-blue-200' : 'text-gray-400'}`}>{msg.time}</p>
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-1">
                        {[0, 150, 300].map(d => <span key={d} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-4 border-t border-gray-100 bg-white">
                <div className="flex items-center gap-3">
                  <input
                    value={msgInput}
                    onChange={e => setMsgInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    placeholder="Escribe un mensaje al cliente..."
                    className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                  />
                  <button onClick={handleSendMessage} disabled={!msgInput.trim()} className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-40 transition-all">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
