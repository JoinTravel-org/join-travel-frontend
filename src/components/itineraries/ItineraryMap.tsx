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

interface ItineraryItem {
  id: string;
  placeId: string;
  date: string;
  place?: Place;
}

interface ItineraryMapProps {
  items: ItineraryItem[];
}

const MapComponent: React.FC<{ items: ItineraryItem[] }> = ({ items }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    // Initialize map
    const map = new google.maps.Map(mapRef.current, {
      center: { lat: -34.6037, lng: -58.3816 }, // Buenos Aires center
      zoom: 12,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });

    googleMapRef.current = map;

    // Clear existing markers and polyline
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    // Filter valid places with coordinates
    const validPlaces = items
      .filter(item => item.place?.latitude && item.place?.longitude)
      .map(item => item.place!)
      .filter((place, index, self) =>
        index === self.findIndex(p => p.id === place.id)
      ); // Remove duplicates

    const invalidPlaces = items.filter(item =>
      !item.place?.latitude || !item.place?.longitude
    );

    if (validPlaces.length === 0 && invalidPlaces.length === 0) {
      // No places at all - show message on map
      return;
    }

    // Create markers
    const bounds = new google.maps.LatLngBounds();
    const path: google.maps.LatLng[] = [];

    validPlaces.forEach((place, index) => {
      const position = {
        lat: parseFloat(place.latitude.toString()),
        lng: parseFloat(place.longitude.toString())
      };

      const marker = new google.maps.Marker({
        position,
        map,
        title: place.name,
        label: (index + 1).toString(),
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="14" fill="#1976d2" stroke="white" stroke-width="3"/>
              <text x="16" y="21" text-anchor="middle" fill="white" font-family="Arial" font-size="12" font-weight="bold">${index + 1}</text>
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

      markersRef.current.push(marker);
      path.push(new google.maps.LatLng(position.lat, position.lng));
      bounds.extend(position);
    });

    // Add gray markers for invalid places (without coordinates)
    invalidPlaces.forEach((item) => {
      if (!item.place) return;

      // Try to geocode the address for missing coordinates
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: item.place.address }, (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
        if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
          const position = results[0].geometry.location;

          const marker = new google.maps.Marker({
            position,
            map,
            title: `${item.place!.name} (Coordenadas estimadas)`,
            icon: {
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="14" fill="#9e9e9e" stroke="white" stroke-width="3"/>
                  <text x="16" y="21" text-anchor="middle" fill="white" font-family="Arial" font-size="12" font-weight="bold">?</text>
                </svg>
              `)}`,
              scaledSize: new google.maps.Size(32, 32),
              anchor: new google.maps.Point(16, 32),
            },
          });

          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="max-width: 200px;">
                <h3 style="margin: 0 0 8px 0; color: #9e9e9e;">${item.place!.name}</h3>
                <p style="margin: 0; color: #666;">${item.place!.address}</p>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #9e9e9e;">Coordenadas no disponibles - ubicación aproximada</p>
              </div>
            `,
          });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });

          markersRef.current.push(marker);
          bounds.extend(position);
        }
      });
    });

    // Create polyline connecting valid places
    if (path.length > 1) {
      const polyline = new google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: '#1976d2',
        strokeOpacity: 0.8,
        strokeWeight: 3,
        map,
      });
      polylineRef.current = polyline;
    }

    // Fit map to show all markers
    if (bounds.isEmpty()) {
      map.setCenter({ lat: -34.6037, lng: -58.3816 });
      map.setZoom(12);
    } else {
      map.fitBounds(bounds);

      // Prevent too much zoom if only one point
      google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
        if (map.getZoom() && map.getZoom()! > 15) {
          map.setZoom(15);
        }
      });
    }

    return () => {
      markersRef.current.forEach(marker => marker.setMap(null));
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }
    };
  }, [items]);

  return (
    <Box
      ref={mapRef}
      sx={{
        width: '100%',
        height: '400px',
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
      height: '400px',
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
      height: '400px',
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

const ItineraryMap: React.FC<ItineraryMapProps> = ({ items }) => {
  const [, setMapError] = useState<string | null>(null);

  const render = (status: Status) => {
    switch (status) {
      case Status.LOADING:
        return <LoadingComponent />;
      case Status.FAILURE:
        return <ErrorComponent error="No se pudo cargar el mapa. Verifica tu conexión a internet." />;
      case Status.SUCCESS:
        return <MapComponent items={items} />;
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
          height: '400px',
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
          height: '400px',
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
      libraries={['geometry', 'places']}
      render={render}
      callback={(status: Status) => {
        if (status === Status.FAILURE) {
          setMapError('Error al inicializar Google Maps');
        }
      }}
    />
  );
};

export default ItineraryMap;