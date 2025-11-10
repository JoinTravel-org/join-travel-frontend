import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  CircularProgress,
  Alert,
  Card,
  Button,
} from '@mui/material';
import { Rating } from '@fluentui/react-rating';
import reviewService from '../../services/review.service';
import type { Review, ReviewStats } from '../../types/review';

interface UserReviewListProps {
  userId: string;
}

const UserReviewList: React.FC<UserReviewListProps> = ({ userId }) => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!userId) return;

      setReviewsLoading(true);
      setReviewsError(null);
      try {
        const reviewsResponse = await reviewService.getReviewsByUserId(userId);
        if (reviewsResponse.success && reviewsResponse.data) {
          setReviews(reviewsResponse.data);
        }

        const statsResponse = await reviewService.getUserReviewStats(userId);
        if (statsResponse) {
          setReviewStats(statsResponse);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setReviewsError('Error al cargar reseñas');
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [userId]);

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Reseñas
      </Typography>

      {reviewStats && reviewStats.totalReviews > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Promedio de calificaciones: {reviewStats.averageRating.toFixed(1)} ⭐ ({reviewStats.totalReviews} reseña{reviewStats.totalReviews !== 1 ? 's' : ''})
        </Typography>
      )}

      {reviewsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : reviewsError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {reviewsError}
          <Button
            size="small"
            onClick={() => window.location.reload()}
            sx={{ ml: 2 }}
          >
            Intentar nuevamente
          </Button>
        </Alert>
      ) : reviews.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          Este usuario no ha escrito reseñas aún.
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {reviews.map((review) => (
            <Card
              key={review.id}
              sx={{
                p: 2,
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.2s ease'
              }}
              onClick={() => navigate(`/place/${review.placeId}`)}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box>
                  <Typography variant="h6" component="h3" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                    {review.placeName || 'Lugar desconocido'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(review.createdAt).toLocaleDateString('es-ES')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Rating
                    color="marigold"
                    size="small"
                    value={review.rating}
                    style={{ pointerEvents: 'none' }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {review.rating}/5
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {review.content}
              </Typography>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default UserReviewList;