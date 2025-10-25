export interface Review {
  id: string;
  rating: number; // 1-5 stars
  content: string;
  placeId: string;
  userId: string;
  userEmail: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewData {
  rating: number;
  content: string;
  placeId: string;
}

export interface ReviewResponse {
  success: boolean;
  message: string;
  data?: Review;
}

export interface ReviewListResponse {
  success: boolean;
  data?: Review[];
  message?: string;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
}
