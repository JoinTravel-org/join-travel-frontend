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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { Place } from '../types/place';
import type { Itinerary, ItineraryItem, CreateItineraryRequest } from '../types/itinerary';
import apiService from '../services/api.service';

const defaultItinerary: Itinerary = { name: "", items: [] }

const defaultItineraryItem: ItineraryItem = { place: null as any, date: "" };


const CreateItinerary: React.FC = () => {
    const navigate = useNavigate();
    const auth = useAuth();
    const hasCheckedAuth = React.useRef(false);

    useEffect(() => {
        if (!hasCheckedAuth.current) {
            hasCheckedAuth.current = true;
            if (!auth.isAuthenticated) {
                navigate('/login');
            }
        }
    }, [auth.isAuthenticated, navigate]);

    // Fetch places from backend on component mount
    useEffect(() => {
        const fetchPlaces = async () => {
            if (!auth.isAuthenticated) return;
            
            setLoadingPlaces(true);
            setPlacesError(null);
            
            try {
                // Fetch all places with a high limit to get all available places
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
    }, [auth.isAuthenticated]);

    // Itinerary
    const [selectedPlace, setSelectedPlace] = useState<ItineraryItem>(defaultItineraryItem);
    const [currentItinerary, setCurrentItinerary] = useState<Itinerary>(defaultItinerary);

    // Place search
    const [placeSearch, setPlaceSearch] = useState<string>("");
    const [placesRetrieved, setPlacesRetrieved] = useState<Place[]>([]);
    const [allPlaces, setAllPlaces] = useState<Place[]>([]);
    const [loadingPlaces, setLoadingPlaces] = useState<boolean>(false);
    const [placesError, setPlacesError] = useState<string | null>(null);

    // Metadata
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handlePlaceSearch = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setPlaceSearch(e.target.value);
    }

    const handlePlaceSelect = (_e: any, place: Place | null) => {
        if (place == null) {
            return;
        }
        setSelectedPlace((curr) => ({ ...curr, place }));
    }

    const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setSelectedPlace((curr) => ({ ...curr, date: e.target.value }));
    }

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setCurrentItinerary((curr) => ({ ...curr, name: e.target.value }));
    }

    // Debounced search for places
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (!placeSearch.trim()) {
                // If search is empty, show all places
                setPlacesRetrieved(allPlaces);
            } else {
                // Filter places based on search input (case insensitive)
                const filteredPlaces = allPlaces.filter(place => 
                    place.name.toLowerCase().includes(placeSearch.toLowerCase()) ||
                    place.address.toLowerCase().includes(placeSearch.toLowerCase()) ||
                    (place.city && place.city.toLowerCase().includes(placeSearch.toLowerCase()))
                );
                setPlacesRetrieved(filteredPlaces);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(timeoutId);
    }, [placeSearch, allPlaces]);

    const handleAddPlace = () => {
        if (selectedPlace.place == null) {
            setError("Por favor selecciona un lugar para agregar.");
            return;
        } else if (selectedPlace.date == "") {
            setError("Por favor selecciona una fecha para el lugar.");
            return;
        } else if (currentItinerary.items.find((item) => item.place?.id === selectedPlace.place?.id)) {
            setError("Este lugar ya está en el itinerario.");
            return;
        }
        console.log(`Adding place to itinerary: ${selectedPlace.place?.name} on ${selectedPlace.date}`);
        setCurrentItinerary((prev) => ({
            ...prev,
            items: [
                ...prev.items,
                { place: selectedPlace.place, date: selectedPlace.date }
            ]
        }));
        setSelectedPlace(defaultItineraryItem);
        setPlaceSearch("");
        setError(null);
    };

    const handleSubmit = async () => {
        if (currentItinerary?.items.length == 0) {
            setError("El itinerario debe tener al menos un lugar.");
            return;
        } else if (currentItinerary.name.trim() === "") {
            setError("El itinerario debe tener un nombre.");
            return;
        } else if (!auth.user) {
            setError("Usuario no autenticado.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Convert to backend format (place IDs only)
            const itineraryData: CreateItineraryRequest = {
                name: currentItinerary.name,
                items: currentItinerary.items
                    .filter(item => item.place !== null)
                    .map(item => ({
                        placeId: item.place.id,
                        date: item.date
                    }))
            };
            
            await apiService.createItinerary(itineraryData);
            setSuccess(true);

            // Reset after success
            setTimeout(() => {
                setSuccess(false);
                setCurrentItinerary(defaultItinerary);
                navigate('/');
            }, 3000);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            if (errorMessage.includes('duplicate')) {
                setError('Este itinerario ya existe.');
            } else if (errorMessage.includes('external service')) {
                setError('Servicio externo no disponible.');
            } else {
                setError('Error al crear el itinerario. Por favor intenta de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Creacion/Edicion de Itinerario
            </Typography>

            <Paper sx={{ p: 3, mb: 3 }}>
                <TextField
                    fullWidth
                    type='text'
                    label="Nombre del Itinerario"
                    onChange={handleNameChange}
                    value={currentItinerary.name}
                    sx={{ mb: 2 }}
                />

                <Typography variant="h6" gutterBottom>
                    ¡Busca y agrega lugares que quisieras visitar!
                </Typography>

                <Box sx={{ mb: 3 }}>
                    <Autocomplete
                        options={placesRetrieved}
                        getOptionLabel={(option) => option.name}
                        onChange={handlePlaceSelect}
                        loading={loadingPlaces}
                        disabled={loadingPlaces || !!placesError}
                        renderInput={(params) => (
                            <TextField 
                                {...params} 
                                onChange={handlePlaceSearch} 
                                label={loadingPlaces ? "Cargando lugares..." : "Busca lugares"} 
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
                    <TextField
                        fullWidth
                        type='date'
                        onChange={handleDateSelect}
                        value={selectedPlace.date}
                        sx={{ mb: 2 }}
                    />

                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="outlined"
                            onClick={handleAddPlace}
                        >
                            Agregar
                        </Button>
                    </Stack>

                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                            Lista de lugares:
                        </Typography>
                        <ItineraryPlaceThumbnail itinerary={currentItinerary} />
                    </Box>
                </Box>

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

                {success && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                        ¡Itinerario creado exitosamente!
                    </Alert>
                )}

                <Stack direction="row" spacing={2}>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        sx={{ minWidth: 120 }}
                    >
                        {loading ? <CircularProgress size={20} /> : 'Finalizar edicion'}
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/')}
                    >
                        Cancelar
                    </Button>
                </Stack>
            </Paper>
        </Container>
    );
};

function ItineraryPlaceThumbnail({ itinerary }: { itinerary: Itinerary }) {
    return (
        <Box
            sx={{
                mt: 2,
                display: 'grid',
                gap: { xs: 3, md: 4 },
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
            }}
        >
            {itinerary.items.map((item) => (
                <Card
                    key={item.place?.id}
                    onClick={() => window.open(`/place/${item.place?.id}`, '_blank')}
                    elevation={0}
                    sx={{
                        height: '100%',
                        display: 'flex',
                        cursor: "pointer",
                        flexDirection: 'column',
                        border: '2px solid #000',
                        borderRadius: 2,
                        backgroundColor: '#fff',
                        boxShadow: '6px 6px 4px 0px rgba(0,0,0,0.7)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'translate(-2px, -2px)',
                            boxShadow: '8px 8px 6px 0px rgba(0,0,0,0.7)',
                            borderColor: '#333',
                        },
                    }}
                >
                    <Box
                        sx={{
                            height: 200,
                            backgroundImage: `url(${item.place?.image || '/placeholder-image.jpg'})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundColor: '#f0f0f0',
                            borderBottom: '2px solid #000',
                        }}
                        onError={(e: any) => {
                            const target = e.target as HTMLDivElement;
                            target.style.backgroundImage = 'url(/placeholder-image.jpg)';
                        }}
                    />
                    <CardContent sx={{ flexGrow: 1, p: 3, backgroundColor: '#fff' }}>
                        <Typography
                            variant="h6"
                            component="h3"
                            sx={{
                                fontWeight: 700,
                                mb: 2,
                                fontSize: '1.25rem',
                                letterSpacing: '0.02em',
                                color: '#000'
                            }}
                        >
                            {item.place?.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography
                                variant="body2"
                                sx={{
                                    fontWeight: 700,
                                    fontSize: '0.7rem',
                                    color: '#000'
                                }}
                            >
                                {item.date}
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            ))}
        </Box>
    )
}

export default CreateItinerary;

