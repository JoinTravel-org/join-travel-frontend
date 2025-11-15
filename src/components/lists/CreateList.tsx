import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Button,
  Autocomplete,
  Container,
  Typography,
  Paper,
  TextField,
  Alert,
  CircularProgress,
  Stack,
  IconButton,
  Chip,
  Snackbar,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { Place } from '../../types/place';
import type { CreateListRequest } from '../../types/list';
import apiService from '../../services/api.service';

const CreateList: React.FC = () => {
  const navigate = useNavigate();
  const auth = useAuth();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPlaces, setSelectedPlaces] = useState<Place[]>([]);
  const [validationErrors, setValidationErrors] = useState<{title?: string; description?: string}>({});

  // Place search
  const [placeSearch, setPlaceSearch] = useState<string>("");
  const [placesRetrieved, setPlacesRetrieved] = useState<Place[]>([]);
  const [allPlaces, setAllPlaces] = useState<Place[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState<boolean>(false);
  const [placesError, setPlacesError] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  // Metadata
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);
  const [isProcessingSuccess, setIsProcessingSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate('/login');
      return;
    }

    // Fetch all places
    const fetchPlaces = async () => {
      setLoadingPlaces(true);
      setPlacesError(null);

      try {
        const response = await apiService.getPlaces(1, 100);
        if (response.places && Array.isArray(response.places)) {
          setAllPlaces(response.places);
          setPlacesRetrieved(response.places);
        } else {
          setPlacesError('No se pudieron cargar los lugares disponibles.');
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar lugares';
        setPlacesError(`Error al cargar lugares: ${errorMessage}`);
        console.error('Error fetching places:', err);
      } finally {
        setLoadingPlaces(false);
      }
    };

    fetchPlaces();
  }, [auth.isAuthenticated, navigate]);

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

  const handlePlaceSearch = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPlaceSearch(e.target.value);
  }

  const handlePlaceSelect = (_e: any, place: Place | null) => {
    setSelectedPlace(place);
    setError(null);
  }

  const handleAddPlace = () => {
    if (!selectedPlace) return;

    // Check if place is already selected
    if (selectedPlaces.find(p => p.id === selectedPlace.id)) {
      setError("Este lugar ya está en la lista.");
      return;
    }

    setSelectedPlaces(prev => [...prev, selectedPlace]);
    setSelectedPlace(null);
    setPlaceSearch("");
    setError(null);
  }

  const handleRemovePlace = (placeId: string) => {
    setSelectedPlaces(prev => prev.filter(p => p.id !== placeId));
  };

  // Debounced search for places
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!placeSearch.trim()) {
        setPlacesRetrieved(allPlaces);
      } else {
        const filteredPlaces = allPlaces.filter(place =>
          place.name.toLowerCase().includes(placeSearch.toLowerCase()) ||
          place.address.toLowerCase().includes(placeSearch.toLowerCase()) ||
          (place.city && place.city.toLowerCase().includes(placeSearch.toLowerCase()))
        );
        setPlacesRetrieved(filteredPlaces);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [placeSearch, allPlaces]);

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (!auth.user) {
      setError("Usuario no autenticado.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const listData: CreateListRequest = {
        title: title.trim(),
        ...(description.trim() && { description: description.trim() }),
      };

      const response = await apiService.createList(listData);

      // Add places to the list if any
      if (selectedPlaces.length > 0 && response.success && response.data) {
        const listId = response.data.id;
        for (const place of selectedPlaces) {
          await apiService.addPlaceToList(listId, place.id);
        }
      }

      setSuccessMessage('¡Lista creada exitosamente!');
      setSuccessSnackbarOpen(true);
      setIsProcessingSuccess(true);

      // Wait 2 seconds to show success message, then navigate
      await new Promise(resolve => setTimeout(resolve, 2000));

      navigate('/lists');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      if (errorMessage.includes('duplicate')) {
        setError('Esta lista ya existe.');
      } else {
        setError('Error al crear la lista. Por favor intenta de nuevo.');
      }
    } finally {
      setLoading(false);
      setIsProcessingSuccess(false);
    }
  };

  return (
    <>
      {/* Success Processing Backdrop */}
      {isProcessingSuccess && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <CircularProgress size={60} />
          <Typography variant="body1" color="primary" fontWeight={500} sx={{ mt: 2 }}>
            Creando lista...
          </Typography>
        </Box>
      )}

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontSize: { xs: '1.8rem', sm: '2.125rem' } }}
        >
          Crear Nueva Lista
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Detalles de la Lista
          </Typography>

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
            label="Descripción (opcional)"
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
            sx={{ mb: 3 }}
          />

          <Typography variant="h6" gutterBottom>
            Agregar Lugares
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Autocomplete
              options={placesRetrieved}
              getOptionLabel={(option) => option.name}
              value={selectedPlace}
              onChange={handlePlaceSelect}
              loading={loadingPlaces}
              disabled={loadingPlaces || !!placesError}
              renderInput={(params) => (
                <TextField
                  {...params}
                  onChange={handlePlaceSearch}
                  label={loadingPlaces ? "Cargando lugares..." : "Buscar lugares"}
                  variant="outlined"
                  helperText={
                    placesError ? placesError :
                    placesRetrieved.length === 0 && !loadingPlaces ? "No se encontraron lugares" :
                    `${placesRetrieved.length} lugar${placesRetrieved.length !== 1 ? 'es' : ''} encontrado${placesRetrieved.length !== 1 ? 's' : ''}`
                  }
                  error={!!placesError}
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
                  disabled={selectedPlaces.length >= 20}
                >
                  Agregar Lugar
                </Button>
              </Box>
            )}
          </Box>

          {selectedPlaces.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                Lugares seleccionados ({selectedPlaces.length}/20):
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedPlaces.map((place) => (
                  <Chip
                    key={place.id}
                    label={place.name}
                    onDelete={() => handleRemovePlace(place.id)}
                    deleteIcon={<CloseIcon />}
                  />
                ))}
              </Box>
            </Box>
          )}

          {placesError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {placesError}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Stack
            direction={{ xs: "column-reverse", sm: "row" }}
            spacing={2}
          >
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading || isProcessingSuccess || !title.trim() || title.length < 3 || description.length > 500}
              sx={{
                minWidth: { xs: "auto", sm: 120 },
                width: { xs: "100%", sm: "auto" }
              }}
            >
              {loading ? <CircularProgress size={20} /> : 'Crear Lista'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/lists')}
              disabled={isProcessingSuccess}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              Cancelar
            </Button>
          </Stack>
        </Paper>

        {/* Success Snackbar */}
        <Snackbar
          open={successSnackbarOpen}
          autoHideDuration={1900}
          onClose={() => setSuccessSnackbarOpen(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          sx={{ zIndex: 10000 }}
        >
          <Alert
            onClose={() => setSuccessSnackbarOpen(false)}
            severity="success"
            variant="filled"
            sx={{ width: "100%" }}
          >
            {successMessage}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default CreateList;