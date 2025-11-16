import apiService from "./api.service";
import Logger from "../logger";

/**
 * Interfaz para un mensaje directo
 */
export interface DirectMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  senderEmail?: string;
  receiverEmail?: string;
  senderName?: string;
  senderProfilePicture?: string;
  receiverName?: string;
  receiverProfilePicture?: string;
}

/**
 * Interfaz para una conversación
 */
export interface Conversation {
  conversationId: string;
  otherUser: {
    id: string;
    email: string;
    name?: string;
    profilePicture?: string;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    senderId: string;
  };
  unreadCount: number;
}

/**
 * Interfaz para el historial de conversación
 */
export interface ConversationHistory {
  conversationId: string;
  messages: DirectMessage[];
}

/**
 * Interfaz para la respuesta de envío de mensaje
 */
export interface SendMessageResponse {
  success: boolean;
  message: string;
  data?: DirectMessage;
}

/**
 * Interfaz para la respuesta de historial de conversación
 */
export interface ConversationHistoryResponse {
  success: boolean;
  data?: ConversationHistory;
}

/**
 * Interfaz para la respuesta de lista de conversaciones
 */
export interface ConversationsResponse {
  success: boolean;
  data?: Conversation[];
}

/**
 * Interfaz para la respuesta de contador de mensajes no leídos
 */
export interface UnreadCountResponse {
  success: boolean;
  data?: {
    unreadCount: number;
  };
}

/**
 * Interfaz para errores de la API
 */
export interface ApiError {
  success: false;
  message: string;
  errors?: string[];
}

/**
 * Servicio de mensajería directa
 */
class DirectMessageService {
  /**
   * Envía un mensaje directo a otro usuario
   * @param receiverId - ID del usuario receptor
   * @param content - Contenido del mensaje
   * @returns Promise con la respuesta del envío
   */
  async sendMessage(
    receiverId: string,
    content: string
  ): Promise<SendMessageResponse> {
    try {
      Logger.getInstance().info(
        `Attempting to send message to user: ${receiverId}`
      );
      const response = await apiService
        .getAxiosInstance()
        .post("/direct-messages", {
          receiverId,
          content,
        });
      Logger.getInstance().info(
        `Message sent successfully to user: ${receiverId}`
      );
      return response.data;
    } catch (error) {
      Logger.getInstance().error(
        `Failed to send message to user: ${receiverId}`,
        error
      );
      throw error as ApiError;
    }
  }

  /**
   * Obtiene el historial de conversación con otro usuario
   * @param otherUserId - ID del otro usuario
   * @param limit - Número de mensajes a obtener (por defecto 50)
   * @param offset - Offset de paginación (por defecto 0)
   * @returns Promise con el historial de conversación
   */
  async getConversationHistory(
    otherUserId: string,
    limit = 50,
    offset = 0
  ): Promise<ConversationHistoryResponse> {
    try {
      Logger.getInstance().info(
        `Attempting to get conversation history with user: ${otherUserId}`
      );
      const response = await apiService
        .getAxiosInstance()
        .get(`/direct-messages/conversation/${otherUserId}`, {
          params: { limit, offset },
        });
      Logger.getInstance().info(
        `Conversation history retrieved successfully for user: ${otherUserId}`
      );
      return response.data;
    } catch (error) {
      Logger.getInstance().error(
        `Failed to get conversation history with user: ${otherUserId}`,
        error
      );
      throw error as ApiError;
    }
  }

  /**
   * Obtiene todas las conversaciones del usuario actual
   * @returns Promise con la lista de conversaciones
   */
  async getConversations(): Promise<ConversationsResponse> {
    try {
      Logger.getInstance().info(`Attempting to get all conversations`);
      const response = await apiService
        .getAxiosInstance()
        .get("/direct-messages/conversations");
      Logger.getInstance().info(`All conversations retrieved successfully`);
      return response.data;
    } catch (error) {
      Logger.getInstance().error(`Failed to get all conversations`, error);
      throw error as ApiError;
    }
  }

  /**
   * Obtiene el contador de mensajes no leídos
   * @returns Promise con el contador de mensajes no leídos
   */
  async getUnreadCount(): Promise<UnreadCountResponse> {
    try {
      Logger.getInstance().info(`Attempting to get unread message count`);
      const response = await apiService
        .getAxiosInstance()
        .get("/direct-messages/unread-count");
      Logger.getInstance().info(`Unread message count retrieved successfully`);
      return response.data;
    } catch (error) {
      Logger.getInstance().error(`Failed to get unread message count`, error);
      throw error as ApiError;
    }
  }
}

export default new DirectMessageService();
