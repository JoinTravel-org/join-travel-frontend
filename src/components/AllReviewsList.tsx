import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import reviewService from "../services/review.service";
import type { Review } from "../types/review";
import { Rating } from "@fluentui/react-rating";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 20;

const AllReviewsList: React.FC = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchAllReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await reviewService.getAllReviews(page, PAGE_SIZE);

        if (response.success && response.data) {
          setReviews((prev) =>
            page === 1 ? response.data! : [...prev, ...response.data!]
          );
          setHasMore(response.data.length === PAGE_SIZE);
        } else {
          setHasMore(false);
        }
      } catch (err: unknown) {
        const errorMessage = (err as { message?: string })?.message || "";
        setError(errorMessage || "Error al cargar las reseñas");
        setReviews([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    fetchAllReviews();
  }, [page]);

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

  const handleCardClick = (placeId: string) => {
    navigate(`/place/${placeId}`);
  };

  if (loading && page === 1) {
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
        height: reviews.length === 0 ? "auto" : "500px",
        display: "flex",
        flexDirection: "column",
        mt: 4,
      }}
    >
      <Typography variant="h6" fontWeight={700} gutterBottom>
        Todas las Reseñas ({reviews.length})
      </Typography>

      {reviews.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            No hay reseñas disponibles.
          </Typography>
        </Box>
      ) : (
        <>
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
                  onClick={() => handleCardClick(review.placeId)}
                  sx={{
                    cursor: "pointer",
                    borderRadius: 2,
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    "&:hover": {
                      backgroundColor: "rgba(0,0,0,0.02)",
                    },
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{
                      fontSize: "1.1rem",
                      color: "text.primary",
                      textAlign: "left",
                      alignSelf: "flex-start",
                    }}
                  >
                    📍 {review.placeName || "Lugar desconocido"}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontWeight: 500 }}
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
                        style={{ pointerEvents: "none" }}
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

                  {/* 📝 Review content */}
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
                </Card>
              ))}
            </Box>
          </Box>

          {hasMore && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                py: 2,
              }}
            >
              <Button
                variant="outlined"
                size="small"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={loading}
              >
                {loading ? "Cargando..." : "Cargar más"}
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default AllReviewsList;
