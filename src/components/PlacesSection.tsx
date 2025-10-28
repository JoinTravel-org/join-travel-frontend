import React, { useEffect, useState } from "react";
import {
  Typography,
  Container,
  Box,
  Card,
  CardContent,
  CardMedia,
  Button,
  CircularProgress,
  Pagination,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import reviewService from "../services/review.service";
import type { Review } from "../types/review";
import type { Place } from "../types/place";
import { Rating } from "@fluentui/react-rating";
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

  useEffect(() => {
    const loadReviewsForPlaces = async () => {
      if (!places.length) {
        setPlacesWithReviews([]);
        return;
      }

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
          } catch {
            return { ...place, reviews: [], reviewsLoading: false };
          }
        })
      );

      setPlacesWithReviews(placesWithReviewsData);
    };

    loadReviewsForPlaces();
  }, [places]);

  const averageRating = (reviews?: Review[]) => {
    if (!reviews?.length) return 0;
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  };

  return (
    <Box
      sx={{
        py: { xs: 5, md: 8 },
        background: "linear-gradient(180deg, #f7fafc 0%, #eef3f7 100%)",
      }}
    >
      <Container maxWidth="lg">
        {/* Grid of Places */}
        <Box
          sx={{
            display: "grid",
            gap: 3,
            mb: 6,
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
              elevation={0}
              sx={{
                borderRadius: 3,
                textAlign: "center",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                cursor: "pointer",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
                },
              }}
              onClick={() => navigate(`/place/${place.id}`)}
            >
              <CardMedia
                component="img"
                height="180"
                image={place.image || "/placeholder-image.jpg"}
                alt={place.name}
                sx={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
              />
              <CardContent sx={{ p: 2.5 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "#002B5B",
                    mb: 1,
                    fontSize: "1.1rem",
                  }}
                >
                  {place.name}
                </Typography>

                {place.reviewsLoading ? (
                  <ReviewSkeleton count={1} />
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      mb: 1.5,
                    }}
                  >
                    <Rating
                      value={averageRating(place.reviews)}
                      size="medium"
                      style={{ pointerEvents: "none" }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ ml: 1, color: "#666", fontSize: "0.9rem" }}
                    >
                      ({place.reviews?.length || 0}{" "}
                      {(place.reviews?.length || 0) === 1
                        ? "Reseña"
                        : "Reseñas"}
                      )
                    </Typography>
                  </Box>
                )}

                <Button
                  variant="outlined"
                  size="small"
                  sx={{
                    mt: 1,
                    textTransform: "none",
                    borderRadius: 2,
                    borderColor: "#004C92",
                    color: "#004C92",
                    fontWeight: 600,
                    "&:hover": {
                      borderColor: "#003870",
                      backgroundColor: "#f5faff",
                    },
                  }}
                >
                  Ver Reseñas
                </Button>
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
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
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
