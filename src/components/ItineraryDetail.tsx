import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Button,
    Container,
    Typography,
    CircularProgress,
    Alert,
    Tabs,
    Tab,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import apiService from '../services/api.service';
import type { Place } from '../types/place';
import ItineraryMap from './ItineraryMap';

interface ItineraryItem {
    id: string;
    placeId: string;
    date: string;
    place?: Place;
}

interface ItineraryDetail {
    id: string;
    name: string;
    userId: string;
    items: ItineraryItem[];
    createdAt: string;
    updatedAt: string;
}

const ItineraryDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const auth = useAuth();
    const hasCheckedAuth = React.useRef(false);

    const [itinerary, setItinerary] = useState<ItineraryDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        if (!hasCheckedAuth.current) {
            hasCheckedAuth.current = true;
            if (!auth.isAuthenticated) {
                navigate('/login');
            }
        }
    }, [auth.isAuthenticated, navigate]);

    // Fetch itinerary details on component mount
    useEffect(() => {
        const fetchItinerary = async () => {
            if (!auth.isAuthenticated || !id) return;

            setLoading(true);
            setError(null);

            try {
                const response = await apiService.getItineraryById(id);

                if (response.success && response.data) {
                    setItinerary(response.data);
                } else {
                    setError('No se pudo cargar el itinerario.');
                }
            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar el itinerario';
                setError(`Error al cargar el itinerario: ${errorMessage}`);
                console.error('Error fetching itinerary:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchItinerary();
    }, [auth.isAuthenticated, id]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button
                    variant="outlined"
                    onClick={() => navigate('/itineraries')}
                >
                    ← Volver a Itinerarios
                </Button>
                {!loading && !error && itinerary && (
                    <Button
                        variant="contained"
                        onClick={() => navigate(`/itinerary/${id}/edit`)}
                    >
                        Editar Itinerario
                    </Button>
                )}
            </Box>

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {!loading && !error && itinerary && (
                <>
                    <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 2 }}>
                        {itinerary.name}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                        Creado: {formatDate(itinerary.createdAt)}
                    </Typography>

                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" gutterBottom>
                            Lugares del Itinerario
                        </Typography>

                        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                            <Tabs value={activeTab} onChange={(_: React.SyntheticEvent, newValue: number) => setActiveTab(newValue)}>
                                <Tab label="Vista de Lista" />
                                <Tab label="Vista de Mapa" />
                            </Tabs>
                        </Box>

                        {activeTab === 0 && <ItineraryPlacesGrid items={itinerary.items} />}
                        {activeTab === 1 && <ItineraryMap items={itinerary.items} />}
                    </Box>
                </>
            )}
        </Container>
    );
};

interface ItineraryPlacesGridProps {
    items: ItineraryItem[];
}

function ItineraryPlacesGrid({ items }: ItineraryPlacesGridProps) {
    // Sort items by date
    const sortedItems = [...items].sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    return (
        <Box
            sx={{
                mt: 2,
                display: 'grid',
                gap: { xs: 3, md: 4 },
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
            }}
        >
            {sortedItems.map((item) => (
                <Card
                    key={item.id}
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
    );
}

export default ItineraryDetail;
