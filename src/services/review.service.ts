import apiService from "./api.service";
import type {
  CreateReviewData,
  ReviewResponse,
  ReviewListResponse,
  ReviewStats,
} from "../types/review";

/**
 * Servicio para manejar reseñas de lugares
 */
class ReviewService {
  /**
   * Crea una nueva reseña para un lugar
   * @param reviewData - Datos de la reseña (rating, content, placeId)
   * @returns Promise con la respuesta del servidor
   */
  async createReview(reviewData: CreateReviewData): Promise<ReviewResponse> {
    try {
      const formData = new FormData();
      formData.append('rating', reviewData.rating.toString());
      formData.append('content', reviewData.content);
      if (reviewData.media) {
        reviewData.media.forEach((file, index) => {
          formData.append(`media[${index}]`, file);
        });
      }

      const response = await apiService
        .getAxiosInstance()
        .post(`/places/${reviewData.placeId}/reviews`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      return response.data;
    } catch (error) {
      throw error as ReviewResponse;
    }
  }

  /**
   * Obtiene todas las reseñas de un lugar
   * @param placeId - ID del lugar
   * @returns Promise con la lista de reseñas
   */
  async getReviewsByPlaceId(placeId: string): Promise<ReviewListResponse> {
    try {
      const response = await apiService
        .getAxiosInstance()
        .get(`/places/${placeId}/reviews`);
      return response.data;
    } catch (error) {
      throw error as ReviewListResponse;
    }
  }

  /**
   * Obtiene un archivo de media
   * @param mediaId - ID del archivo de media
   * @returns Promise con el blob del archivo
   */
  async getReviewMedia(mediaId: string): Promise<Blob> {
    const response = await apiService
      .getAxiosInstance()
      .get(`/media/${mediaId}`, {
        responseType: 'blob',
      });
    return response.data;
  }

  /**
   * Obtiene las estadísticas de reseñas de un lugar
   * @param placeId - ID del lugar
   * @returns Promise con las estadísticas
   */
  async getReviewStats(placeId: string): Promise<ReviewStats> {
    const response = await apiService
      .getAxiosInstance()
      .get(`/places/${placeId}/reviews/stats`);
    return response.data;
  }
}

export default new ReviewService();
