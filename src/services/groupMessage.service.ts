import apiService from "./api.service";
import type {
  SendGroupMessageRequest,
  SendGroupMessageResponse,
  GroupMessagesResponse,
} from "../types/groupMessage";

/**
 * Servicio para manejar mensajes de chat grupal
 */
class GroupMessageService {
  /**
   * Envía un mensaje a un grupo
   * @param groupId - ID del grupo
   * @param data - Contenido del mensaje
   * @returns Promise con la respuesta del servidor
   */
  async sendMessage(
    groupId: string,
    data: SendGroupMessageRequest
  ): Promise<SendGroupMessageResponse> {
    try {
      const response = await apiService
        .getAxiosInstance()
        .post(`/groups/${groupId}/messages`, data);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
        if (axiosError.response?.status === 404) {
          throw new Error("El grupo ya no existe.");
        }
        if (axiosError.response?.status === 403) {
          throw new Error("No eres miembro de este grupo");
        }
        if (axiosError.response?.data?.message) {
          throw new Error(axiosError.response.data.message);
        }
      }
      throw new Error("Error al enviar el mensaje. Por favor intente nuevamente.");
    }
  }

  /**
   * Obtiene el historial de mensajes de un grupo
   * @param groupId - ID del grupo
   * @param limit - Número de mensajes a obtener
   * @param offset - Offset para paginación
   * @returns Promise con la lista de mensajes
   */
  async getMessages(
    groupId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<GroupMessagesResponse> {
    try {
      const response = await apiService
        .getAxiosInstance()
        .get(`/groups/${groupId}/messages`, {
          params: { limit, offset },
        });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
        if (axiosError.response?.status === 404) {
          throw new Error("El grupo ya no existe.");
        }
        if (axiosError.response?.status === 403) {
          throw new Error("No eres miembro de este grupo");
        }
        if (axiosError.response?.data?.message) {
          throw new Error(axiosError.response.data.message);
        }
      }
      throw new Error(
        "Error al cargar los mensajes. Por favor intente nuevamente."
      );
    }
  }
}

export default new GroupMessageService();
