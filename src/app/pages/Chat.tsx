import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import {
  ArrowLeft,
  Search,
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
  Star,
  MapPin,
  Image as ImageIcon,
  Check,
  CheckCheck,
  MessageSquare,
  User,
  Bell,
  BellOff,
  Trash2,
  Archive,
  Flag,
  Ban
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { useMessages } from '../context/MessagesContext';
import { useNotifications } from '../context/NotificationsContext';
import { TECHNICIANS, CLIENT } from '../data/mockData';

interface Contact {
  id: string;
  name: string;
  role: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  online: boolean;
  typing?: boolean;
  rating?: number;
  location?: string;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  time: string;
  date: string;
  read: boolean;
  type: 'text' | 'image' | 'file';
}

// Mensajes de ejemplo por contacto - VACÍO PARA CUENTAS NUEVAS
const MESSAGES_BY_CONTACT: Record<string, Message[]> = {};

export function Chat() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const isTechnician = user?.userType === 'Técnico';
  const { updateConversation, markConversationRead } = useMessages();
  const { addNotification } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  // ID del técnico que viene de ?tecnico= (cuando se llega desde ServiceCard)
  const tecnicoParamId = searchParams.get('tecnico');
  const [messageInput, setMessageInput] = useState('');
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Contactos según el rol
  const contacts: Contact[] = isTechnician
    ? [
        {
          id: 'cli-001',
          name: CLIENT.name,
          role: 'Cliente',
          avatar: CLIENT.initials,
          lastMessage: '',
          lastMessageTime: '',
          unread: 0,
          online: true,
          rating: undefined,
          location: CLIENT.location,
        },
      ]
    : [];

  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>(MESSAGES_BY_CONTACT);
  const [typingContactId, setTypingContactId] = useState<string | null>(null);

  // Respuestas automáticas realistas del técnico
  const AUTO_REPLIES: string[] = [
    '¡Entendido! En cuanto pueda confirmo los detalles.',
    'Perfecto, anotado. ¿Hay algo más que necesites?',
    'Recibido, gracias por la información.',
    'De acuerdo, voy a revisar mi agenda y te confirmo.',
    '¡Claro! Te aviso en cuanto esté listo.',
    'Muy bien, me pongo en contacto contigo pronto.',
    'Anotado. Cualquier duda que tengas, no dudes en escribirme.',
  ];

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentMessages = selectedContact ? (messagesMap[selectedContact.id] || []) : [];

  const handleSendMessage = useCallback(() => {
    if (!messageInput.trim() || !selectedContact) return;

    const now = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

    // 1. Agregar el mensaje del usuario
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      text: messageInput,
      time: now,
      date: 'Hoy',
      read: false,
      type: 'text',
    };
    setMessagesMap(prev => ({
      ...prev,
      [selectedContact.id]: [...(prev[selectedContact.id] || []), newMessage],
    }));
    updateConversation(selectedContact.id, messageInput);
    setMessageInput('');

    // 2. Simular que el técnico/cliente está escribiendo…
    const delay = 1800 + Math.random() * 1200; // entre 1.8 y 3 segundos
    setTypingContactId(selectedContact.id);

    setTimeout(() => {
      setTypingContactId(null);

      const replyText = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
      const replyTime = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

      // 3. Agregar la respuesta al chat
      const replyMessage: Message = {
        id: (Date.now() + 1).toString(),
        senderId: selectedContact.id,
        text: replyText,
        time: replyTime,
        date: 'Hoy',
        read: false,
        type: 'text',
      };
      setMessagesMap(prev => ({
        ...prev,
        [selectedContact.id]: [...(prev[selectedContact.id] || []), replyMessage],
      }));
      updateConversation(selectedContact.id, replyText);

      // 4. Crear notificación real en el Header
      addNotification({
        type: 'message',
        title: `Mensaje de ${selectedContact.name}`,
        message: replyText,
        actionUrl: `/chat?tecnico=${selectedContact.id}`,
      });
    }, delay);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageInput, selectedContact, updateConversation, addNotification]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  // Auto-seleccionar contacto: primero intenta el param ?tecnico=, luego el primero
  useEffect(() => {
    if (contacts.length === 0) return;
    if (tecnicoParamId) {
      const target = contacts.find(c => c.id === tecnicoParamId);
      if (target) {
        setSelectedContact(target);
        return;
      }
    }
    if (!selectedContact) {
      setSelectedContact(contacts[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(isTechnician ? '/technician/dashboard' : '/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al inicio</span>
          </button>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-180px)]">
          {/* Contacts Sidebar */}
          <Card className="col-span-12 lg:col-span-4 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl mb-4">Mensajes</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar conversación..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredContacts.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <p>No hay conversaciones aún</p>
                </div>
              ) : (
                filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => { setSelectedContact(contact); markConversationRead(contact.id); }}
                    className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                      selectedContact?.id === contact.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white flex-shrink-0">
                          <span>{contact.avatar}</span>
                        </div>
                        {contact.online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between mb-1">
                          <p className="text-sm font-medium truncate">{contact.name}</p>
                          <p className="text-xs text-gray-500 flex-shrink-0 ml-2">{contact.lastMessageTime}</p>
                        </div>
                        <p className="text-xs text-gray-600 mb-1">{contact.role}</p>
                        <p className={`text-sm truncate ${contact.typing ? 'text-blue-600 italic' : 'text-gray-600'}`}>
                          {contact.typing ? 'Escribiendo...' : contact.lastMessage || 'Sin mensajes'}
                        </p>
                      </div>
                      {contact.unread > 0 && (
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs text-white">{contact.unread}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Chat Area */}
          <Card className="col-span-12 lg:col-span-8 flex flex-col overflow-hidden">
            {selectedContact ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white">
                          <span>{selectedContact.avatar}</span>
                        </div>
                        {selectedContact.online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{selectedContact.name}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span>{selectedContact.role}</span>
                          {selectedContact.rating && (
                            <>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span>{selectedContact.rating}</span>
                              </div>
                            </>
                          )}
                          {selectedContact.location && (
                            <>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{selectedContact.location}</span>
                              </div>
                            </>
                          )}
                        </div>
                        {selectedContact.online ? (
                          <p className="text-xs text-green-600">En línea</p>
                        ) : (
                          <p className="text-xs text-gray-400">Desconectado</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="rounded-full p-2">
                        <Phone className="w-5 h-5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="rounded-full p-2">
                        <Video className="w-5 h-5" />
                      </Button>
                      <div className="relative">
                        <Button variant="ghost" size="sm" className="rounded-full p-2" onClick={() => setShowOptionsMenu(!showOptionsMenu)}>
                          <MoreVertical className="w-5 h-5" />
                        </Button>
                        {showOptionsMenu && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowOptionsMenu(false)} />
                            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                              <button onClick={() => { navigate('/profile'); setShowOptionsMenu(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors flex items-center gap-3">
                                <User className="w-4 h-4" />Ver perfil
                              </button>
                              <button onClick={() => { setIsMuted(!isMuted); setShowOptionsMenu(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors flex items-center gap-3">
                                {isMuted ? <><Bell className="w-4 h-4" />Activar notificaciones</> : <><BellOff className="w-4 h-4" />Silenciar conversación</>}
                              </button>
                              <button onClick={() => setShowOptionsMenu(false)} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors flex items-center gap-3">
                                <Archive className="w-4 h-4" />Archivar conversación
                              </button>
                              <button onClick={() => setShowOptionsMenu(false)} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors flex items-center gap-3">
                                <Flag className="w-4 h-4" />Reportar conversación
                              </button>
                              <div className="border-t border-gray-200 my-2"></div>
                              <button onClick={() => setShowOptionsMenu(false)} className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 transition-colors flex items-center gap-3 text-red-600">
                                <Ban className="w-4 h-4" />Bloquear
                              </button>
                              <button onClick={() => setShowOptionsMenu(false)} className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 transition-colors flex items-center gap-3 text-red-600">
                                <Trash2 className="w-4 h-4" />Eliminar conversación
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {currentMessages.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p>No hay mensajes aún. ¡Comienza la conversación!</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {currentMessages.map((message) => {
                        const isMe = message.senderId === 'me';
                        return (
                          <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] ${isMe ? 'order-2' : 'order-1'}`}>
                              <div className={`rounded-2xl px-4 py-2 ${isMe ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white text-gray-900 rounded-bl-sm'}`}>
                                <p className="text-sm">{message.text}</p>
                              </div>
                              <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <span>{message.time}</span>
                                {isMe && (message.read ? <CheckCheck className="w-3 h-3 text-blue-600" /> : <Check className="w-3 h-3" />)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                  {/* Indicador "escribiendo..." en tiempo real */}
                  {typingContactId === selectedContact?.id && (
                    <div className="flex items-end gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                        {selectedContact?.avatar}
                      </div>
                      <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex items-end gap-2">
                    <Button variant="ghost" size="sm" className="rounded-full p-2 flex-shrink-0">
                      <Paperclip className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="rounded-full p-2 flex-shrink-0">
                      <ImageIcon className="w-5 h-5" />
                    </Button>
                    <div className="flex-1 relative">
                      <textarea
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Escribe un mensaje..."
                        className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-32"
                        rows={1}
                        style={{ minHeight: '40px' }}
                      />
                      <Button variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2">
                        <Smile className="w-5 h-5" />
                      </Button>
                    </div>
                    <Button onClick={handleSendMessage} disabled={!messageInput.trim()} className="rounded-full p-3 flex-shrink-0">
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Selecciona una conversación para comenzar</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
