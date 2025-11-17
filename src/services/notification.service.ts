import apiService from "./api.service";
import type {
  NotificationResponse,
  NotificationListResponse,
} from "../types/notification";

class NotificationService {
  /**
   * Obtiene las notificaciones del usuario
   */
  async getNotifications(limit?: number): Promise<NotificationListResponse> {
    try {
      const params = limit ? { limit } : {};
      const response = await apiService
        .getAxiosInstance()
        .get("/notifications", { params });
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(
        err.response?.data?.message || "Error al obtener las notificaciones"
      );
    }
  }

  /**
   * Obtiene el conteo de notificaciones no leídas
   */
  async getUnreadCount(): Promise<{
    success: boolean;
    data: { count: number };
  }> {
    try {
      const response = await apiService
        .getAxiosInstance()
        .get("/notifications/unread/count");
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(
        err.response?.data?.message ||
          "Error al obtener el conteo de notificaciones"
      );
    }
  }

  /**
   * Marca una notificación como leída
   */
  async markAsRead(notificationId: string): Promise<NotificationResponse> {
    try {
      const response = await apiService
        .getAxiosInstance()
        .patch(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(
        err.response?.data?.message ||
          "Error al marcar la notificación como leída"
      );
    }
  }

  /**
   * Marca todas las notificaciones como leídas
   */
  async markAllAsRead(): Promise<NotificationResponse> {
    try {
      const response = await apiService
        .getAxiosInstance()
        .patch("/notifications/read/all");
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(
        err.response?.data?.message ||
          "Error al marcar todas las notificaciones como leídas"
      );
    }
  }

  /**
   * Elimina una notificación
   */
  async deleteNotification(
    notificationId: string
  ): Promise<NotificationResponse> {
    try {
      const response = await apiService
        .getAxiosInstance()
        .delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(
        err.response?.data?.message || "Error al eliminar la notificación"
      );
    }
  }
}

export default new NotificationService();
