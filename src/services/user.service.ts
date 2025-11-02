import apiService from "./api.service";
import type { UserStatsResponse, MilestonesResponse, User } from "../types/user";

/**
 * Servicio para manejar estadísticas y niveles de usuario
 */
class UserService {
  /**
   * Obtiene las estadísticas del usuario
   * @param userId - ID del usuario
   * @returns Promise con las estadísticas del usuario
   */
  async getUserStats(userId: string): Promise<UserStatsResponse> {
    try {
      const response = await apiService
        .getAxiosInstance()
        .get(`/users/${userId}/stats`);
      return response.data;
    } catch (error) {
      throw error as UserStatsResponse;
    }
  }

  /**
   * Actualiza puntos del usuario (llamado después de acciones como reseñas)
   * @param userId - ID del usuario
   * @param action - Tipo de acción (e.g., 'review_created', 'vote_received')
   * @returns Promise con respuesta de actualización
   */
  async updateUserPoints(userId: string, action: string): Promise<UserStatsResponse> {
    try {
      const response = await apiService
        .getAxiosInstance()
        .post(`/users/${userId}/points`, { action });
      return response.data;
    } catch (error) {
      throw error as UserStatsResponse;
    }
  }

  /**
   * Obtiene los hitos/milestones del usuario para obtener insignias y subir de nivel
   * @param userId - ID del usuario
   * @returns Promise con los milestones del usuario
   */
  async getUserMilestones(userId: string): Promise<MilestonesResponse> {
    try {
      const response = await apiService
        .getAxiosInstance()
        .get(`/users/${userId}/milestones`);
      return response.data;
    } catch (error) {
      throw error as MilestonesResponse;
    }
  }

  /**
   * Busca usuarios por email
   * @param email - Email a buscar
   * @returns Promise con la lista de usuarios encontrados
   */
  async searchUsers(email: string): Promise<{ success: boolean; data?: User[]; message?: string }> {
    try {
      const response = await apiService
        .getAxiosInstance()
        .get(`/users/search`, { params: { email } });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new UserService();