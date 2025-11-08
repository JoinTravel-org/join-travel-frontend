import apiService from "./api.service";
import type {
  UserStatsResponse,
  MilestonesResponse,
  User,
  UserMediaResponse,
} from "../types/user";

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
  async updateUserPoints(
    userId: string,
    action: string
  ): Promise<UserStatsResponse> {
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
  async searchUsers(
    email: string
  ): Promise<{ success: boolean; data?: User[]; message?: string }> {
    const response = await apiService
      .getAxiosInstance()
      .get(`/users/search`, { params: { email } });
    return response.data;
  }

  /**
   * Busca un usuario específico por email
   * @param email - Email del usuario
   * @returns Promise con el usuario encontrado
   */
  async getUserByEmail(email: string): Promise<User> {
    try {
      const response = await apiService
        .getAxiosInstance()
        .get(`/users/email/${email}`);

      if (!response.data.success || !response.data.data) {
        throw new Error("Usuario no encontrado");
      }

      return response.data.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message || "Usuario no encontrado");
      }
      throw new Error("Usuario no encontrado");
    }
  }

  /**
   * Obtiene información básica de un usuario por ID
   * @param userId - ID del usuario
   * @returns Promise con la información del usuario
   */
  async getUserById(
    userId: string
  ): Promise<{ success: boolean; data?: User; message?: string }> {
    const response = await apiService
      .getAxiosInstance()
      .get(`/users/${userId}`);
    return response.data;
  }

  /**
   * Obtiene los archivos multimedia públicos de un usuario
   * @param userId - ID del usuario
   * @returns Promise con la lista de archivos multimedia
   */
  async getUserMedia(userId: string): Promise<UserMediaResponse> {
    try {
      const response = await apiService
        .getAxiosInstance()
        .get(`/users/${userId}/media`);
      return response.data;
    } catch (error) {
      throw error as UserMediaResponse;
    }
  }
}

export default new UserService();
