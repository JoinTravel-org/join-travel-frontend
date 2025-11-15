import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Button,
    Container,
    Typography,
    Paper,
    CircularProgress,
    Alert,
    Chip,
    Stack,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { Place } from '../../types/place';
import apiService from '../../services/api.service';

interface BackendItineraryItem {
    id: string;
    placeId: string;
    date: string;
    place?: Place;
}

interface BackendItinerary {
    id: string;
    name: string;
    userId: string;
    items: BackendItineraryItem[];
    createdAt: string;
    updatedAt: string;
}

interface GroupInfo {
    id: string;
    name: string;
    description: string | null;
    adminId: string;
    memberCount: number;
}

const ItineraryList: React.FC = () => {
    const navigate = useNavigate();
    const auth = useAuth();
    const hasCheckedAuth = React.useRef(false);

    const [itineraries, setItineraries] = useState<BackendItinerary[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [groupsDialogOpen, setGroupsDialogOpen] = useState(false);
    const [selectedItineraryGroups, setSelectedItineraryGroups] = useState<GroupInfo[]>([]);
    const [selectedItineraryName, setSelectedItineraryName] = useState('');
    const [loadingGroups, setLoadingGroups] = useState(false);

    useEffect(() => {
        if (!hasCheckedAuth.current) {
            hasCheckedAuth.current = true;
            if (!auth.isLoading && !auth.isAuthenticated) {
                navigate('/login');
            }
        }
    }, [auth.isAuthenticated, auth.isLoading, navigate]);

    // Fetch user itineraries on component mount
    useEffect(() => {
        const fetchItineraries = async () => {
            if (!auth.isAuthenticated) return;

            setLoading(true);
            setError(null);

            try {
                const response = await apiService.getUserItineraries();

                if (response.success && response.data) {
                    setItineraries(response.data);
                } else {
                    setError('No se pudieron cargar los itinerarios.');
                }
            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar itinerarios';
                setError(`Error al cargar itinerarios: ${errorMessage}`);
                console.error('Error fetching itineraries:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchItineraries();
    }, [auth.isAuthenticated]);

    const handleCreateItinerary = () => {
        navigate('/create-itinerary');
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleShowGroups = async (e: React.MouseEvent, itineraryId: string, itineraryName: string) => {
        e.stopPropagation(); // Prevent card click
        setLoadingGroups(true);
        setSelectedItineraryName(itineraryName);
        setGroupsDialogOpen(true);

        try {
            const response = await apiService.getItineraryGroups(itineraryId);
            if (response.success && response.data) {
                setSelectedItineraryGroups(response.data);
            }
        } catch (err) {
            console.error('Error loading groups:', err);
            setSelectedItineraryGroups([]);
        } finally {
            setLoadingGroups(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Mis Itinerarios
                </Typography>
                <Button
                    variant="contained"
                    onClick={handleCreateItinerary}
                    sx={{ minWidth: 200 }}
                >
                    Crear Nuevo Itinerario
                </Button>
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

            {!loading && !error && itineraries.length === 0 && (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No tienes itinerarios creados
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Crea tu primer itinerario para empezar a planificar tus viajes
                    </Typography>
                    <Button variant="contained" onClick={handleCreateItinerary}>
                        Crear mi Primer Itinerario
                    </Button>
                </Paper>
            )}

            {!loading && !error && itineraries.length > 0 && (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                    {itineraries.map((itinerary) => (
                        <Card
                            key={itinerary.id}
                            elevation={2}
                            onClick={() => navigate(`/itinerary/${itinerary.id}`)}
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                position: 'relative',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 6,
                                },
                            }}
                        >
                            <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Typography
                                        variant="h6"
                                        component="h2"
                                        sx={{ fontWeight: 700, flex: 1 }}
                                    >
                                        {itinerary.name}
                                    </Typography>
                                    <Tooltip title="Ver grupos donde está compartido">
                                        <IconButton
                                            size="small"
                                            color="primary"
                                            onClick={(e) => handleShowGroups(e, itinerary.id, itinerary.name)}
                                            sx={{ ml: 1 }}
                                        >
                                            <PeopleIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>

                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    {itinerary.items.length} lugar{itinerary.items.length !== 1 ? 'es' : ''}
                                </Typography>

                                {itinerary.items.length > 0 && (
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                            Lugares:
                                        </Typography>
                                        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                                            {itinerary.items.slice(0, 3).map((item) => (
                                                <Chip
                                                    key={item.id}
                                                    label={item.place?.name || 'Lugar'}
                                                    size="small"
                                                    sx={{ fontSize: '0.75rem' }}
                                                />
                                            ))}
                                            {itinerary.items.length > 3 && (
                                                <Chip
                                                    label={`+${itinerary.items.length - 3} más`}
                                                    size="small"
                                                    color="primary"
                                                    variant="outlined"
                                                    sx={{ fontSize: '0.75rem' }}
                                                />
                                            )}
                                        </Stack>
                                    </Box>
                                )}

                                <Typography variant="caption" color="text.secondary">
                                    Creado: {formatDate(itinerary.createdAt)}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            )}

            {/* Groups Dialog */}
            <Dialog
                open={groupsDialogOpen}
                onClose={() => setGroupsDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Grupos con "{selectedItineraryName}"
                </DialogTitle>
                <DialogContent dividers>
                    {loadingGroups ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress />
                        </Box>
                    ) : selectedItineraryGroups.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <PeopleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="body1" color="text.secondary">
                                Este itinerario no está compartido en ningún grupo
                            </Typography>
                        </Box>
                    ) : (
                        <List>
                            {selectedItineraryGroups.map((group) => (
                                <ListItem
                                    key={group.id}
                                    sx={{
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 1,
                                        mb: 1,
                                    }}
                                >
                                    <ListItemText
                                        primary={group.name}
                                        secondary={
                                            <>
                                                {group.description && (
                                                    <Typography variant="body2" component="span" display="block">
                                                        {group.description}
                                                    </Typography>
                                                )}
                                                <Typography variant="caption" component="span">
                                                    {group.memberCount} miembro{group.memberCount !== 1 ? 's' : ''}
                                                </Typography>
                                            </>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setGroupsDialogOpen(false)}>
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ItineraryList;
