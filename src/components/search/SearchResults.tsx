import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  Tabs,
  Tab,
  Button,
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  LocationOn as LocationIcon,
  MyLocation as MyLocationIcon
} from "@mui/icons-material";
import { useSearchParams, useNavigate } from "react-router-dom";
import UserCard from "./UserCard";
import PlaceCard from "./PlaceCard";
import userService from "../../services/user.service";
import apiService from "../../services/api.service";
import type { User } from "../../types/user";
import type { Place } from "../../types/place";

const SearchResults: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [activeTab, setActiveTab] = useState(0); // 0 for users, 1 for places
  const [locationFilter, setLocationFilter] = useState("");
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [cachedPlaces, setCachedPlaces] = useState<Place[]>([]);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("La geolocalización no está soportada por este navegador");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationError(null);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocationError("Active ubicación para continuar.");
      }
    );
  };

  const performSearch = async (query: string) => {
    // For users tab, require query with min 3 chars
    // For places tab, allow search if query has 3+ chars OR city filter is provided
    const shouldSearch = activeTab === 0
      ? (query.trim() && query.trim().length >= 3)
      : (query.trim() && query.trim().length >= 3) || locationFilter.trim();

    if (!shouldSearch) {
      setUsers([]);
      setPlaces([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (activeTab === 0) {
        // Search users
        const response = await userService.searchUsers(query.trim());
        if (response.success && response.data) {
          setUsers(response.data);
          setPlaces([]);
        } else {
          setUsers([]);
          setPlaces([]);
          setError(response.message || "Error al buscar usuarios");
        }
      } else {
        // Search places - can search by name, city, or both
        try {
          const searchQuery = query.trim().length >= 3 ? query.trim() : undefined;
          const cityQuery = locationFilter.trim() || undefined;

          const response = await apiService.searchPlaces(
            searchQuery,
            cityQuery,
            userLocation?.latitude,
            userLocation?.longitude
          );
          if (response.success && response.data) {
            setPlaces(response.data);
            setUsers([]);
            setCachedPlaces(response.data); // Cache results
          } else {
            // Use cached results if API fails
            if (cachedPlaces.length > 0) {
              setPlaces(cachedPlaces);
              setUsers([]);
              setError("Mostrando resultados almacenados");
            } else {
              setPlaces([]);
              setUsers([]);
              setError(response.message || "Error al buscar lugares");
            }
          }
        } catch (placeErr) {
          console.error("Places search error:", placeErr);
          // Use cached results if API fails
          if (cachedPlaces.length > 0) {
            setPlaces(cachedPlaces);
            setUsers([]);
            setError("Mostrando resultados almacenados");
          } else {
            setPlaces([]);
            setUsers([]);
            setError("Error al buscar lugares");
          }
        }
      }
    } catch (err) {
      console.error("Search error:", err);
      setUsers([]);
      setPlaces([]);
      setError(activeTab === 0 ? "Error al buscar usuarios" : "Error al buscar lugares");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, activeTab, locationFilter, userLocation?.latitude, userLocation?.longitude]);

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // For places tab, allow search even without query if city filter is provided
    const shouldSubmit = activeTab === 0
      ? searchQuery.trim()
      : searchQuery.trim() || locationFilter.trim();

    if (shouldSubmit) {
      setSearchParams({ q: searchQuery.trim() || "" });
      // Perform search immediately
      performSearch(searchQuery);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setUsers([]);
    setError(null);
    setSearchParams({});
  };

  const handleUserClick = (user: User) => {
    navigate(`/user/${user.id}`);
  };

  const handlePlaceClick = (place: Place) => {
    navigate(`/place/${place.id}`);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setUsers([]);
    setPlaces([]);
    setError(null);
  };

  const handleLocationFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocationFilter(event.target.value);
  };

  const handleGetLocation = () => {
    getUserLocation();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        Buscar
      </Typography>

      {/* Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="search tabs">
          <Tab label="Usuarios" />
          <Tab label="Lugares" />
        </Tabs>
      </Paper>

      {/* Search Form */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box component="form" onSubmit={handleSearchSubmit}>
          <TextField
            fullWidth
            placeholder={activeTab === 0 ? "Buscar usuarios por email..." : "Buscar lugares por nombre..."}
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton onClick={handleClearSearch} size="small">
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          {/* Location filter for places */}
          {activeTab === 1 && (
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                placeholder="Filtrar por ciudad (opcional)"
                value={locationFilter}
                onChange={handleLocationFilterChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearchSubmit(e);
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="outlined"
                startIcon={<MyLocationIcon />}
                onClick={handleGetLocation}
                sx={{ minWidth: "auto" }}
              >
                Ubicación
              </Button>
            </Box>
          )}

          <Box sx={{ display: "flex", gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {activeTab === 0
                ? "Busca usuarios escribiendo al menos 3 caracteres de su email"
                : "Busca lugares por nombre (mínimo 3 caracteres) o filtra por ciudad"
              }
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Location Error */}
      {locationError && activeTab === 1 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {locationError}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Results */}
      {!loading && !error && (
        <>
          {activeTab === 0 ? (
            // Users results
            users.length > 0 ? (
              <>
                <Typography variant="h6" gutterBottom>
                  {users.length} usuario{users.length !== 1 ? "s" : ""} encontrado{users.length !== 1 ? "s" : ""}
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {users.map((user) => (
                    <UserCard key={user.id} user={user} onClick={() => handleUserClick(user)} />
                  ))}
                </Box>
              </>
            ) : searchQuery && searchQuery.length >= 3 && !loading ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No se encontraron usuarios
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Intenta con un email diferente o verifica la ortografía
                </Typography>
              </Box>
            ) : null
          ) : (
            // Places results
            places.length > 0 ? (
              <>
                <Typography variant="h6" gutterBottom>
                  {places.length} lugar{places.length !== 1 ? "es" : ""} encontrado{places.length !== 1 ? "s" : ""}
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {places.map((place) => (
                    <PlaceCard key={place.id} place={place} onClick={() => handlePlaceClick(place)} />
                  ))}
                </Box>
              </>
            ) : searchQuery && searchQuery.length >= 3 && !loading ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No se encontraron lugares
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Intenta con un nombre diferente o verifica la ortografía
                </Typography>
              </Box>
            ) : null
          )}
        </>
      )}
    </Container>
  );
};

export default SearchResults;