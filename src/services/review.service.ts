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


  async getAllReviews(page: number, limit: number): Promise<ReviewListResponse> {
    try {
      const response = await apiService
        .getAxiosInstance()
        .get(`/places/reviews?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error as ReviewListResponse;
    }
  }

  /**
    * Toggle reaction on a review (like/dislike)
    * @param reviewId - Review ID
    * @param type - Type of reaction ('like' or 'dislike')
    * @returns Promise with reaction status
    */
   async toggleReaction(reviewId: string, type: 'like' | 'dislike'): Promise<{ reacted: boolean; reactionType: 'like' | 'dislike' | null; likeCount: number; dislikeCount: number; reviewId: string }> {
     try {
       const response = await apiService
         .getAxiosInstance()
         .post(`/places/reviews/${reviewId}/reaction`, { type });
       return response.data.data;
     } catch (error) {
       throw error;
     }
   }

   /**
    * Get reaction status for a review
    * @param reviewId - Review ID
    * @returns Promise with reaction status
    */
   async getReactionStatus(reviewId: string): Promise<{ reactionType: 'like' | 'dislike' | null; likeCount: number; dislikeCount: number; reviewId: string }> {
     try {
       const response = await apiService
         .getAxiosInstance()
         .get(`/places/reviews/${reviewId}/reaction`);
       return response.data.data;
     } catch (error) {
       throw error;
     }
   }
}

export default new ReviewService();
