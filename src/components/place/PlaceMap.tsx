import React, { useEffect, useRef, useState } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import type { Place } from '../../types/place';

// Extend window interface for Google Maps
declare global {
  interface Window {
    google: typeof google;
  }
}

interface PlaceMapProps {
  place: Place;
}

const MapComponent: React.FC<{ place: Place }> = ({ place }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    // Parse coordinates to ensure they're numbers
    const position = {
      lat: parseFloat(place.latitude.toString()),
      lng: parseFloat(place.longitude.toString())
    };

    // Initialize map centered on the place
    const map = new google.maps.Map(mapRef.current, {
      center: position,
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });

    googleMapRef.current = map;

    // Create marker for the place
    const marker = new google.maps.Marker({
      position,
      map,
      title: place.name,
      icon: {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="14" fill="#1976d2" stroke="white" stroke-width="3"/>
            <text x="16" y="21" text-anchor="middle" fill="white" font-family="Arial" font-size="12" font-weight="bold">📍</text>
          </svg>
        `)}`,
        scaledSize: new google.maps.Size(32, 32),
        anchor: new google.maps.Point(16, 32),
      },
    });

    // Add info window
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="max-width: 200px;">
          <h3 style="margin: 0 0 8px 0; color: #1976d2;">${place.name}</h3>
          <p style="margin: 0; color: #666;">${place.address}</p>
          ${place.description ? `<p style="margin: 4px 0 0 0; font-size: 14px;">${place.description}</p>` : ''}
        </div>
      `,
    });

    marker.addListener('click', () => {
      infoWindow.open(map, marker);
    });

    markerRef.current = marker;

    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, [place]);

  return (
    <Box
      ref={mapRef}
      sx={{
        width: '100%',
        height: '300px',
        borderRadius: 2,
        overflow: 'hidden',
        border: '2px solid #e0e0e0',
      }}
    />
  );
};

const LoadingComponent: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '300px',
      border: '2px solid #e0e0e0',
      borderRadius: 2,
    }}
  >
    <CircularProgress />
  </Box>
);

const ErrorComponent: React.FC<{ error: string }> = ({ error }) => (
  <Box
    sx={{
      height: '300px',
      border: '2px solid #e0e0e0',
      borderRadius: 2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2,
    }}
  >
    <Alert severity="error" sx={{ width: '100%' }}>
      <Typography variant="body2">
        Error al cargar el mapa: {error}
      </Typography>
    </Alert>
  </Box>
);

const PlaceMap: React.FC<PlaceMapProps> = ({ place }) => {
  const [, setMapError] = useState<string | null>(null);

  const render = (status: Status) => {
    switch (status) {
      case Status.LOADING:
        return <LoadingComponent />;
      case Status.FAILURE:
        return <ErrorComponent error="No se pudo cargar el mapa. Verifica tu conexión a internet." />;
      case Status.SUCCESS:
        return <MapComponent place={place} />;
      default:
        return <ErrorComponent error="Estado desconocido del mapa" />;
    }
  };

  // Fetch API key from backend instead of environment
  const [apiKey, setApiKey] = useState<string>("");
  const [apiKeyLoading, setApiKeyLoading] = useState(true);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/maps/key`
        );
        if (response.ok) {
          const data = await response.json();
          setApiKey(data.apiKey);
        } else {
          setApiKeyError("No se pudo cargar la configuración de mapas");
        }
      } catch {
        setApiKeyError("Error al conectar con el servidor");
      } finally {
        setApiKeyLoading(false);
      }
    };

    fetchApiKey();
  }, []);

  if (apiKeyLoading) {
    return (
      <Box
        sx={{
          height: '300px',
          border: '2px solid #e0e0e0',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (apiKeyError || !apiKey) {
    return (
      <Box
        sx={{
          height: '300px',
          border: '2px solid #e0e0e0',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Alert severity="warning" sx={{ width: '100%' }}>
          <Typography variant="body2">
            {apiKeyError || "La clave de API de Google Maps no está configurada. El mapa no se puede mostrar."}
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Wrapper
      apiKey={apiKey}
      libraries={['places']}
      render={render}
      callback={(status: Status) => {
        if (status === Status.FAILURE) {
          setMapError('Error al inicializar Google Maps');
        }
      }}
    />
  );
};

export default PlaceMap;