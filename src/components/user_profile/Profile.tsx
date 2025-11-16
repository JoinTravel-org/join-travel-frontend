import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useUserStats } from '../../hooks/useUserStats';
import UserStats from './UserStats';
import Notification from './Notification';
import Milestones from './Milestones';
import UserGallery from '../user/UserGallery';
import UserReviewList from '../user/UserReviewList';
import userService from '../../services/user.service';
import api from '../../services/api.service';
import type { Milestone } from '../../types/user';
import type { Place } from '../../types/place';
import type { List } from '../../types/list';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
  CardMedia,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { stats, notification, clearNotification } = useUserStats();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [milestonesLoading, setMilestonesLoading] = useState(false);
  const [favorites, setFavorites] = useState<Place[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [favoritesError, setFavoritesError] = useState<string | null>(null);
  const [lists, setLists] = useState<List[]>([]);
  const [listsLoading, setListsLoading] = useState(false);
  const [listsError, setListsError] = useState<string | null>(null);
  const navigate = useNavigate();

  console.log('[DEBUG] Profile component rendering, user:', user, 'stats:', stats, 'notification:', notification);

  useEffect(() => {
    const fetchMilestones = async () => {
      if (!user?.id) return;

      setMilestonesLoading(true);
      try {
        const response = await userService.getUserMilestones(user.id);
        if (response.success && response.data) {
          setMilestones(response.data);
        }
      } catch (error) {
        console.error('Error fetching milestones:', error);
      } finally {
        setMilestonesLoading(false);
      }
    };

    fetchMilestones();
  }, [user?.id]);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user?.id) return;

      setFavoritesLoading(true);
      setFavoritesError(null);
      try {
        const response = await api.getUserFavorites();
        if (response.success && response.data) {
          setFavorites(response.data);
        }
      } catch (error) {
        console.error('Error fetching favorites:', error);
        setFavoritesError('Error al cargar lugares favoritos');
      } finally {
        setFavoritesLoading(false);
      }
    };

    fetchFavorites();
  }, [user?.id]);

  useEffect(() => {
    const fetchLists = async () => {
      if (!user?.id) return;

      setListsLoading(true);
      setListsError(null);
      try {
        const response = await api.getUserLists();
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
  }, [user?.id]);

  if (!user) {
    return <div>Debe iniciar sesión para ver su perfil.</div>;
  }

  return (
    <Box sx={{
      padding: { xs: 2, sm: 3, md: 4 },
      display: 'flex',
      gap: { xs: 2, sm: 3 },
      flexDirection: { xs: 'column', md: 'row' },
      flexWrap: 'wrap'
    }}>
      {/* Left Sidebar - User Stats */}
      <Box sx={{
        flex: { xs: '1 1 100%', md: '0 0 300px' },
        minWidth: { xs: '100%', md: '250px' },
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 2, sm: 3 }
      }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ marginBottom: '8px' }}>
            Perfil de Usuario
          </Typography>
          <Typography variant="body1" sx={{ margin: 0, color: 'text.secondary' }}>
            Bienvenido, {user.email}
          </Typography>
        </Box>

        {stats && <UserStats stats={stats} />}

        <Notification
          notification={notification}
          onClose={clearNotification}
        />
      </Box>

      {/* Main Content - Milestones */}
      <Box sx={{
        flex: { xs: '1 1 100%', md: '2' },
        minWidth: { xs: '100%', md: '600px' },
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 2, sm: 3 }
      }}>
        {milestonesLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            Cargando hitos...
          </div>
        ) : (
          <>
            {/* Levels Section */}
            <Milestones milestones={milestones.filter(m => m.category === 'level')} />

            {/* Badges Section */}
            <Milestones milestones={milestones.filter(m => m.category === 'badge')} />

            {/* Favorite Places Section */}
            <Box sx={{ mt: { xs: 3, sm: 4 } }}>
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
                  No tienes lugares favoritos aún. ¡Explora y marca algunos como favoritos!
                </Typography>
              ) : (
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(auto-fill, minmax(200px, 1fr))',
                    sm: 'repeat(auto-fill, minmax(250px, 1fr))'
                  },
                  gap: { xs: 1, sm: 1.5 }
                }}>
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

            {/* Gallery Section */}
            {user?.id && <UserGallery userId={user.id} />}

            {/* Reviews Section */}
            {user?.id && <UserReviewList userId={user.id} />}

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
                  No tienes listas aún. ¡Crea tu primera lista de lugares favoritos!
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
          </>
        )}
      </Box>
    </Box>
  );
};

export default Profile;