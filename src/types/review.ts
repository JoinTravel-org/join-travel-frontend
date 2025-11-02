export interface ReviewMedia {
  id: string;
  filename: string;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  url: string; // URL to fetch the media file
  createdAt: string;
}

export interface Review {
  id: string;
  rating: number; // 1-5 stars
  content: string;
  placeId: string;
  userId: string;
  userEmail: string;
  createdAt: string;
  updatedAt: string;
  placeName?: string;
  media?: ReviewMedia[];
  likeCount?: number;
}

export interface CreateReviewData {
  rating: number;
  content: string;
  placeId: string;
  media?: File[];
}

export interface ReviewResponse {
  success: boolean;
  message: string;
  data?: Review;
  notification?: any; // For gamification notifications
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
