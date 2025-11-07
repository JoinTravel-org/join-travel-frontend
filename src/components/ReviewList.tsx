import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CircularProgress,
  Alert,
} from "@mui/material";
import reviewService from "../services/review.service";
import type { Review } from "../types/review";
import { Rating } from '@fluentui/react-rating';
import MediaCarousel from "./reviews/MediaCarousel";
import LikeButton from "./reviews/LikeButton";

interface ReviewListProps {
  placeId: string;
  refreshTrigger: number; // Para forzar refresh cuando se crea una nueva reseña
}

const ReviewList: React.FC<ReviewListProps> = ({ placeId, refreshTrigger }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await reviewService.getReviewsByPlaceId(placeId);
        if (response.success && response.data) {
          setReviews(response.data);
        } else {
          setReviews([]);
        }
      } catch (err: unknown) {
        const errorMessage = (err as { message?: string })?.message || "";
        setError(errorMessage || "Error al cargar las reseñas");
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [placeId, refreshTrigger]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Fecha no disponible";
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box
      sx={{
        height: "400px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography variant="h6" fontWeight={700} gutterBottom>
        Reseñas de Usuarios ({reviews.length})
      </Typography>

      {reviews.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Aún no hay reseñas para este lugar.
            <br />
            ¡Sé el primero en compartir tu experiencia!
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            flexGrow: 1,
            maxHeight: "calc(100% - 40px)",
            overflowY: "auto",
            pr: 1,
            "&::-webkit-scrollbar": {
              width: 6,
              backgroundColor: "rgba(0,0,0,0.05)",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(0,0,0,0.2)",
              borderRadius: 3,
              "&:hover": {
                backgroundColor: "rgba(0,0,0,0.3)",
              },
            },
            "&::-webkit-scrollbar-track": {
              borderRadius: 3,
            },
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, 1fr)",
              },
              gap: 2,
              width: "100%",
              pb: 2,
            }}
          >
            {reviews.map((review) => (
              <Card
                key={review.id}
                sx={{
                  borderRadius: 2,
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  "&:hover": {
                    backgroundColor: "rgba(0,0,0,0.02)",
                  },
                }}
              >
                {/* Header con usuario y rating */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{
                      wordBreak: "break-word",
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    {review.userEmail}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                    }}
                  >
                    <Rating
                      color="marigold"
                      size="small"
                      value={review.rating}
                      style={{ pointerEvents: 'none' }}
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: "0.7rem" }}
                    >
                      {formatDate(review.createdAt)}
                    </Typography>
                  </Box>
                </Box>

                {/* Contenido de la reseña */}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontSize: "0.875rem",
                    lineHeight: 1.4,
                    wordBreak: "break-word",
                    hyphens: "auto",
                  }}
                >
                  {review.content}
                </Typography>

                {/* Media attachments */}
                {review.media && review.media.length > 0 && (
                  <Box sx={{ mt: 2, mb: 1 }}>
                    <MediaCarousel media={review.media} />
                  </Box>
                )}

                {/* Like/Dislike buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <LikeButton
                    reviewId={review.id}
                    initialLikeCount={review.likeCount || 0}
                    initialDislikeCount={review.dislikeCount || 0}
                  />
                </Box>
              </Card>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ReviewList;
