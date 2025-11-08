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
        </Box>

        {/* Gallery Section */}
        {userId && <UserGallery userId={userId} />}
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
