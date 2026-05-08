import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { TECHNICIANS, CLIENT } from '../data/mockData';

export interface ConversationPreview {
  contactId: string;
  contactName: string;
  contactRole: string;
  contactAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  online: boolean;
}

interface MessagesContextType {
  conversations: ConversationPreview[];
  totalUnread: number;
  markConversationRead: (contactId: string) => void;
  updateConversation: (contactId: string, message: string) => void;
  clearAllUnread: () => void;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

// Conversaciones iniciales del cliente con los 5 técnicos
const INITIAL_CLIENT_CONVERSATIONS: ConversationPreview[] = [
  {
    contactId: 'tec-001',
    contactName: TECHNICIANS[0].name,
    contactRole: TECHNICIANS[0].specialty,
    contactAvatar: TECHNICIANS[0].initials,
    lastMessage: 'Perfecto, confirmo que estaré ahí a las 10:00 AM. ¿Necesitas algo más?',
    lastMessageTime: '10:30',
    unread: 1,
    online: TECHNICIANS[0].online,
  },
  {
    contactId: 'tec-002',
    contactName: TECHNICIANS[1].name,
    contactRole: TECHNICIANS[1].specialty,
    contactAvatar: TECHNICIANS[1].initials,
    lastMessage: 'El servicio de plomería quedó listo. Gracias por su confianza.',
    lastMessageTime: '14:30',
    unread: 1,
    online: TECHNICIANS[1].online,
  },
  {
    contactId: 'tec-003',
    contactName: TECHNICIANS[2].name,
    contactRole: TECHNICIANS[2].specialty,
    contactAvatar: TECHNICIANS[2].initials,
    lastMessage: '¿Tiene las medidas del closet que necesita? Lo necesito antes de cotizar.',
    lastMessageTime: 'Ayer',
    unread: 0,
    online: TECHNICIANS[2].online,
  },
  {
    contactId: 'tec-004',
    contactName: TECHNICIANS[3].name,
    contactRole: TECHNICIANS[3].specialty,
    contactAvatar: TECHNICIANS[3].initials,
    lastMessage: 'Recuerda hacer limpieza de filtros cada 3 meses. ¡Hasta la próxima!',
    lastMessageTime: 'Hace 3 días',
    unread: 0,
    online: TECHNICIANS[3].online,
  },
  {
    contactId: 'tec-005',
    contactName: TECHNICIANS[4].name,
    contactRole: TECHNICIANS[4].specialty,
    contactAvatar: TECHNICIANS[4].initials,
    lastMessage: 'Te confirmo disponibilidad el próximo lunes o miércoles.',
    lastMessageTime: 'Hace 4 días',
    unread: 0,
    online: TECHNICIANS[4].online,
  },
];

// Conversaciones iniciales del técnico con sus clientes
const INITIAL_TECH_CONVERSATIONS: ConversationPreview[] = [
  {
    contactId: 'cli-001',
    contactName: CLIENT.name,
    contactRole: 'Cliente',
    contactAvatar: CLIENT.initials,
    lastMessage: 'La dirección es Colonia Narvarte, Insurgentes Sur 890, int. 4B.',
    lastMessageTime: '09:00',
    unread: 1,
    online: true,
  },
  {
    contactId: 'rs-001',
    contactName: 'Roberto Silva Méndez',
    contactRole: 'Cliente',
    contactAvatar: 'RS',
    lastMessage: 'Perfecto, nos vemos el jueves. Gracias.',
    lastMessageTime: 'Hace 1 h',
    unread: 1,
    online: false,
  },
  {
    contactId: 'aj-001',
    contactName: 'Ana Patricia Jiménez',
    contactRole: 'Cliente',
    contactAvatar: 'AJ',
    lastMessage: 'Muchas gracias por la rápida atención, excelente servicio.',
    lastMessageTime: 'Hace 3 h',
    unread: 0,
    online: true,
  },
];

export function MessagesProvider({
  children,
  isTechnician,
}: {
  children: ReactNode;
  isTechnician: boolean;
}) {
  const [conversations, setConversations] = useState<ConversationPreview[]>(
    isTechnician ? INITIAL_TECH_CONVERSATIONS : INITIAL_CLIENT_CONVERSATIONS
  );

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);

  const markConversationRead = useCallback((contactId: string) => {
    setConversations(prev =>
      prev.map(c => (c.contactId === contactId ? { ...c, unread: 0 } : c))
    );
  }, []);

  const updateConversation = useCallback((contactId: string, message: string) => {
    const now = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    setConversations(prev =>
      prev.map(c =>
        c.contactId === contactId
          ? { ...c, lastMessage: message, lastMessageTime: now, unread: 0 }
          : c
      )
    );
  }, []);

  const clearAllUnread = useCallback(() => {
    setConversations(prev => prev.map(c => ({ ...c, unread: 0 })));
  }, []);

  return (
    <MessagesContext.Provider value={{ conversations, totalUnread, markConversationRead, updateConversation, clearAllUnread }}>
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages() {
  const ctx = useContext(MessagesContext);
  if (!ctx) {
    return {
      conversations: [],
      totalUnread: 0,
      markConversationRead: () => {},
      updateConversation: () => {},
      clearAllUnread: () => {},
    } as MessagesContextType;
  }
  return ctx;
}
