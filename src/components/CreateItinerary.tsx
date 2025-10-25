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

interface ItineraryItem {
    placeID: string;
    date: string;
}

interface Itinerary {
    userID: string;
    name: string;
    items: ItineraryItem[];
}

const placesAtus = [
    {
        id: "1",
        name: "atus palace 1",
        address: "atus palace",
        latitude: "atus palace",
        longitude: "atus palace",
        image: null,
        rating: null,
        createdAt: "atus palace",
        updatedAt: "atus palace",
        description: "atus palace",
        city: "atus palace",
    },
    {
        id: "2",
        name: "atus palace 2",
        address: "atus palace",
        latitude: "atus palace",
        longitude: "atus palace",
        image: null,
        rating: null,
        createdAt: "atus palace",
        updatedAt: "atus palace",
        description: "atus palace",
        city: "atus palace",
    },
    {
        id: "3",
        name: "atus palace 3",
        address: "atus palace",
        latitude: "atus palace",
        longitude: "atus palace",
        image: null,
        rating: null,
        createdAt: "atus palace",
        updatedAt: "atus palace",
        description: "atus palace",
        city: "atus palace",
    },
    {
        id: "4",
        name: "atus palace 4",
        address: "atus palace",
        latitude: "atus palace",
        longitude: "atus palace",
        image: null,
        rating: null,
        createdAt: "atus palace",
        updatedAt: "atus palace",
        description: "atus palace",
        city: "atus palace",
    },
]

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

    // ... resto del componente
    const [currentItinerary, setCurrentItinerary] = useState<Itinerary | null>(null);
    const [placeSearch, setPlaceSearch] = useState<string>("");
    const [placesRetrieved, setPlacesRetrieved] = useState<Place[]>(placesAtus);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handlePlaceSelect = (place: Place, date: string) => {
        setCurrentItinerary((i) => {
            i?.items.push({
                placeID: place.id,
                date: date,
            })
            return i
        })
        setError(null);
    };

    const handleSubmit = async () => {
        if (currentItinerary?.items.length == 0) return;

        setLoading(true);
        setError(null);

        // try {
        //     // Call API to add place
        //     await apiService.addPlace(selectedPlace);
        //     setSuccess(true);
        //     trackEvent('place_added', { place_name: selectedPlace.name });

        //     // Reset after success
        //     setTimeout(() => {
        //         setSuccess(false);
        //         setSelectedPlace(null);
        //     }, 3000);
        // } catch (err: unknown) {
        //     const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        //     if (errorMessage.includes('duplicate')) {
        //         setError('Este lugar ya está registrado.');
        //     } else if (errorMessage.includes('external service')) {
        //         setError('Servicio externo no disponible.');
        //     } else {
        //         setError('Error al agregar el lugar. Por favor intenta de nuevo.');
        //     }
        // } finally {
        //     setLoading(false);
        // }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Creacion/Edicion de Itinerario
            </Typography>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    ¡Busca y agrega lugares que quisieras visitar!
                </Typography>

                <Box sx={{ mb: 3 }}>
                    <Autocomplete
                        options={placesRetrieved}
                        getOptionLabel={(option) => option.name}
                        filterOptions={(options, { inputValue }) =>
                            options.filter((p) =>
                                p.name.toLowerCase().includes(inputValue.toLowerCase())
                            )
                        }
                        onChange={(_, value) => {
                            if (value) {
                                setPlaceSearch(value.name);
                            }
                        }}
                        renderInput={(params) => (
                            <TextField {...params} label="Busca lugares" variant="outlined" />
                        )}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        type='date'
                        // value={selectedPlace.name}
                        sx={{ mb: 2 }}
                    />

                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="outlined"
                            onClick={() => { }}
                        >
                            Agregar
                        </Button>
                    </Stack>

                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                            Lista de lugares:
                        </Typography>
                        <ItineraryPlaceThumbnail places={placesAtus} navigate={navigate} />
                    </Box>
                </Box>

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

function ItineraryPlaceThumbnail({ places, navigate }: { places: Place[], navigate: any }) {
    return (
        <Box
            sx={{
                mt: 2,
                display: 'grid',
                gap: { xs: 3, md: 4 },
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
            }}
        >
            {places.map((place) => (
                <Card
                    key={place.id}
                    onClick={() => navigate(`/place/${place.id}`)}
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
                            backgroundImage: `url(${place.image || '/placeholder-image.jpg'})`,
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
                            {place.name}
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
                                14 de mayo de 2025
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            ))}
        </Box>
    )
}

export default CreateItinerary;

