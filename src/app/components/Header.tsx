import {
  Bell, MessageSquare, User, LogOut, CheckCheck, X,
  Clock, Calendar, Star, Briefcase, Wrench, ChevronRight,
  Settings, Heart, ClipboardList, Zap, LogIn, UserPlus
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMessages } from '../context/MessagesContext';
import { useNotifications, Notification } from '../context/NotificationsContext';
import { useNavigate } from 'react-router';

export function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const { conversations, totalUnread, markConversationRead, clearAllUnread } = useMessages();
  const { notifications, unreadCount, markRead, markAllRead, deleteNotification } = useNotifications();
  const navigate = useNavigate();

  const isTechnician = user?.userType === 'Técnico';

  const closeAll = () => {
    setShowNotifications(false);
    setShowMessages(false);
    setShowUserMenu(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNotificationClick = (n: Notification) => {
    markRead(n.id);
    if (n.actionUrl) {
      navigate(n.actionUrl);
      setShowNotifications(false);
    }
  };

  const handleDeleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification(id);
  };

  const handleMessageClick = (contactId: string) => {
    markConversationRead(contactId);
    navigate(`/chat?tecnico=${contactId}`);
    setShowMessages(false);
  };

  const handleVerHistorial = () => {
    setShowNotifications(false);
    navigate(isTechnician ? '/technician/history' : '/my-bookings');
  };

  const getNotifIcon = (type: Notification['type']) => {
    const base = 'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0';
    switch (type) {
      case 'booking': return <div className={`${base} bg-blue-100`}><Calendar className="w-4 h-4 text-blue-600" /></div>;
      case 'message': return <div className={`${base} bg-green-100`}><MessageSquare className="w-4 h-4 text-green-600" /></div>;
      case 'review':  return <div className={`${base} bg-yellow-100`}><Star className="w-4 h-4 text-yellow-600" /></div>;
      case 'system':  return <div className={`${base} bg-purple-100`}><Zap className="w-4 h-4 text-purple-600" /></div>;
    }
  };

  const userName = user?.name ?? 'Usuario';
  const userInitials = userName.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => navigate(isTechnician ? '/technician/dashboard' : '/')}
          >
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm group-hover:bg-blue-700 transition-colors">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900">Tecno</span>
              <span className="text-lg font-bold text-blue-600">Connect</span>
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="flex items-center gap-1">

            {isAuthenticated ? (
              <>
                {/* ── Notificaciones ── */}
                <div className="relative">
                  <button
                    onClick={() => { setShowNotifications(v => !v); setShowMessages(false); setShowUserMenu(false); }}
                    className={`relative p-2.5 rounded-xl transition-colors ${showNotifications ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
                    title="Notificaciones"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center px-1 leading-none animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                      <div className="absolute right-0 top-full mt-2 w-[400px] bg-white rounded-2xl shadow-xl border border-gray-200 z-50 overflow-hidden flex flex-col max-h-[520px]">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                          <div>
                            <h3 className="font-semibold text-gray-900">Notificaciones</h3>
                            {unreadCount > 0 && (
                              <p className="text-xs text-gray-500">{unreadCount} sin leer</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                              <button
                                onClick={markAllRead}
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <CheckCheck className="w-3.5 h-3.5" />
                                Todo leído
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="overflow-y-auto flex-1">
                          {notifications.length === 0 ? (
                            <div className="py-12 text-center text-gray-400">
                              <Bell className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                              <p className="text-sm font-medium">Sin notificaciones</p>
                              <p className="text-xs mt-1">Aquí aparecerán tus alertas en tiempo real</p>
                            </div>
                          ) : (
                            notifications.map(n => (
                              <div
                                key={n.id}
                                onClick={() => handleNotificationClick(n)}
                                className={`group flex items-start gap-3 px-5 py-3.5 border-b border-gray-50 cursor-pointer transition-colors
                                  ${!n.read ? 'bg-blue-50/60 hover:bg-blue-50' : 'hover:bg-gray-50'}`}
                              >
                                {getNotifIcon(n.type)}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className={`text-sm leading-snug ${!n.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                                      {n.title}
                                    </p>
                                    <button
                                      onClick={(e) => handleDeleteNotification(n.id, e)}
                                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-200 rounded transition-all flex-shrink-0"
                                    >
                                      <X className="w-3.5 h-3.5 text-gray-500" />
                                    </button>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">
                                    {n.message}
                                  </p>
                                  <div className="flex items-center gap-1.5 mt-1.5">
                                    <Clock className="w-3 h-3 text-gray-400" />
                                    <span className="text-[11px] text-gray-400">{n.time}</span>
                                    {!n.read && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full ml-1" />}
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {notifications.length > 0 && (
                          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
                            <button
                              onClick={handleVerHistorial}
                              className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-1 py-1 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              Ver historial completo
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* ── Mensajes ── */}
                <div className="relative">
                  <button
                    onClick={() => { setShowMessages(v => !v); setShowNotifications(false); setShowUserMenu(false); }}
                    className={`relative p-2.5 rounded-xl transition-colors ${showMessages ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
                    title="Mensajes"
                  >
                    <MessageSquare className="w-5 h-5" />
                    {totalUnread > 0 && (
                      <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center px-1 leading-none">
                        {totalUnread}
                      </span>
                    )}
                  </button>

                  {showMessages && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowMessages(false)} />
                      <div className="absolute right-0 top-full mt-2 w-[380px] bg-white rounded-2xl shadow-xl border border-gray-200 z-50 overflow-hidden flex flex-col max-h-[480px]">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                          <div>
                            <h3 className="font-semibold text-gray-900">Mensajes</h3>
                            {totalUnread > 0 && (
                              <p className="text-xs text-gray-500">{totalUnread} sin leer</p>
                            )}
                          </div>
                          {totalUnread > 0 && (
                            <button
                              onClick={clearAllUnread}
                              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <CheckCheck className="w-3.5 h-3.5" />
                              Todo leído
                            </button>
                          )}
                        </div>

                        <div className="overflow-y-auto flex-1">
                          {conversations.length === 0 ? (
                            <div className="py-12 text-center text-gray-400">
                              <MessageSquare className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                              <p className="text-sm font-medium">Sin mensajes aún</p>
                              <p className="text-xs mt-1">Contrata un técnico para comenzar</p>
                            </div>
                          ) : (
                            conversations.map(conv => (
                              <div
                                key={conv.contactId}
                                onClick={() => handleMessageClick(conv.contactId)}
                                className={`flex items-center gap-3 px-5 py-3.5 border-b border-gray-50 cursor-pointer transition-colors
                                  ${conv.unread > 0 ? 'bg-blue-50/50 hover:bg-blue-50' : 'hover:bg-gray-50'}`}
                              >
                                <div className="relative flex-shrink-0">
                                  <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                    {conv.contactAvatar}
                                  </div>
                                  {conv.online && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-baseline justify-between mb-0.5">
                                    <p className={`text-sm truncate ${conv.unread > 0 ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                                      {conv.contactName}
                                    </p>
                                    <span className="text-[11px] text-gray-400 flex-shrink-0 ml-2">{conv.lastMessageTime}</span>
                                  </div>
                                  <p className="text-xs text-blue-500 font-medium mb-0.5">{conv.contactRole}</p>
                                  <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                                </div>
                                {conv.unread > 0 && (
                                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-[10px] text-white font-bold">{conv.unread}</span>
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>

                        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
                          <button
                            onClick={() => { navigate('/chat'); setShowMessages(false); }}
                            className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-1 py-1"
                          >
                            Abrir todos los mensajes
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* ── Menú de usuario (autenticado) ── */}
                <div className="relative ml-1">
                  <button
                    onClick={() => { setShowUserMenu(v => !v); setShowNotifications(false); setShowMessages(false); }}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors ${showUserMenu ? 'bg-blue-50' : 'hover:bg-gray-100'}`}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                      {userInitials}
                    </div>
                    <div className="text-left hidden md:block">
                      <p className="text-sm font-medium text-gray-900 leading-tight">{userName.split(' ')[0]}</p>
                      <p className="text-[11px] text-gray-500">{user?.userType ?? 'Cliente'}</p>
                    </div>
                  </button>

                  {showUserMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                      <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                        <div className="px-4 py-4 bg-gradient-to-br from-blue-600 to-blue-700">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                              {userInitials}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-white leading-tight">{userName}</p>
                              <p className="text-[11px] text-blue-200">{user?.email}</p>
                              <span className="inline-block mt-1 text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full">
                                {user?.userType ?? 'Cliente'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="py-1.5">
                          {isTechnician ? (
                            <>
                              <MenuItem icon={<Briefcase className="w-4 h-4" />} label="Mi panel" onClick={() => { navigate('/technician/dashboard'); closeAll(); }} />
                              <MenuItem icon={<Wrench className="w-4 h-4" />} label="Perfil profesional" onClick={() => { navigate('/technician/profile'); closeAll(); }} />
                              <MenuItem icon={<ClipboardList className="w-4 h-4" />} label="Mis servicios" onClick={() => { navigate('/technician/history'); closeAll(); }} />
                            </>
                          ) : (
                            <>
                              <MenuItem icon={<User className="w-4 h-4" />} label="Mi perfil" onClick={() => { navigate('/profile'); closeAll(); }} />
                              <MenuItem icon={<ClipboardList className="w-4 h-4" />} label="Mis contrataciones" onClick={() => { navigate('/my-bookings'); closeAll(); }} />
                              <MenuItem icon={<Heart className="w-4 h-4" />} label="Favoritos" onClick={() => { navigate('/favorites'); closeAll(); }} />
                              <MenuItem icon={<MessageSquare className="w-4 h-4" />} label="Mensajes" onClick={() => { navigate('/chat'); closeAll(); }} />
                            </>
                          )}
                          <MenuItem icon={<Settings className="w-4 h-4" />} label="Configuración" onClick={() => { navigate('/settings'); closeAll(); }} />
                        </div>

                        <div className="border-t border-gray-100 py-1.5">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Cerrar sesión
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              /* ── Botones de invitado (sin sesión) ── */
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Iniciar sesión</span>
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Registrarse</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MenuItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
    >
      <span className="text-gray-400">{icon}</span>
      {label}
    </button>
  );
}
