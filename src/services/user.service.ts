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

  /**
   * Sigue a un usuario
   * @param userId - ID del usuario a seguir
   * @returns Promise con resultado de la operación
   */
  async followUser(
    userId: string
  ): Promise<{ success: boolean; data?: unknown; message?: string }> {
    try {
      const response = await apiService
        .getAxiosInstance()
        .post(`/users/${userId}/follow`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message || "Error al seguir al usuario");
      }
      throw new Error("Error al seguir al usuario");
    }
  }

  /**
   * Deja de seguir a un usuario
   * @param userId - ID del usuario a dejar de seguir
   * @returns Promise con resultado de la operación
   */
  async unfollowUser(
    userId: string
  ): Promise<{ success: boolean; data?: unknown; message?: string }> {
    try {
      const response = await apiService
        .getAxiosInstance()
        .delete(`/users/${userId}/follow`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message || "Error al dejar de seguir al usuario");
      }
      throw new Error("Error al dejar de seguir al usuario");
    }
  }

  /**
   * Verifica si el usuario actual está siguiendo a otro usuario
   * @param userId - ID del usuario a verificar
   * @returns Promise con resultado de la verificación
   */
  async isFollowing(userId: string): Promise<{ success: boolean; data?: { isFollowing: boolean }; message?: string }> {
    try {
      const response = await apiService
        .getAxiosInstance()
        .get(`/users/${userId}/is-following`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message || "Error al verificar seguimiento");
      }
      throw new Error("Error al verificar seguimiento");
    }
  }

  /**
   * Obtiene las estadísticas de seguidores de un usuario
   * @param userId - ID del usuario
   * @returns Promise con las estadísticas de seguidores/seguidos
   */
  async getFollowStats(userId: string): Promise<{ success: boolean; data?: { followersCount: number; followingCount: number }; message?: string }> {
    try {
      const response = await apiService
        .getAxiosInstance()
        .get(`/users/${userId}/follow-stats`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message || "Error al obtener estadísticas de seguimiento");
      }
      throw new Error("Error al obtener estadísticas de seguimiento");
    }
  }

  /**
   * Obtiene la lista de seguidores de un usuario
   * @param userId - ID del usuario
   * @param limit - Límite de resultados
   * @param offset - Offset para paginación
   * @returns Promise con la lista de seguidores
   */
  async getFollowers(
    userId: string,
    limit = 20,
    offset = 0
  ): Promise<{ success: boolean; data?: User[]; message?: string }> {
    try {
      const response = await apiService
        .getAxiosInstance()
        .get(`/users/${userId}/followers`, {
          params: { limit, offset },
        });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message || "Error al obtener seguidores");
      }
      throw new Error("Error al obtener seguidores");
    }
  }

  /**
   * Obtiene la lista de usuarios seguidos por un usuario
   * @param userId - ID del usuario
   * @param limit - Límite de resultados
   * @param offset - Offset para paginación
   * @returns Promise con la lista de usuarios seguidos
   */
  async getFollowing(
    userId: string,
    limit = 20,
    offset = 0
  ): Promise<{ success: boolean; data?: User[]; message?: string }> {
    try {
      const response = await apiService
        .getAxiosInstance()
        .get(`/users/${userId}/following`, {
          params: { limit, offset },
        });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message || "Error al obtener usuarios seguidos");
      }
      throw new Error("Error al obtener usuarios seguidos");
    }
  }

  /**
   * Actualiza el perfil del usuario (nombre y edad)
   * @param name - Nombre del usuario
   * @param age - Edad del usuario
   * @returns Promise con resultado de la operación
   */
  async updateProfile(
    name?: string,
    age?: number | null
  ): Promise<{ success: boolean; data?: User; message?: string }> {
    try {
      const response = await apiService
        .getAxiosInstance()
        .put(`/users/profile`, { name, age });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message || "Error al actualizar perfil");
      }
      throw new Error("Error al actualizar perfil");
    }
  }

  /**
   * Sube o actualiza el avatar del usuario
   * @param file - Archivo de imagen
   * @returns Promise con resultado de la operación
   */
  async uploadAvatar(
    file: File
  ): Promise<{ success: boolean; data?: { profilePicture: string; url: string }; message?: string }> {
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await apiService
        .getAxiosInstance()
        .post(`/users/profile/avatar`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message || "Error al subir avatar");
      }
      throw new Error("Error al subir avatar");
    }
  }

  /**
   * Elimina el avatar del usuario
   * @returns Promise con resultado de la operación
   */
  async deleteAvatar(): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiService
        .getAxiosInstance()
        .delete(`/users/profile/avatar`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message || "Error al eliminar avatar");
      }
      throw new Error("Error al eliminar avatar");
    }
  }
}

export default new UserService();
