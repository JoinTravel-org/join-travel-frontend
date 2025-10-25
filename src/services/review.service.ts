import apiService from "./api.service";
import type { 
    CreateReviewData, 
    ReviewResponse, 
    ReviewListResponse,
    ReviewStats 
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
            const response = await apiService.getAxiosInstance().post(
                `/places/${reviewData.placeId}/reviews`,
                {
                    rating: reviewData.rating,
                    content: reviewData.content,
                }
            );
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
            const response = await apiService.getAxiosInstance().get(
                `/places/${placeId}/reviews`
            );
            return response.data;
        } catch (error) {
            throw error as ReviewListResponse;
        }
    }

    /**
     * Obtiene las estadísticas de reseñas de un lugar
     * @param placeId - ID del lugar
     * @returns Promise con las estadísticas
     */
    async getReviewStats(placeId: string): Promise<ReviewStats> {
        const response = await apiService.getAxiosInstance().get(
            `/places/${placeId}/reviews/stats`
        );
        return response.data;
    }
}

export default new ReviewService();