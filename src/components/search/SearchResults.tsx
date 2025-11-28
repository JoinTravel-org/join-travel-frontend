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
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  LocationOn as LocationIcon,
  MyLocation as MyLocationIcon
} from "@mui/icons-material";
import { Rating } from "@fluentui/react-rating";
import { useSearchParams, useNavigate } from "react-router-dom";
import UserCard from "./UserCard";
import PlaceCard from "./PlaceCard";
import ListCard from "../lists/ListCard";
import userService from "../../services/user.service";
import apiService from "../../services/api.service";
import type { User } from "../../types/user";
import type { Place } from "../../types/place";
import type { List as ListType } from "../../types/list";

const SearchResults: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [lists, setLists] = useState<ListType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [activeTab, setActiveTab] = useState(0); // 0 for users, 1 for places, 2 for lists
  const [locationFilter, setLocationFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | "">("");
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [cachedPlaces, setCachedPlaces] = useState<Place[]>([]);
  const [apiKey, setApiKey] = useState<string>("");
  const [apiKeyLoading, setApiKeyLoading] = useState(true);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  // Lists / author search states
  const [authorSuggestions, setAuthorSuggestions] = useState<User[]>([]);
  const [authorLoading, setAuthorLoading] = useState(false);
  const [selectedListAuthor, setSelectedListAuthor] = useState<User | null>(null);
  // For the lower lists filter: choose whether the input filters by list name, place (lugar) or author
  const [listFilterType, setListFilterType] = useState<"name" | "location" | "author">("location");
  // Track if the user has manually edited the lower input so we don't overwrite it
  const [lowerUserEdited, setLowerUserEdited] = useState(false);

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

  useEffect(() => {
    if (apiKey && !window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geocoding`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('Google Maps script loaded for geocoding');
        setMapsLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load Google Maps script');
        setApiKeyError("Error al cargar Google Maps para geolocalización");
      };
      document.head.appendChild(script);
    } else if (apiKey) {
      setMapsLoaded(true);
    }
  }, [apiKey]);

  const getUserLocation = async () => {
    console.log("Starting geolocation request");
    if (!navigator.geolocation) {
      console.error("Geolocation not supported");
      setLocationError("La geolocalización no está soportada por este navegador");
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            console.log("Geolocation success:", pos.coords);
            resolve(pos);
          },
          (err) => {
            console.error("Geolocation failed:", err);
            reject(err);
          },
          { timeout: 30000, enableHighAccuracy: false, maximumAge: 60000 }
        );
      });

      const { latitude, longitude } = position.coords;
      console.log("Setting user location:", { latitude, longitude });
      setUserLocation({ latitude, longitude });
      setLocationError(null);

      // Trigger search with location (nearby places)
      console.log("Triggering nearby search");
      performSearch(searchQuery);

      // Reverse geocode using Google Maps API if available
      if (mapsLoaded && window.google && window.google.maps) {
        console.log("Starting reverse geocoding with Google Maps");
        const geocoder = new window.google.maps.Geocoder();
        const latLng = new window.google.maps.LatLng(latitude, longitude);

        geocoder.geocode({ location: latLng }, (results, status) => {
          if (status === window.google.maps.GeocoderStatus.OK && results && results[0]) {
            console.log("Reverse geocoding data:", results[0]);
            const formattedAddress = results[0].formatted_address;
            if (formattedAddress) {
              console.log("Setting city filter with formatted address:", formattedAddress);
              setLocationFilter(formattedAddress);
              // Re-trigger search with formatted address as city filter
              console.log("Triggering search with formatted address");
              performSearch(searchQuery);
            } else {
              console.log("No formatted address found");
            }
          } else {
            console.error("Reverse geocoding failed with status:", status);
          }
        });
      } else {
        console.log("Google Maps not loaded, skipping reverse geocoding");
      }
    } catch (error: unknown) {
      console.error("Geolocation error:", error);
      if (error instanceof GeolocationPositionError) {
        if (error.code === 1) {
          setLocationError("Permiso de ubicación denegado. Por favor, habilita la ubicación en tu navegador.");
        } else if (error.code === 2) {
          setLocationError("No se pudo obtener la ubicación. Verifica tu conexión GPS.");
        } else if (error.code === 3) {
          setLocationError("Tiempo de espera agotado. Intenta de nuevo.");
        } else {
          setLocationError("Active ubicación para continuar.");
        }
      } else {
        setLocationError("Active ubicación para continuar.");
      }
    }
  };

  const performSearch = async (query: string) => {
    console.log("performSearch called", { activeTab, query, selectedListAuthor, locationFilter });
    // For users tab, require query with min 3 chars
    // For places tab, require at least one basic filter (query, city, or location), rating filter can be additional
    const hasBasicFilter = (query.trim().length >= 3) || locationFilter.trim() || !!userLocation;
    const shouldSearch = activeTab === 0
      ? (query.trim() && query.trim().length >= 3)
      : hasBasicFilter;

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
        if (activeTab === 1) {
          // Search places - requires at least one basic filter, rating is additional
          try {
            const searchQuery = query.trim().length >= 3 ? query.trim() : undefined;
            const cityQuery = locationFilter.trim() || undefined;
            const minRating = (ratingFilter !== "" && hasBasicFilter) ? Number(ratingFilter) : undefined;

            const response = await apiService.searchPlaces(
              searchQuery,
              cityQuery,
              userLocation?.latitude,
              userLocation?.longitude,
              minRating
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
        } else {
          // activeTab === 2 -> Lists search
          try {
            // If an author is selected, use the author endpoint
            if (selectedListAuthor) {
              console.log('Searching lists by author', selectedListAuthor.id);
              const response = await apiService.getListsByAuthor(selectedListAuthor.id);
              console.log('getListsByAuthor response', response);
              if (response && response.success) {
                setLists(response.data || []);
                setUsers([]);
                setPlaces([]);
              } else {
                setLists([]);
                setUsers([]);
                setPlaces([]);
                setError((response as any)?.message || "Error al buscar listas");
              }
            } else {
              // Decide which param to send based on the lower filter type (name vs location)
              const q = listFilterType === 'name'
                ? (locationFilter.trim().length >= 1 ? locationFilter.trim() : undefined)
                : undefined;
              const cityQuery = listFilterType === 'location'
                ? (locationFilter.trim().length >= 1 ? locationFilter.trim() : undefined)
                : undefined;
              console.log('Searching lists', { listFilterType, q, cityQuery });
              const response = await apiService.searchLists(q, cityQuery);
              console.log('searchLists response', response);
              if (response && response.success) {
                setLists(response.data || []);
                setUsers([]);
                setPlaces([]);
              } else {
                setLists([]);
                setUsers([]);
                setPlaces([]);
                setError((response as any)?.message || "Error al buscar listas");
              }
            }
          } catch (listErr) {
            console.error("Lists search error:", listErr);
            setLists([]);
            setUsers([]);
            setPlaces([]);
            setError((listErr as any)?.message || "Error al buscar listas");
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
  }, [searchQuery, activeTab, locationFilter, ratingFilter, userLocation?.latitude, userLocation?.longitude]);

  // When typing in the top search box, prefill the lower lists input the first time
  // but don't overwrite if the user already edited the lower input.
  useEffect(() => {
    if (activeTab === 2 && !lowerUserEdited) {
      setLocationFilter(searchQuery);
    }
    // only respond to searchQuery and activeTab and lowerUserEdited
  }, [searchQuery, activeTab, lowerUserEdited]);

  // Trigger search when selected author changes (lists tab)
  useEffect(() => {
    if (activeTab === 2) {
      performSearch(searchQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedListAuthor]);

  // Debounced author suggestions (use the lower input when in author mode)
  useEffect(() => {
    const acTimer = setTimeout(async () => {
      if (listFilterType === "author" && locationFilter && locationFilter.trim().length >= 3) {
        setAuthorLoading(true);
        try {
          const res = await userService.searchUsers(locationFilter.trim());
          if (res && res.success && res.data) {
            setAuthorSuggestions(res.data as User[]);
          } else {
            setAuthorSuggestions([]);
          }
        } catch (e) {
          console.error("Author search error", e);
          setAuthorSuggestions([]);
        } finally {
          setAuthorLoading(false);
        }
      } else {
        setAuthorSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(acTimer);
  }, [locationFilter, listFilterType]);


  const handleSelectAuthor = (u: User) => {
    setSelectedListAuthor(u);
    // populate the lower input so performSearch's hasBasicFilter becomes true
    setLocationFilter(u.name || u.email || "");
    setAuthorSuggestions([]);
    // Trigger lists search immediately
    setLowerUserEdited(true);
    performSearch(searchQuery);
  };

  const handleClearAuthor = () => {
    setSelectedListAuthor(null);
    setLocationFilter("");
    setLists([]);
  };

  const handleDeleteList = async (listId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta lista?')) return;
    try {
      await apiService.deleteList(listId);
      setLists(prev => prev.filter(l => l.id !== listId));
    } catch (e) {
      console.error('Error deleting list', e);
      setError('Error al eliminar la lista');
    }
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // For places tab, require at least one basic filter (query, city, or location)
    const hasBasicFilter = searchQuery.trim().length >= 3 || locationFilter.trim() || !!userLocation;
    const shouldSubmit = activeTab === 0
      ? searchQuery.trim()
      : hasBasicFilter;

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
    setLists([]);
    setSelectedListAuthor(null);
    setAuthorSuggestions([]);
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
    setLists([]);
    setError(null);
  };

  const handleListFilterTypeChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newType = (event.target as HTMLInputElement).value as "name" | "location" | "author";
    // Reset filters/selections when switching filter type
    setListFilterType(newType);
    setLocationFilter("");
    setSelectedListAuthor(null);
    setAuthorSuggestions([]);
    setLists([]);
    setError(null);
    setLowerUserEdited(false);
  };

  const handleLocationFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocationFilter(event.target.value);
    setLowerUserEdited(true);
  };

  const handleRatingFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value === "" || (Number(value) >= 0 && Number(value) <= 5)) {
      setRatingFilter(value === "" ? "" : Number(value));
    }
  };

  const handleGetLocation = async () => {
    console.log("Geolocation button clicked");
    setLocationLoading(true);
    setLocationError(null);
    await getUserLocation();
    setLocationLoading(false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: { xs: 2, sm: 3 } }}>
        Buscar
      </Typography>

      {/* Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="pestañas de búsqueda">
          <Tab label="Usuarios" />
          <Tab label="Lugares" />
          <Tab label="Listas" />
        </Tabs>
      </Paper>

      {/* Search Form */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 3, sm: 4 } }}>
        <Box component="form" onSubmit={handleSearchSubmit}>
          {activeTab === 1 && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Buscar lugares por nombre, lugar y calificación mínima
            </Typography>
          )}
          {activeTab !== 2 && (
            <TextField
              fullWidth
              label={activeTab === 0 ? "Buscar usuarios" : "Nombre del lugar"}
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
          )}

          {/* For Lists tab we keep a single (lower) Lugar input only */}
          {activeTab === 2 && (
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2, alignItems: 'center' }}>
              <TextField
                select
                SelectProps={{ native: true }}
                size="small"
                label="Filtrar por"
                value={listFilterType}
                onChange={handleListFilterTypeChange}
                sx={{ width: { xs: '100%', sm: 200 } }}
              >
                <option value="name">Nombre</option>
                <option value="location">Lugar</option>
                <option value="author">Autor</option>
              </TextField>

              <TextField
                fullWidth
                placeholder="Busque sus listas aqui"
                value={locationFilter}
                onChange={handleLocationFilterChange}
                InputProps={{
                  endAdornment: locationFilter ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => { setLocationFilter(''); setLists([]); }}>
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ) : undefined,
                }}
              />
              {/* Author suggestions / selected author */}
              {listFilterType === 'author' && (
                <Box sx={{ width: '100%', mt: 1 }}>
                  {selectedListAuthor ? (
                    <Box>
                      <Chip
                        label={selectedListAuthor.name || selectedListAuthor.email}
                        onDelete={handleClearAuthor}
                      />
                    </Box>
                  ) : (
                    <Box>
                      {authorLoading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CircularProgress size={18} />
                          <Typography variant="body2" color="text.secondary">Buscando autores...</Typography>
                        </Box>
                      ) : authorSuggestions.length > 0 ? (
                        <Paper sx={{ mt: 1 }}>
                          <List dense>
                            {authorSuggestions.map((u) => (
                              <ListItem  key={u.id} onClick={() => handleSelectAuthor(u)}>
                                <ListItemAvatar>
                                  <Avatar src={(u as any).avatarUrl || undefined}>{u.name ? u.name.charAt(0) : (u.email || '').charAt(0)}</Avatar>
                                </ListItemAvatar>
                                <ListItemText primary={u.name || u.email} secondary={u.email} />
                              </ListItem>
                            ))}
                          </List>
                        </Paper>
                      ) : locationFilter.trim().length >= 3 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          No se encontraron autores
                        </Typography>
                      ) : null}
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          )}

          {/* Filters for places */}
          {activeTab === 1 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>
              <Box sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: { xs: 1, sm: 2 },
                alignItems: { xs: "stretch", sm: "center" }
              }}>
                <TextField
                  fullWidth
                  label="Lugar"
                  placeholder="Filtrar por lugar (opcional)"
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
                <Box sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: { xs: "center", sm: "flex-start" },
                  gap: 1
                }}>
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: "fit-content" }}>
                    o
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={locationLoading ? <CircularProgress size={20} /> : <MyLocationIcon />}
                    onClick={handleGetLocation}
                    disabled={locationLoading || apiKeyLoading}
                    sx={{ minWidth: "auto", width: { xs: "100%", sm: "auto" } }}
                  >
                    {locationLoading ? "Obteniendo..." : apiKeyLoading ? "Cargando..." : "Ubicación actual"}
                  </Button>
                </Box>
              </Box>
              <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "stretch", sm: "center" }, gap: 2 }}>
                <TextField
                  type="number"
                  label="Calificación mínima"
                  placeholder="Calificación mínima (0-5, opcional)"
                  value={ratingFilter}
                  onChange={handleRatingFilterChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearchSubmit(e);
                    }
                  }}
                  inputProps={{
                    min: 0,
                    max: 5,
                    step: 0.1,
                  }}
                  sx={{ minWidth: { xs: "100%", sm: 300 } }}
                />
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Rating
                    size="small"
                    color="marigold"
                    max={5}
                    value={ratingFilter !== "" ? Number(ratingFilter) : 0}
                    style={{ pointerEvents: 'none' }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    (opcional, filtra lugares con calificación ≥ {ratingFilter !== "" ? ratingFilter : "0"})
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          <Box sx={{ display: "flex", gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {activeTab === 0 ? (
                "Busca usuarios escribiendo al menos 3 caracteres de su email"
              ) : activeTab === 1 ? (
                "Busca lugares por nombre (mínimo 3 caracteres) o filtra por lugar. La calificación mínima se aplica adicionalmente."
              ) : (
                "Busca listas por lugar."
              )}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* API Key Error */}
      {apiKeyError && activeTab === 1 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {apiKeyError}
        </Alert>
      )}

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
          {activeTab === 0 && (
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
          )}

          {activeTab === 1 && (
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
            ) : (searchQuery && searchQuery.length >= 3 || locationFilter || userLocation) && !loading ? (
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

          {activeTab === 2 && (
            // Lists results
            lists.length > 0 ? (
              <>
                <Typography variant="h6" gutterBottom>
                  {lists.length} lista{lists.length !== 1 ? "s" : ""} encontrada{lists.length !== 1 ? "s" : ""}
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {lists.map((list) => (
                    <ListCard
                      key={list.id}
                      list={list}
                      onEdit={() => { /* ListCard handles edit navigation; optional callback */ }}
                      onDelete={handleDeleteList}
                      onView={() => navigate(`/list/${list.id}`)}
                      compact={true}
                    />
                  ))}
                </Box>
              </>
            ) : (locationFilter && locationFilter.trim().length > 0) && !loading ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No se encontraron listas
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Intenta con otro lugar
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