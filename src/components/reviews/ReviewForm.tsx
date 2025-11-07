import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Paper,
} from "@mui/material";
import { Rating } from '@fluentui/react-rating';
import * as React from 'react';
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import reviewService from "../../services/review.service";
import type { CreateReviewData } from "../../types/review";
import MediaUploader from "./media/MediaUploader";
import { useUserStats } from "../../hooks/useUserStats";
import Notification from "../user_profile/Notification";

interface ReviewFormProps {
  placeId: string;
  onReviewCreated: () => void; // Callback para actualizar la lista de reseñas
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  placeId,
  onReviewCreated,
}) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { fetchUserStats, notification, clearNotification, setNotification } = useUserStats();
  const [rating, setRating] = React.useState<number | null>(null);
  const [content, setContent] = React.useState("");
  const [mediaFiles, setMediaFiles] = React.useState<File[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validar autenticación
    if (!isAuthenticated) {
      setError("Debe iniciar sesión para reseñar.");
      return;
    }

    // Validar rating
    if (!rating || rating < 1 || rating > 5) {
      setError("Debe seleccionar una calificación de 1 a 5 estrellas.");
      return;
    }

    // Validar contenido mínimo
    if (!content.trim()) {
      setError("Debe escribir una reseña.");
      return;
    }

    if (content.trim().length < 10) {
      setError("La reseña debe tener al menos 10 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const reviewData: CreateReviewData = {
        rating,
        content: content.trim(),
        placeId,
        media: mediaFiles.length > 0 ? mediaFiles : undefined,
      };

      const result = await reviewService.createReview(reviewData);

      // Check if there are any notifications from the backend (badges earned)
      if (result.notification) {
        setNotification(result.notification);
      }

      // Refresh user stats to update UI
      await fetchUserStats();

      // Mostrar mensaje de éxito
      setSuccess(true);

      // Limpiar formulario
      setRating(null);
      setContent("");
      setMediaFiles([]);

      // Callback para actualizar la lista
      onReviewCreated();

      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: unknown) {
      const errorMessage = (err as { message?: string })?.message || "";
      if (
        errorMessage.includes("no está autenticado") ||
        errorMessage.includes("not authenticated")
      ) {
        setError("Debe iniciar sesión para reseñar.");
      } else if (
        errorMessage.includes("almacenamiento") ||
        errorMessage.includes("guardar")
      ) {
        setError("Error al guardar la reseña.");
      } else {
        setError(errorMessage || "Error al guardar la reseña.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: 3,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Typography variant="h6" fontWeight={700}>
        Escribir una Reseña
      </Typography>

      {/* Mostrar notificaciones */}
      <Notification
        notification={notification}
        onClose={clearNotification}
      />

      {/* Mostrar alertas */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Reseña creada exitosamente
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        {!isAuthenticated ? (
          <Button
            variant="contained"
            onClick={handleLoginRedirect}
            sx={{ alignSelf: "flex-start" }}
          >
            Iniciar Sesión para Reseñar
          </Button>
        ) : (
          <>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Calificación *
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Rating
                  name="place-rating"
                  size="extra-large"
                  color="marigold"
                  max={5}
                  value={rating || 0}
                  onChange={(_, data) => setRating(data.value)}
                />
              </Box>
            </Box>
            <TextField
              multiline
              minRows={3}
              maxRows={6}
              placeholder="Comparte tu experiencia... (mínimo 10 caracteres)"
              fullWidth
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={loading}
              helperText={`${content.length} caracteres`}
              sx={{ mb: 2 }}
            />
            <MediaUploader
              onFilesChange={(files) => {
                const fileObjects = files.map((fileItem: { file: File }) => fileItem.file);
                setMediaFiles(fileObjects);
              }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={
                loading || !rating || rating < 1 || content.trim().length < 10
              }
              sx={{ alignSelf: "flex-start" }}
              startIcon={loading ? <CircularProgress size={16} /> : null}
            >
              {loading ? "Publicando..." : "Publicar Reseña"}
            </Button>
          </>
        )}
      </Box>
    </Paper>
  );
};

export default ReviewForm;
