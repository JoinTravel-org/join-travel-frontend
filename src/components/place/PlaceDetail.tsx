import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Container,
  CircularProgress,
  Button,
  TextField,
  Alert,
  Stack,
  Snackbar,
  Slide,
  IconButton,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import api from "../../services/api.service";
import type { Place } from "../../types/place";
import { useAuth } from "../../hooks/useAuth";
import ReviewForm from "../reviews/ReviewForm";
import ReviewList from "./ReviewList";
import QuestionList from "../questions/QuestionList";
import reviewService from "../../services/review.service";
import { Rating } from '@fluentui/react-rating';
import PlaceMap from "./PlaceMap";

const PlaceDetail: React.FC = () => {
  const INFO_NOT_AVAILABLE = "Información no disponible temporalmente";
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const auth = useAuth();
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState<string>("");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [savingDescription, setSavingDescription] = useState(false);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [descriptionSuccess, setDescriptionSuccess] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [reviewRefreshTrigger, setReviewRefreshTrigger] = useState(0);
  const [reviewStats, setReviewStats] = useState<{ averageRating: number; totalReviews: number }>({
    averageRating: 0,
    totalReviews: 0,
  });
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [favoriteError, setFavoriteError] = useState<string | null>(null);
  const [questionRefreshTrigger, setQuestionRefreshTrigger] = useState(0);

  useEffect (() => {
    const fetchReviewStats = async () => {
      try {
        if (!id) return;
        const stats = await reviewService.getReviewStats(id);
        setReviewStats({
          averageRating: stats.averageRating,
          totalReviews: stats.totalReviews,
        });
      } catch (error) {
        console.error("Error fetching review stats:", error);
      }
    };
    fetchReviewStats();
  }, [id]);

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        if (!id) return;
        const response = await api.getPlaceById(id);
        setPlace(response.data || response);
        setDescription(response.data?.description || "");
      } catch (error) {
        console.error("Error fetching place:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlace();
  }, [id]);

  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      if (!id || !auth.isAuthenticated) return;
      try {
        const status = await api.getFavoriteStatus(id);
        setIsFavorite(status.isFavorite);
      } catch (error) {
        console.error("Error fetching favorite status:", error);
      }
    };
    fetchFavoriteStatus();
  }, [id, auth.isAuthenticated]);

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );

  if (!place)
    return (
      <Container sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h5">No se encontró el lugar.</Typography>
      </Container>
    );

  const handleSaveDescription = async () => {
    if (!description.trim()) {
      setDescriptionError("Debe ingresar una descripción.");
      return;
    }

    if (description.length < 30 || description.length > 1000) {
      setDescriptionError(
        "La descripción debe tener entre 30 y 1000 caracteres."
      );
      return;
    }

    setSavingDescription(true);
    setDescriptionError(null);
    setDescriptionSuccess(false);

    try {
      await api.updatePlaceDescription(place.id, description);
      setPlace({ ...place, description });
      setDescriptionSuccess(true);
      setIsEditingDescription(false);
      setSnackbarOpen(true);
      setTimeout(() => {
        setDescriptionSuccess(false);
        setSnackbarOpen(false);
      }, 3000);
    } catch (error: unknown) {
      const errorMessage = (error as { message?: string })?.message || "";
      if (
        errorMessage.includes("network") ||
        errorMessage.includes("connection")
      ) {
        setDescriptionError(
          "Error de conexión. Por favor verifica tu conexión a internet."
        );
      } else {
        setDescriptionError(
          "Error al guardar la descripción. Por favor intenta de nuevo."
        );
      }
    } finally {
      setSavingDescription(false);
    }
  };

  const handleEditDescription = () => {
    if (!auth.isAuthenticated) {
      navigate("/login");
      return;
    }
    setIsEditingDescription(true);
    setDescriptionError(null);
    setDescriptionSuccess(false);
  };

  const handleCancelEdit = () => {
    setDescription(place.description || "");
    setIsEditingDescription(false);
    setDescriptionError(null);
    setDescriptionSuccess(false);
    setSnackbarOpen(false);
  };

  const handleToggleFavorite = async () => {
    if (!auth.isAuthenticated) {
      navigate("/login");
      return;
    }

    const previousState = isFavorite;
    setIsFavorite(!isFavorite); // Optimistic update
    setFavoriteLoading(true);
    setFavoriteError(null);

    try {
      await api.toggleFavorite(place!.id);
      // Keep the optimistic state since it succeeded
    } catch (error: unknown) {
      console.error("Error toggling favorite:", error);
      setIsFavorite(previousState); // Revert on error
      setFavoriteError("Error al marcar favorito.");
    } finally {
      setFavoriteLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      {/* ===== Main Two-Column Layout ===== */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "flex-start",
          gap: 4,
        }}
      >
        {/* ===== LEFT COLUMN: Place Info ===== */}
        <Card
          sx={{
            flex: { xs: "1 1 100%", md: "1 1 45%" },
            borderRadius: 3,
            boxShadow: 3,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              height: 500,
              backgroundImage: `url(${
                place.image || "/placeholder-image.jpg"
              })`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <CardContent sx={{ textAlign: "left" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography
                variant="h4"
                component="h1"
                fontWeight={700}
                gutterBottom
              >
                {place.name}
              </Typography>
              <IconButton
                onClick={handleToggleFavorite}
                disabled={favoriteLoading}
                sx={{
                  color: isFavorite ? 'error.main' : 'text.secondary',
                  '&:hover': {
                    color: isFavorite ? 'error.dark' : 'error.main',
                  },
                  transition: 'color 0.2s ease',
                }}
                aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              >
                {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
            </Box>
            <Typography variant="h6" color="text.secondary" fontWeight={300}>
              {place.city || INFO_NOT_AVAILABLE}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
              <Rating
                color="marigold"
                size="small"
                value={reviewStats.averageRating}
                style={{ pointerEvents: 'none' }}
              />
              <Typography variant="body2" sx={{ ml: 1 }}>
                {reviewStats.totalReviews} {reviewStats.totalReviews === 1 ? "reseña" : "reseñas"}
              </Typography>
            </Box>
            <Box sx={{ mt: 2 }}>
              {isEditingDescription ? (
                <Stack spacing={2}>
                  <TextField
                    multiline
                    minRows={4}
                    maxRows={8}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Escribe una descripción para este lugar..."
                    fullWidth
                    helperText={`${description.length}/1000 caracteres`}
                    error={!!descriptionError}
                  />
                  {descriptionError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {descriptionError}
                    </Alert>
                  )}
                  {descriptionSuccess && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                      ¡Descripción guardada exitosamente!
                    </Alert>
                  )}
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="contained"
                      onClick={handleSaveDescription}
                      disabled={savingDescription}
                      sx={{ minWidth: 120 }}
                      startIcon={
                        descriptionSuccess ? <CheckCircleIcon /> : undefined
                      }
                    >
                      {savingDescription ? (
                        <CircularProgress size={20} />
                      ) : descriptionSuccess ? (
                        "Guardado"
                      ) : (
                        "Guardar"
                      )}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={handleCancelEdit}
                      disabled={savingDescription}
                    >
                      Cancelar
                    </Button>
                  </Stack>
                </Stack>
              ) : (
                <Box>
                  <Typography variant="body1">
                    {place.description || "Lorem ipsum description"}
                  </Typography>
                  <Button
                    variant="text"
                    onClick={handleEditDescription}
                    sx={{ mt: 1, textTransform: "none" }}
                  >
                    {place.description
                      ? "Editar descripción"
                      : "Agregar descripción"}
                  </Button>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* ===== RIGHT COLUMN: Map + Add Review + Reviews ===== */}
        <Box
          sx={{
            flex: { xs: "1 1 100%", md: "1 1 55%" },
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          {/* --- Interactive Map --- */}
          <Box>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Ubicación
            </Typography>
            <PlaceMap place={place} />
          </Box>

          {/* --- Add Review Form --- */}
          <ReviewForm
            placeId={place.id}
            onReviewCreated={() => setReviewRefreshTrigger((prev) => prev + 1)}
          />

          {/* --- Reviews List --- */}
          <ReviewList
            placeId={place.id}
            refreshTrigger={reviewRefreshTrigger}
          />

          {/* --- Questions and Answers Section --- */}
          <QuestionList
            placeId={place.id}
            refreshTrigger={questionRefreshTrigger}
          />
        </Box>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        TransitionComponent={(props) => <Slide {...props} direction="up" />}
        transitionDuration={500}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          ¡Descripción guardada exitosamente!
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!favoriteError}
        autoHideDuration={3000}
        onClose={() => setFavoriteError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        TransitionComponent={(props) => <Slide {...props} direction="up" />}
        transitionDuration={500}
      >
        <Alert
          onClose={() => setFavoriteError(null)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {favoriteError}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PlaceDetail;
