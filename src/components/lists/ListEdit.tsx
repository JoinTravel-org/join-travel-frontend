import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Fab,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import apiService from '../../services/api.service';
import type { List } from '../../types/list';
import type { Place } from '../../types/place';

const ListEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const auth = useAuth();

  const [list, setList] = useState<List | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Places management
  const [availablePlaces, setAvailablePlaces] = useState<Place[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const fetchList = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await apiService.getListById(id);
      setList(response.data);
      setTitle(response.data.title);
      setDescription(response.data.description || '');
    } catch (err: any) {
      console.error('Error fetching list:', err);
      setError(err.message || 'Error al cargar la lista');
    } finally {
      setLoading(false);
    }
  };

  const searchPlaces = async (query: string) => {
    if (query.length < 2) return;

    try {
      setSearchLoading(true);
      const response = await apiService.searchPlaces(query);
      // Filter out places already in the list
      const filteredPlaces = response.data.filter(
        (place: Place) => !list?.places.some(lp => lp.id === place.id)
      );
      setAvailablePlaces(filteredPlaces);
    } catch (err: any) {
      console.error('Error searching places:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSave = async () => {
    if (!list || !title.trim()) return;

    try {
      setSaving(true);
      setError(null);

      await apiService.updateList(list.id, {
        title: title.trim(),
        description: description.trim() || undefined,
      });

      // Update local state
      setList(prev => prev ? { ...prev, title: title.trim(), description: description.trim() || undefined } : null);

      // Show success message
      setError(null);
    } catch (err: any) {
      console.error('Error updating list:', err);
      setError(err.message || 'Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  const handleAddPlace = async (place: Place) => {
    if (!list) return;

    try {
      await apiService.addPlaceToList(list.id, place.id);

      // Update local state
      setList(prev => prev ? {
        ...prev,
        places: [...prev.places, place]
      } : null);

      // Reset search state
      setSearchQuery('');
      setAvailablePlaces([]);
      setShowSearch(false);
    } catch (err: any) {
      console.error('Error adding place to list:', err);
      setError(err.message || 'Error al agregar el lugar');
    }
  };

  const handleRemovePlace = async (placeId: string) => {
    if (!list) return;

    try {
      await apiService.removePlaceFromList(list.id, placeId);

      // Update local state
      setList(prev => prev ? {
        ...prev,
        places: prev.places.filter(p => p.id !== placeId)
      } : null);
    } catch (err: any) {
      console.error('Error removing place from list:', err);
      setError(err.message || 'Error al remover el lugar');
    }
  };

  useEffect(() => {
    if (auth.isAuthenticated) {
      fetchList();
    }
  }, [id, auth.isAuthenticated]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (!list) {
    return (
      <Box textAlign="center" py={8}>
        <Typography variant="h6" color="text.secondary">
          Lista no encontrada
        </Typography>
        <Button onClick={() => navigate('/lists')} sx={{ mt: 2 }}>
          Volver a Mis Listas
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/lists')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Editar Lista
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* List Details Form */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Detalles de la Lista
          </Typography>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={3}
              placeholder="Describe qué hace especial a esta colección de lugares..."
            />
          </Box>
        </CardContent>
      </Card>

      {/* Places Management */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Lugares en la Lista ({list.places.length}/20)
            </Typography>
            {list.places.length < 20 && !showSearch && (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setShowSearch(true)}
              >
                Agregar Lugar
              </Button>
            )}
          </Box>

          {/* Inline Search for Adding Places */}
          {showSearch && list.places.length < 20 && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <TextField
                fullWidth
                placeholder="Buscar lugares para agregar..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchPlaces(e.target.value);
                }}
                InputProps={{
                  endAdornment: searchLoading ? (
                    <CircularProgress size={20} />
                  ) : null,
                }}
                autoFocus
              />

              {availablePlaces.length > 0 && (
                <Box sx={{ mt: 2, maxHeight: 200, overflow: 'auto' }}>
                  {availablePlaces.slice(0, 5).map((place) => (
                    <Box
                      key={place.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 1,
                        borderRadius: 1,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'grey.100' },
                      }}
                      onClick={() => handleAddPlace(place)}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {place.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {place.address}
                        </Typography>
                      </Box>
                      <AddIcon color="primary" />
                    </Box>
                  ))}
                </Box>
              )}

              {searchQuery.length >= 2 && availablePlaces.length === 0 && !searchLoading && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                  No se encontraron lugares
                </Typography>
              )}

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button size="small" onClick={() => {
                  setShowSearch(false);
                  setSearchQuery('');
                  setAvailablePlaces([]);
                }}>
                  Cancelar
                </Button>
              </Box>
            </Box>
          )}

          {list.places.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No hay lugares en esta lista aún. Agrega algunos lugares para comenzar.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {list.places.map((place) => (
                <Chip
                  key={place.id}
                  label={place.name}
                  onDelete={() => handleRemovePlace(place.id)}
                  deleteIcon={<DeleteIcon />}
                  sx={{ m: 0.5 }}
                />
              ))}
            </Box>
          )}

          {list.places.length >= 20 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Has alcanzado el límite máximo de 20 lugares por lista.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Button
          variant="outlined"
          onClick={() => navigate('/lists')}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
          onClick={handleSave}
          disabled={saving || !title.trim()}
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </Box>


      {/* Mobile FAB */}
      <Fab
        color="primary"
        aria-label="save"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', md: 'none' },
        }}
        onClick={handleSave}
        disabled={saving || !title.trim()}
      >
        <SaveIcon />
      </Fab>
    </Box>
  );
};

export default ListEdit;