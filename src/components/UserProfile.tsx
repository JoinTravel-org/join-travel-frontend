import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardMedia,
} from '@mui/material';
import userService from '../services/user.service';
import api from '../services/api.service';
import type { User } from '../types/user';
import type { Place } from '../types/place';

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Place[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [favoritesError, setFavoritesError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) {
        setError('ID de usuario no proporcionado');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // First try to get user stats, which should include basic user info
        const statsResponse = await userService.getUserStats(userId);

        if (statsResponse.success && statsResponse.data) {
          // Create a user object from the stats response
          // Note: This assumes the stats endpoint returns user info along with stats
          // You might need to adjust this based on your actual API response
          const userData: User = {
            id: userId,
            email: '', // This might not be available in stats, you may need a separate endpoint
            isEmailConfirmed: true, // Default assumption
            createdAt: new Date().toISOString(), // This should come from API
            updatedAt: new Date().toISOString(), // This should come from API
            stats: statsResponse.data,
          };

          setUser(userData);
        } else {
          setError(statsResponse.message || 'Usuario no encontrado');
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Error al cargar el perfil del usuario');
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
        const response = await api.getAxiosInstance().get(`/users/${userId}/favorites`);
        if (response.data.success && response.data.data) {
          setFavorites(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching favorites:', error);
        setFavoritesError('Error al cargar lugares favoritos');
      } finally {
        setFavoritesLoading(false);
      }
    };

    fetchFavorites();
  }, [userId]);

  if (loading) {
    return (
      <div style={{ padding: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8, width: '100%' }}>
          <CircularProgress />
        </Box>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div style={{ padding: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
          {error || 'Usuario no encontrado'}
        </Alert>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
      {/* Left Sidebar - User Stats */}
      <div style={{
        flex: '0 0 300px',
        minWidth: '250px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div>
          <h1 style={{ marginBottom: '8px' }}>Perfil de Usuario</h1>
          <p style={{ margin: 0, color: '#666' }}>{user.email || `Usuario ID: ${userId}`}</p>
        </div>

        {user.stats && (
          <div style={{ maxWidth: '600px', margin: '16px auto', padding: '16px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <div>
              <h2 style={{ marginBottom: '16px' }}>
                Estadísticas de Usuario
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ marginRight: '8px' }}>⭐</span>
                    <h3 style={{ margin: 0 }}>
                      Nivel {user.stats.level}: {user.stats.levelName}
                    </h3>
                  </div>
                  <p style={{ color: '#666', margin: 0 }}>
                    {user.stats.points} puntos acumulados
                  </p>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ marginRight: '8px' }}>📈</span>
                    <p style={{ margin: 0 }}>
                      Progreso al siguiente nivel
                    </p>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${user.stats.progressToNext}%`,
                        height: '100%',
                        backgroundColor: '#1976d2',
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                  <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>
                    {user.stats.progressToNext}% completado
                  </p>
                </div>
              </div>

              {user.stats.badges && user.stats.badges.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <h4 style={{ marginBottom: '8px' }}>
                    🏆 {user.stats.badges.length} Insignia{user.stats.badges.length !== 1 ? 's' : ''} Obtenida{user.stats.badges.length !== 1 ? 's' : ''}
                  </h4>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Content - Milestones and Favorites */}
      <div style={{
        flex: '2',
        minWidth: '600px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* Favorite Places Section */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Lugares Favoritos
          </Typography>

          {favoritesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
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
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 1.5 }}>
              {favorites.map((place) => (
                <Card
                  key={place.id}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 2 },
                    transition: 'box-shadow 0.2s ease'
                  }}
                  onClick={() => navigate(`/place/${place.id}`)}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="100"
                      image={place.image || '/placeholder-image.jpg'}
                      alt={place.name}
                      sx={{ objectFit: 'cover' }}
                    />
                  </Box>
                  <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                    <Typography variant="subtitle1" component="h3" sx={{ fontSize: '0.95rem', fontWeight: 600, mb: 0.5 }}>
                      {place.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                      {place.city || 'Ciudad no especificada'}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      </div>
    </div>
  );
};

export default UserProfile;
