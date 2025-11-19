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
  Autocomplete,
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
  const [validationErrors, setValidationErrors] = useState<{title?: string; description?: string}>({});

  // Places management
  const [availablePlaces, setAvailablePlaces] = useState<Place[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

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

  const validateForm = () => {
    const errors: {title?: string; description?: string} = {};

    if (!title.trim()) {
      errors.title = 'El título es requerido';
    } else if (title.length < 3) {
      errors.title = 'El título debe tener al menos 3 caracteres';
    }

    if (description.length > 500) {
      errors.description = 'Límite superado.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!list) return;

    if (!validateForm()) return;

    try {
      setSaving(true);
      setError(null);

      await apiService.updateList(list.id, {
        title: title.trim(),
        description: description.trim() || undefined,
      });

      // Update local state
      setList(prev => prev ? { ...prev, title: title.trim(), description: description.trim() || null } : null);

      // Show success message
      setError(null);
    } catch (err: any) {
      console.error('Error updating list:', err);
      setError(err.message || 'Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  const handlePlaceSelect = (_e: any, place: Place | null) => {
    setSelectedPlace(place);
    setError(null);
  };

  const handleAddPlace = async () => {
    if (!list || !selectedPlace) return;

    try {
      await apiService.addPlaceToList(list.id, selectedPlace.id);

      // Update local state
      setList(prev => prev ? {
        ...prev,
        places: [...prev.places, selectedPlace]
      } : null);

      // Reset search state
      setSelectedPlace(null);
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
      <Box
        display="flex"
        alignItems="center"
        mb={3}
        flexDirection={{ xs: "column", sm: "row" }}
        textAlign={{ xs: "center", sm: "left" }}
      >
        <IconButton
          onClick={() => navigate('/lists')}
          sx={{ mr: { xs: 0, sm: 2 }, mb: { xs: 1, sm: 0 } }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontSize: { xs: '1.8rem', sm: '2.125rem' } }}
        >
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
              onChange={(e) => {
                setTitle(e.target.value);
                if (validationErrors.title) {
                  setValidationErrors(prev => ({ ...prev, title: undefined }));
                }
              }}
              sx={{ mb: 2 }}
              required
              error={!!validationErrors.title}
              helperText={validationErrors.title || `${title.length}/100 caracteres`}
              inputProps={{ maxLength: 100 }}
            />
            <TextField
              fullWidth
              label="Descripción"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (validationErrors.description) {
                  setValidationErrors(prev => ({ ...prev, description: undefined }));
                }
              }}
              multiline
              rows={3}
              placeholder="Describe qué hace especial a esta colección de lugares..."
              error={!!validationErrors.description}
              helperText={validationErrors.description || `${description.length}/500 caracteres`}
              inputProps={{ maxLength: 500 }}
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
              <Autocomplete
                options={availablePlaces}
                getOptionLabel={(option) => option.name}
                value={selectedPlace}
                onChange={handlePlaceSelect}
                loading={searchLoading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Buscar lugares para agregar..."
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      searchPlaces(e.target.value);
                    }}
                    autoFocus
                  />
                )}
                sx={{ mb: 2 }}
              />

              {selectedPlace && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Lugar seleccionado:
                  </Typography>
                  <Chip
                    label={selectedPlace.name}
                    variant="outlined"
                    color="primary"
                  />
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleAddPlace}
                  >
                    Agregar Lugar
                  </Button>
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
                  setSelectedPlace(null);
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
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexDirection={{ xs: "column-reverse", sm: "row" }}
        gap={2}
      >
        <Button
          variant="outlined"
          onClick={() => navigate('/lists')}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
          onClick={handleSave}
          disabled={saving || !title.trim() || title.length < 3 || description.length > 500}
          sx={{ width: { xs: "100%", sm: "auto" } }}
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
        disabled={saving || !title.trim() || title.length < 3 || description.length > 500}
      >
        <SaveIcon />
      </Fab>
    </Box>
  );
};

export default ListEdit;