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
import type { List } from "../../types/list";
import UserReviewList from "./UserReviewList";
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
  const [lists, setLists] = useState<List[]>([]);
  const [listsLoading, setListsLoading] = useState(false);
  const [listsError, setListsError] = useState<string | null>(null);
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
    const fetchLists = async () => {
      if (!userId) return;

      setListsLoading(true);
      setListsError(null);
      try {
        const response = isOwnProfile
          ? await api.getUserLists()
          : await api.getUserListsByUserId(userId);
        if (response.success && response.data) {
          setLists(response.data);
        }
      } catch (error) {
        console.error('Error fetching lists:', error);
        setListsError('Error al cargar listas');
      } finally {
        setListsLoading(false);
      }
    };

    fetchLists();
  }, [isOwnProfile, userId]);


  if (loading) {
    return (
      <Box
        sx={{
          padding: { xs: 2, sm: 3, md: 4 },
          display: "flex",
          gap: { xs: 2, sm: 3 },
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
      </Box>
    );
  }

  if (error || !user) {
    return (
      <Box
        sx={{
          padding: { xs: 2, sm: 3, md: 4 },
          display: "flex",
          gap: { xs: 2, sm: 3 },
          flexWrap: "wrap",
        }}
      >
        <Alert severity="error" sx={{ mb: 2, width: "100%" }}>
          {error || "Usuario no encontrado"}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        padding: { xs: 2, sm: 3, md: 4 },
        display: "flex",
        gap: { xs: 2, sm: 3 },
        flexDirection: { xs: "column", md: "row" },
        flexWrap: "wrap",
      }}
    >
      {/* Left Sidebar - User Stats */}
      <Box
        sx={{
          flex: { xs: "1 1 100%", md: "0 0 300px" },
          minWidth: { xs: "100%", md: "250px" },
          display: "flex",
          flexDirection: "column",
          gap: { xs: 2, sm: 3 },
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" sx={{ marginBottom: "8px" }}>
            Perfil de Usuario
          </Typography>
          <Typography variant="body1" sx={{ margin: 0, color: "text.secondary" }}>
            {user.email || `Usuario ID: ${userId}`}
          </Typography>

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
        </Box>

        {user.stats && (
          <Box
            sx={{
              padding: { xs: "10px", sm: "12px" },
              backgroundColor: "#f9f9f9",
              borderRadius: "6px",
            }}
          >
            <Typography
              variant="body2"
              sx={{ margin: "0 0 8px 0", color: "text.secondary" }}
            >
              Nivel {user.stats.level} • {user.stats.points} puntos
              {user.stats.badges && user.stats.badges.length > 0 && (
                <span>
                  {" "}
                  • {user.stats.badges.length} insignia
                  {user.stats.badges.length !== 1 ? "s" : ""}
                </span>
              )}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Main Content - Milestones and Favorites */}
      <Box
        sx={{
          flex: { xs: "1 1 100%", md: "2" },
          minWidth: { xs: "100%", md: "600px" },
          display: "flex",
          flexDirection: "column",
          gap: { xs: 2, sm: 3 },
        }}
      >
        {/* Favorite Places Section */}
        <Box sx={{ mt: { xs: 3, sm: 4 } }}>
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
                gridTemplateColumns: {
                  xs: "repeat(auto-fill, minmax(200px, 1fr))",
                  sm: "repeat(auto-fill, minmax(250px, 1fr))"
                },
                gap: { xs: 1, sm: 1.5 },
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
        {userId && <UserReviewList userId={userId} />}

        {/* Lists Section */}
        <Box sx={{ mt: { xs: 3, sm: 4 } }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Listas de lugares
          </Typography>

          {listsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : listsError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {listsError}
            </Alert>
          ) : lists.length === 0 ? (
            <Typography variant="body1" color="text.secondary">
              {isOwnProfile ? 'No tienes listas aún. ¡Crea tu primera lista de lugares favoritos!' : 'Este usuario no tiene listas aún.'}
            </Typography>
          ) : (
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(auto-fill, minmax(250px, 1fr))',
                sm: 'repeat(auto-fill, minmax(300px, 1fr))'
              },
              gap: { xs: 2, sm: 3 }
            }}>
              {lists.map((list) => (
                <Card
                  key={list.id}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 3 },
                    transition: 'box-shadow 0.2s ease',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onClick={() => navigate(`/list/${list.id}`)}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
                      {list.title}
                    </Typography>
                    {list.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {list.description}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary">
                      {list.places.length} lugar{list.places.length !== 1 ? 'es' : ''}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Box>

    {/* Direct Chat Dialog */}
    {!isOwnProfile && userId && user && (
      <DirectChatDialog
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        otherUserId={userId}
        otherUserEmail={user.email || `Usuario ${userId}`}
      />
    )}
  </Box>
  );
};

export default UserProfile;
