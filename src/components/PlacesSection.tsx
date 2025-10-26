import React, { useEffect, useState } from "react";
import {
  Typography,
  Container,
  Box,
  Card,
  CardContent,
  Rating,
  CircularProgress,
  Pagination,
  Divider,
  Chip,
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import reviewService from "../services/review.service";
import type { Review } from "../types/review";
import type { Place } from "../types/place";
import ReviewSkeleton from "./ReviewSkeleton";

interface Props {
  places: Place[];
  loading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
}

interface PlaceWithReviews extends Place {
  reviews?: Review[];
  reviewsLoading?: boolean;
}

const PlacesSection: React.FC<Props> = ({
  places,
  loading,
  page,
  totalPages,
  onPageChange,
}) => {
  const navigate = useNavigate();
  const [placesWithReviews, setPlacesWithReviews] = useState<
    PlaceWithReviews[]
  >([]);

  // Cargar reseñas para cada lugar cuando los lugares cambian
  useEffect(() => {
    const loadReviewsForPlaces = async () => {
      if (!places.length) {
        setPlacesWithReviews([]);
        return;
      }

      // Inicializar con loading state
      const placesWithLoadingState = places.map((place) => ({
        ...place,
        reviews: [],
        reviewsLoading: true,
      }));
      setPlacesWithReviews(placesWithLoadingState);

      const placesWithReviewsData = await Promise.all(
        places.map(async (place) => {
          try {
            const reviewResponse = await reviewService.getReviewsByPlaceId(
              place.id
            );
            const reviews = reviewResponse.success
              ? reviewResponse.data || []
              : [];
            return { ...place, reviews, reviewsLoading: false };
          } catch (error) {
            console.error(
              `Error loading reviews for place ${place.id}:`,
              error
            );
            return { ...place, reviews: [], reviewsLoading: false };
          }
        })
      );

      setPlacesWithReviews(placesWithReviewsData);
    };

    loadReviewsForPlaces();
  }, [places]);

  // Función para truncar texto de reseña a máximo 1000 caracteres
  const truncateReviewText = (
    text: string,
    maxLength: number = 1000
  ): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  return (
    <Box
      id="places-section"
      component="section"
      aria-labelledby="places-title"
      sx={{ py: { xs: 5, md: 8 } }}
    >
      <Container maxWidth="lg">
        <Typography
          id="places-title"
          variant="h2"
          component="h2"
          gutterBottom
          sx={{ fontWeight: 700, fontSize: "var(--fs-h2)" }}
        >
          Lugares Disponibles
        </Typography>

        <Box
          sx={{
            mt: 2,
            display: "grid",
            gap: { xs: 3, md: 4 },
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
              lg: "repeat(4, 1fr)",
            },
          }}
        >
          {placesWithReviews.map((place) => (
            <Card
              key={place.id}
              onClick={() => navigate(`/place/${place.id}`)}
              elevation={0}
              sx={{
                height: "100%",
                display: "flex",
                cursor: "pointer",
                flexDirection: "column",
                border: "2px solid #000",
                borderRadius: 2,
                backgroundColor: "#fff",
                boxShadow: "6px 6px 4px 0px rgba(0,0,0,0.7)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translate(-2px, -2px)",
                  boxShadow: "8px 8px 6px 0px rgba(0,0,0,0.7)",
                  borderColor: "#333",
                },
              }}
            >
              <Box
                sx={{
                  height: 200,
                  backgroundImage: `url(${
                    place.image || "/placeholder-image.jpg"
                  })`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundColor: "#f0f0f0",
                  borderBottom: "2px solid #000",
                }}
                onError={(e) => {
                  const target = e.target as HTMLDivElement;
                  target.style.backgroundImage = "url(/placeholder-image.jpg)";
                }}
              />
              <CardContent sx={{ flexGrow: 1, p: 3, backgroundColor: "#fff" }}>
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    fontSize: "1.25rem",
                    letterSpacing: "0.02em",
                    color: "#000",
                  }}
                >
                  {place.name}
                </Typography>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
                >
                  <Rating
                    value={place.rating || 0}
                    readOnly
                    size="small"
                    sx={{
                      "& .MuiRating-iconFilled": {
                        color: "#000",
                      },
                      "& .MuiRating-iconEmpty": {
                        color: "#ccc",
                      },
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      color: "#000",
                    }}
                  >
                    (
                    {typeof place.rating === "number"
                      ? place.rating.toFixed(1)
                      : "0.0"}
                    )
                  </Typography>
                </Box>

                {/* Sección de Reseñas */}
                <Divider sx={{ my: 2, borderColor: "#000", opacity: 0.2 }} />

                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      mb: 1,
                      color: "#000",
                      fontSize: "0.875rem",
                    }}
                  >
                    Reseñas:
                  </Typography>

                  {place.reviewsLoading ? (
                    <ReviewSkeleton count={3} />
                  ) : place.reviews && place.reviews.length > 0 ? (
                    <Box
                      sx={{
                        flexGrow: 1,
                        maxHeight: 160,
                        overflowY: "auto",
                        overflowX: "hidden",
                        width: "100%",
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
                      {place.reviews.slice(0, 3).map((review, index) => (
                        <Box
                          key={review.id}
                          sx={{
                            mb:
                              index < place.reviews!.length - 1 && index < 2
                                ? 1
                                : 0,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 1,
                              mb: 0.5,
                            }}
                          >
                            <Rating
                              value={review.rating}
                              readOnly
                              size="small"
                            />
                            <Typography
                              variant="caption"
                              sx={{ color: "#666" }}
                            >
                              por {review.userEmail.split("@")[0]}
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: "0.8rem",
                              color: "#333",
                              lineHeight: 1.3,
                              fontStyle: "italic",
                              wordWrap: "break-word",
                              overflowWrap: "break-word",
                              hyphens: "auto",
                              maxWidth: "100%",
                            }}
                          >
                            "{truncateReviewText(review.content, 150)}"
                          </Typography>
                          {index < place.reviews!.length - 1 && index < 2 && (
                            <Divider sx={{ mt: 1, opacity: 0.3 }} />
                          )}
                        </Box>
                      ))}

                      {place.reviews.length > 3 && (
                        <Chip
                          label={`+${place.reviews.length - 3} más`}
                          size="small"
                          variant="outlined"
                          sx={{
                            mt: 1,
                            height: 20,
                            fontSize: "0.7rem",
                            borderColor: "#000",
                            color: "#000",
                          }}
                        />
                      )}
                    </Box>
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "0.8rem",
                        color: "#666",
                        fontStyle: "italic",
                      }}
                    >
                      No hay reseñas para este lugar.
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4, mb: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={onPageChange}
              color="primary"
              size="large"
            />
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default PlacesSection;
