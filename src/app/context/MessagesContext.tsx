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

// Conversaciones iniciales del cliente - VACÍO PARA CUENTAS NUEVAS
const INITIAL_CLIENT_CONVERSATIONS: ConversationPreview[] = [];

// Conversaciones iniciales del técnico con sus clientes - VACÍO PARA TÉCNICOS NUEVOS
const INITIAL_TECH_CONVERSATIONS: ConversationPreview[] = [];

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
