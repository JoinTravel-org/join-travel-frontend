/**
 * Tipos para el sistema de chat entre usuarios
 */

/**
 * Usuario participante en el chat
 */
export interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
}

/**
 * Mensaje individual en una conversación
 */
export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: number;
  status?: 'sent' | 'delivered' | 'read';
}

/**
 * Conversación entre usuarios
 */
export interface Conversation {
  id: string;
  participants: ChatUser[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  updatedAt: number;
}
