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
    Popover,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUserStats } from '../hooks/useUserStats';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { Place } from '../types/place';
import type { Itinerary, ItineraryItem, CreateItineraryRequest } from '../types/itinerary';
import apiService from '../services/api.service';

const defaultItinerary: Itinerary = { name: "", items: [] }

const defaultItineraryItem: ItineraryItem = { place: null as any, date: "" };


const CreateItinerary: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const auth = useAuth();
    const { fetchUserStats } = useUserStats();
    const hasCheckedAuth = React.useRef(false);
    const isEditMode = Boolean(id);

    useEffect(() => {
        if (!hasCheckedAuth.current) {
            hasCheckedAuth.current = true;
            if (!auth.isAuthenticated) {
                navigate('/login');
            }
        }
    }, [auth.isAuthenticated, navigate]);

    // Fetch existing itinerary data in edit mode
    useEffect(() => {
        const fetchExistingItinerary = async () => {
            if (!isEditMode || !id || !auth.isAuthenticated) return;

            setLoadingItinerary(true);
            setError(null);

            try {
                const response = await apiService.getItineraryById(id);
                
                if (response.success && response.data) {
                    const itinerary = response.data;
                    // Convert backend format to frontend format
                    const frontendItems: ItineraryItem[] = itinerary.items.map((item: any) => ({
                        place: item.place as Place,
                        date: item.date
                    }));
                    
                    setCurrentItinerary({
                        name: itinerary.name,
                        items: frontendItems
                    });
                } else {
                    setError('No se pudo cargar el itinerario.');
                }
            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar el itinerario';
                setError(`Error al cargar el itinerario: ${errorMessage}`);
                console.error('Error fetching itinerary:', err);
            } finally {
                setLoadingItinerary(false);
            }
        };

        fetchExistingItinerary();
    }, [isEditMode, id, auth.isAuthenticated]);

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
    const [loadingItinerary, setLoadingItinerary] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Date editing
    const [editingDateIndex, setEditingDateIndex] = useState<number | null>(null);
    const [dateAnchorEl, setDateAnchorEl] = useState<HTMLElement | null>(null);

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

    const onDragEnd = (result: any) => {
        if (!result.destination) {
            return;
        }

        const items = Array.from(currentItinerary.items);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        const newItinerary = {
            ...currentItinerary,
            items
        };

        setCurrentItinerary(newItinerary);

        // Auto-save the new order
        if (isEditMode && id) {
            saveItineraryOrder(newItinerary);
        }
    };

    const saveItineraryOrder = async (itinerary: Itinerary) => {
        try {
            const updateData: CreateItineraryRequest = {
                name: itinerary.name,
                items: itinerary.items.map(item => ({
                    placeId: item.place?.id || '',
                    date: item.date
                }))
            };

            await apiService.updateItinerary(id!, updateData);
            console.log('Order saved successfully');
        } catch (error) {
            console.error('Error saving order:', error);
            setError('Error al guardar el orden de los lugares.');
        }
    };

    const handleEditDate = (event: React.MouseEvent<HTMLElement>, index: number) => {
        event.stopPropagation();
        setEditingDateIndex(index);
        setDateAnchorEl(event.currentTarget);
    };

    const handleDateChange = (index: number, newDate: string) => {
        setCurrentItinerary(prev => ({
            ...prev,
            items: prev.items.map((item, i) => 
                i === index ? { ...item, date: newDate } : item
            )
        }));
        setDateAnchorEl(null);
        setEditingDateIndex(null);

        // Auto-save the date change
        if (isEditMode && id) {
            const updatedItinerary = {
                ...currentItinerary,
                items: currentItinerary.items.map((item, i) => 
                    i === index ? { ...item, date: newDate } : item
                )
            };
            saveItineraryOrder(updatedItinerary);
        }
    };

    const handleCloseDatePicker = () => {
        setDateAnchorEl(null);
        setEditingDateIndex(null);
    };

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

    const handleRemovePlace = (placeId: string) => {
        setCurrentItinerary((prev) => ({
            ...prev,
            items: prev.items.filter(item => item.place?.id !== placeId)
        }));
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
            
            if (isEditMode && id) {
                await apiService.updateItinerary(id, itineraryData);
            } else {
                await apiService.createItinerary(itineraryData);
            }

            // Refresh user stats to trigger level up notifications
            await fetchUserStats();

            setSuccess(true);

            // Reset after success
            setTimeout(() => {
                setSuccess(false);
                setCurrentItinerary(defaultItinerary);
                navigate('/itineraries');
            }, 3000);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            if (errorMessage.includes('duplicate')) {
                setError('Este itinerario ya existe.');
            } else if (errorMessage.includes('external service')) {
                setError('Servicio externo no disponible.');
            } else {
                setError(isEditMode ? 'Error al actualizar el itinerario. Por favor intenta de nuevo.' : 'Error al crear el itinerario. Por favor intenta de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Date Picker Popover */}
            <Popover
                open={Boolean(dateAnchorEl)}
                anchorEl={dateAnchorEl}
                onClose={handleCloseDatePicker}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <Box sx={{ p: 2 }}>
                    <TextField
                        type="date"
                        label="Seleccionar fecha"
                        value={editingDateIndex !== null ? currentItinerary.items[editingDateIndex]?.date || '' : ''}
                        onChange={(e) => {
                            if (editingDateIndex !== null) {
                                handleDateChange(editingDateIndex, e.target.value);
                            }
                        }}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        sx={{ minWidth: 200 }}
                    />
                </Box>
            </Popover>

            <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                {isEditMode ? 'Editar Itinerario' : 'Crear Nuevo Itinerario'}
            </Typography>

            {loadingItinerary && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            )}

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
                        {currentItinerary.items.length < 2 && currentItinerary.items.length > 0 && (
                            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary', fontStyle: 'italic' }}>
                                Agrega más lugares para ordenar.
                            </Typography>
                        )}
                        <DragDropContext onDragEnd={onDragEnd}>
                            <ItineraryPlaceThumbnail 
                                itinerary={currentItinerary} 
                                onRemovePlace={handleRemovePlace}
                                onEditDate={handleEditDate}
                            />
                        </DragDropContext>
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
                        {isEditMode ? '¡Itinerario actualizado exitosamente!' : '¡Itinerario creado exitosamente!'}
                    </Alert>
                )}

                <Stack direction="row" spacing={2}>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        sx={{ minWidth: 120 }}
                    >
                        {loading ? <CircularProgress size={20} /> : isEditMode ? 'Guardar Cambios' : 'Crear Itinerario'}
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/itineraries')}
                    >
                        Cancelar
                    </Button>
                </Stack>
            </Paper>
        </Container>
        </>
    );
};

function ItineraryPlaceThumbnail({ 
    itinerary, 
    onRemovePlace, 
    onEditDate 
}: { 
    itinerary: Itinerary; 
    onRemovePlace: (placeId: string) => void;
    onEditDate: (event: React.MouseEvent<HTMLElement>, index: number) => void;
}) {
    return (
        <Droppable droppableId="itinerary-places">
            {(provided) => (
                <Box
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    sx={{
                        mt: 2,
                        display: 'grid',
                        gap: { xs: 3, md: 4 },
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
                    }}
                >
                    {itinerary.items.map((item, index) => (
                        <Draggable key={item.place?.id} draggableId={item.place?.id || `item-${index}`} index={index}>
                            {(provided, snapshot) => (
                                <Card
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    elevation={0}
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        border: '2px solid #000',
                                        borderRadius: 2,
                                        backgroundColor: '#fff',
                                        boxShadow: snapshot.isDragging 
                                            ? '12px 12px 8px 0px rgba(0,0,0,0.9)' 
                                            : '6px 6px 4px 0px rgba(0,0,0,0.7)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: snapshot.isDragging ? 'none' : 'translate(-2px, -2px)',
                                            boxShadow: snapshot.isDragging 
                                                ? '12px 12px 8px 0px rgba(0,0,0,0.9)' 
                                                : '8px 8px 6px 0px rgba(0,0,0,0.7)',
                                            borderColor: '#333',
                                        },
                                        position: 'relative',
                                        opacity: snapshot.isDragging ? 0.8 : 1,
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
                                            position: 'relative',
                                        }}
                                        onError={(e: any) => {
                                            const target = e.target as HTMLDivElement;
                                            target.style.backgroundImage = 'url(/placeholder-image.jpg)';
                                        }}
                                    >
                                        <IconButton
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onRemovePlace(item.place?.id || '');
                                            }}
                                            sx={{
                                                position: 'absolute',
                                                top: 8,
                                                right: 8,
                                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(255, 255, 255, 1)',
                                                },
                                            }}
                                            size="small"
                                        >
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                    <CardContent
                                        sx={{ flexGrow: 1, p: 3, backgroundColor: '#fff', cursor: 'pointer' }}
                                        onClick={() => window.open(`/place/${item.place?.id}`, '_blank')}
                                    >
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
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                                            <IconButton
                                                size="small"
                                                onClick={(e) => onEditDate(e, index)}
                                                sx={{
                                                    color: '#666',
                                                    '&:hover': {
                                                        color: '#000',
                                                    },
                                                }}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </CardContent>
                                </Card>
                            )}
                        </Draggable>
                    ))}
                    {provided.placeholder}
                </Box>
            )}
        </Droppable>
    )
}

export default CreateItinerary;

