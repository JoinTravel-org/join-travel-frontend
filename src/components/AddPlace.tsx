import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  TextField,
  Alert,
  CircularProgress,
  Stack,
} from "@mui/material";
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { useNavigate } from "react-router-dom";
import { trackEvent } from "../utils/analytics";
import apiService from "../services/api.service";
import { useAuth } from "../hooks/useAuth";
import { useUserStats } from "../hooks/useUserStats";

const MapComponent: React.FC<{
  onPlaceSelect: (place: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    image?: string;
    city: string;
    description: string;
  }) => void;
}> = ({ onPlaceSelect }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();
  const [, setSearchBox] = useState<google.maps.places.SearchBox | undefined>();

  const onMapLoad = useCallback(
    (map: google.maps.Map) => {
      setMap(map);

      // Create search box
      const input = document.getElementById("pac-input") as HTMLInputElement;
      const searchBox = new google.maps.places.SearchBox(input);

      map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

      // Bias the SearchBox results towards current map's viewport
      map.addListener("bounds_changed", () => {
        searchBox.setBounds(map.getBounds() as google.maps.LatLngBounds);
      });

      // Set default location to Buenos Aires
      const buenosAires = new google.maps.LatLng(-34.6037, -58.3816);
      map.setCenter(buenosAires);
      map.setZoom(12);

      // Listen for the event fired when the user selects a prediction
      searchBox.addListener("places_changed", () => {
        const places = searchBox.getPlaces();

        if (places && places.length > 0) {
          const place = places[0];

          if (place.geometry && place.geometry.location) {
            // Extract city from address components
            const addressComponents = place.address_components || [];
            const cityComponent = addressComponents.find(component =>
              component.types.includes('locality') ||
              component.types.includes('administrative_area_level_2') ||
              component.types.includes('administrative_area_level_1')
            );
            const city = cityComponent ? cityComponent.long_name : "";

            const selectedPlace = {
              name: place.name || "",
              address: place.formatted_address || "",
              latitude: place.geometry.location.lat(),
              longitude: place.geometry.location.lng(),
              image:
                place.photos && place.photos.length > 0
                  ? place.photos[0].getUrl()
                  : undefined,
              city,
              description: "",
            };

            onPlaceSelect(selectedPlace);

            // Center map on selected place
            map.setCenter(place.geometry.location);
            map.setZoom(15);
          }
        }
      });

      setSearchBox(searchBox);
    },
    [onPlaceSelect]
  );

  React.useEffect(() => {
    if (ref.current && !map) {
      const newMap = new google.maps.Map(ref.current, {
        center: { lat: -34.6037, lng: -58.3816 }, // Buenos Aires coordinates
        zoom: 12,
      });
      onMapLoad(newMap);
    }
  }, [ref, map, onMapLoad]);

  return (
    <>
      <input
        id="pac-input"
        type="text"
        placeholder="Buscar lugares..."
        style={{
          boxSizing: "border-box",
          border: "1px solid transparent",
          width: "240px",
          height: "32px",
          padding: "0 12px",
          borderRadius: "3px",
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.3)",
          fontSize: "14px",
          outline: "none",
          textOverflow: "ellipses",
          position: "absolute",
          left: "50%",
          marginLeft: "-120px",
          top: "10px",
          zIndex: 1000,
        }}
      />
      <div ref={ref} style={{ height: "400px", width: "100%" }} />
    </>
  );
};

const AddPlace: React.FC = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const { fetchUserStats } = useUserStats();
  const hasCheckedAuth = React.useRef(false);

  useEffect(() => {
    if (!hasCheckedAuth.current) {
      hasCheckedAuth.current = true;
      if (!auth.isAuthenticated) {
        navigate("/login");
      }
    }
  }, [auth.isAuthenticated, navigate]);

  // ... resto del componente
  const [selectedPlace, setSelectedPlace] = useState<{
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    image?: string;
    city: string;
    description: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [apiKey, setApiKey] = useState<string>("");
  const [descriptionError, setDescriptionError] = useState<string | null>(null);

  // Fetch API key from backend instead of environment
  React.useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/maps/key`
        );
        if (response.ok) {
          const data = await response.json();
          setApiKey(data.apiKey);
        } else {
          setError("No se pudo cargar la configuración de mapas");
        }
      } catch {
        setError("Error al conectar con el servidor");
      }
    };

    fetchApiKey();
  }, []);

  const handlePlaceSelect = (place: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    image?: string;
    city: string;
    description: string;
  }) => {
    setSelectedPlace(place);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!selectedPlace) return;

    // Validate description length
    if (selectedPlace.description && (selectedPlace.description.length < 30 || selectedPlace.description.length > 1000)) {
      setDescriptionError("La descripción debe tener entre 30 y 1000 caracteres.");
      return;
    }

    setLoading(true);
    setError(null);
    setDescriptionError(null);

    try {
      // Call API to add place
      await apiService.addPlace({
        name: selectedPlace.name,
        address: selectedPlace.address,
        latitude: selectedPlace.latitude,
        longitude: selectedPlace.longitude,
        image: selectedPlace.image,
        city: selectedPlace.city,
        description: selectedPlace.description,
      });

      // Refresh user stats to trigger level up notifications
      await fetchUserStats();

      setSuccess(true);
      trackEvent("place_added", { place_name: selectedPlace.name });

      // Reset after success
      setTimeout(() => {
        setSuccess(false);
        setSelectedPlace(null);
      }, 3000);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      if (errorMessage.includes("duplicate")) {
        setError("Este lugar ya está registrado.");
      } else if (errorMessage.includes("external service")) {
        setError("Servicio externo no disponible.");
      } else {
        setError("Error al agregar el lugar. Por favor intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderMap = (status: Status) => {
    switch (status) {
      case Status.LOADING:
        return <CircularProgress />;
      case Status.FAILURE:
        return <Alert severity="error">Error al cargar Google Maps</Alert>;
      case Status.SUCCESS:
        return <MapComponent onPlaceSelect={handlePlaceSelect} />;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Agregar Nuevo Lugar
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Busca y selecciona un lugar en Google Maps
        </Typography>

        <Box sx={{ height: 400, position: "relative", mb: 3 }}>
          {apiKey ? (
            <Wrapper
              apiKey={apiKey}
              libraries={["places"]}
              render={renderMap}
            />
          ) : (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress />
            </Box>
          )}
        </Box>

        {selectedPlace && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Lugar seleccionado:
            </Typography>
            <TextField
              fullWidth
              label="Nombre"
              value={selectedPlace.name}
              InputProps={{ readOnly: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Dirección"
              value={selectedPlace.address}
              InputProps={{ readOnly: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Coordenadas"
              value={`${selectedPlace.latitude}, ${selectedPlace.longitude}`}
              InputProps={{ readOnly: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Ciudad"
              value={selectedPlace.city}
              onChange={(e) => setSelectedPlace({ ...selectedPlace, city: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Descripción"
              value={selectedPlace.description}
              onChange={(e) => {
                setSelectedPlace({ ...selectedPlace, description: e.target.value });
                setDescriptionError(null);
              }}
              multiline
              rows={3}
              helperText={`${selectedPlace.description.length}/1000 caracteres`}
              error={!!descriptionError}
              sx={{ mb: 2 }}
            />
            {descriptionError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {descriptionError}
              </Alert>
            )}
            {selectedPlace.image && (
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  sx={{ mb: 1, color: "text.secondary" }}
                >
                  Imagen del lugar:
                </Typography>
                <Box
                  component="img"
                  src={selectedPlace.image}
                  alt={`Vista previa de ${selectedPlace.name}`}
                  sx={{
                    width: "100%",
                    maxWidth: 300,
                    height: 200,
                    objectFit: "cover",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
              </Box>
            )}
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            ¡Lugar agregado exitosamente!
          </Alert>
        )}

        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!selectedPlace || loading}
            sx={{ minWidth: 120 }}
          >
            {loading ? <CircularProgress size={20} /> : "Agregar Lugar"}
          </Button>
          <Button variant="outlined" onClick={() => navigate("/")}>
            Cancelar
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default AddPlace;
