import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardMedia,
  Button,
} from "@mui/material";
import MessageIcon from "@mui/icons-material/Message";
import userService from "../../services/user.service";
import api from "../../services/api.service";
import UserGallery from "./UserGallery";
import type { User } from "../../types/user";
import type { Place } from "../../types/place";
import type { Review, ReviewStats } from "../../types/review";
import reviewService from "../../services/review.service";
import { Rating } from '@fluentui/react-rating';
import { DirectChatDialog } from "../users_chats/DirectChatDialog";

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Place[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [favoritesError, setFavoritesError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  const currentUserId = localStorage.getItem("userId");
  const isOwnProfile = currentUserId === userId;

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) {
        setError("ID de usuario no proporcionado");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Get user basic info
        const userResponse = await userService.getUserById(userId);

        if (userResponse.success && userResponse.data) {
          setUser(userResponse.data);
        } else {
          setError(userResponse.message || "Usuario no encontrado");
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Error al cargar el perfil del usuario");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!userId) return;

      setFavoritesLoading(true);
      setFavoritesError(null);
      try {
        // Fetch favorites for the specific user being viewed
        const response = await api
          .getAxiosInstance()
          .get(`/users/${userId}/favorites`);
        if (response.data.success && response.data.data) {
          setFavorites(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching favorites:", error);
        setFavoritesError("Error al cargar lugares favoritos");
      } finally {
        setFavoritesLoading(false);
      }
    };

    fetchFavorites();
  }, [userId]);

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

  if (loading) {
    return (
      <div
        style={{
          padding: "20px",
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 8,
            width: "100%",
          }}
        >
          <CircularProgress />
        </Box>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div
        style={{
          padding: "20px",
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <Alert severity="error" sx={{ mb: 2, width: "100%" }}>
          {error || "Usuario no encontrado"}
        </Alert>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "20px",
        display: "flex",
        gap: "20px",
        flexWrap: "wrap",
      }}
    >
      {/* Left Sidebar - User Stats */}
      <div
        style={{
          flex: "0 0 300px",
          minWidth: "250px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <div>
          <h1 style={{ marginBottom: "8px" }}>Perfil de Usuario</h1>
          <p style={{ margin: 0, color: "#666" }}>
            {user.email || `Usuario ID: ${userId}`}
          </p>

          {/* Mensaje button - only show if not viewing own profile */}
          {!isOwnProfile && userId && (
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<MessageIcon />}
                onClick={() => setChatOpen(true)}
                fullWidth
              >
                Mensaje
              </Button>
            </Box>
          )}
        </div>

        {user.stats && (
          <div
            style={{
              padding: "12px",
              backgroundColor: "#f9f9f9",
              borderRadius: "6px",
            }}
          >
            <p
              style={{ margin: "0 0 8px 0", fontSize: "0.9rem", color: "#666" }}
            >
              Nivel {user.stats.level} • {user.stats.points} puntos
              {user.stats.badges && user.stats.badges.length > 0 && (
                <span>
                  {" "}
                  • {user.stats.badges.length} insignia
                  {user.stats.badges.length !== 1 ? "s" : ""}
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Main Content - Milestones and Favorites */}
      <div
        style={{
          flex: "2",
          minWidth: "600px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {/* Favorite Places Section */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Lugares Favoritos
          </Typography>

          {favoritesLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : favoritesError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {favoritesError}
            </Alert>
          ) : favorites.length === 0 ? (
            <Typography variant="body1" color="text.secondary">
              Este usuario no tiene lugares favoritos aún.
            </Typography>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                gap: 1.5,
              }}
            >
              {favorites.map((place) => (
                <Card
                  key={place.id}
                  sx={{
                    cursor: "pointer",
                    "&:hover": { boxShadow: 2 },
                    transition: "box-shadow 0.2s ease",
                  }}
                  onClick={() => navigate(`/place/${place.id}`)}
                >
                  <Box sx={{ position: "relative" }}>
                    <CardMedia
                      component="img"
                      height="100"
                      image={place.image || "/placeholder-image.jpg"}
                      alt={place.name}
                      sx={{ objectFit: "cover" }}
                    />
                  </Box>
                  <CardContent
                    sx={{ py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}
                  >
                    <Typography
                      variant="subtitle1"
                      component="h3"
                      sx={{ fontSize: "0.95rem", fontWeight: 600, mb: 0.5 }}
                    >
                      {place.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: "0.8rem" }}
                    >
                      {place.city || "Ciudad no especificada"}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

        {/* Gallery Section */}
        {userId && <UserGallery userId={userId} />}

        {/* Reviews Section */}
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

        {/* Listas de lugares próximamente Section */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Listas de lugares próximamente
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Próximamente podrás crear y compartir listas de lugares favoritos.
          </Typography>
        </Box>
        </Box>
      </div>

      {/* Direct Chat Dialog */}
      {!isOwnProfile && userId && user && (
        <DirectChatDialog
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          otherUserId={userId}
          otherUserEmail={user.email || `Usuario ${userId}`}
        />
      )}
    </div>
  );
};

export default UserProfile;
