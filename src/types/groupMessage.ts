/**
 * Mensaje de chat grupal
 */
export interface GroupMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderEmail: string;
  content: string;
  createdAt: string;
}

/**
 * Solicitud para enviar mensaje
 */
export interface SendGroupMessageRequest {
  content: string;
}

/**
 * Respuesta al enviar mensaje
 */
export interface SendGroupMessageResponse {
  success: boolean;
  data?: GroupMessage;
  message?: string;
}

/**
 * Respuesta al obtener mensajes
 */
export interface GroupMessagesResponse {
  success: boolean;
  data?: {
    messages: GroupMessage[];
    total: number;
    hasMore: boolean;
  };
  message?: string;
}
