import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Button,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tabs,
  Tab,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import apiService from "../../services/api.service";
import type { Place } from "../../types/place";
import ItineraryMap from "./ItineraryMap";

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (!hasCheckedAuth.current) {
      hasCheckedAuth.current = true;
      if (!auth.isLoading && !auth.isAuthenticated) {
        navigate("/login");
      }
    }
  }, [auth.isAuthenticated, auth.isLoading, navigate]);

  // Fetch itinerary details on component mount
  useEffect(() => {
    const fetchItinerary = async () => {
      if (!id) {
        console.log("ItineraryDetail: No id provided");
        return;
      }

      if (!auth.isAuthenticated) {
        console.log("ItineraryDetail: User not authenticated");
        return;
      }

      console.log("ItineraryDetail: Fetching itinerary with id:", id);
      setLoading(true);
      setError(null);

      try {
        const response = await apiService.getItineraryById(id);
        console.log("ItineraryDetail: Response received:", response);

        if (response.success && response.data) {
          setItinerary(response.data);
        } else {
          setError("No se pudo cargar el itinerario.");
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Error desconocido al cargar el itinerario";
        setError(`Error al cargar el itinerario: ${errorMessage}`);
        console.error("Error fetching itinerary:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchItinerary();
  }, [auth.isAuthenticated, id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!id) return;

    setDeleting(true);
    setError(null);

    try {
      await apiService.deleteItinerary(id);
      setDeleteDialogOpen(false);
      navigate("/itineraries");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error desconocido al eliminar el itinerario";
      setError(`Error al eliminar el itinerario: ${errorMessage}`);
      console.error("Error deleting itinerary:", err);
      setDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          ¿Eliminar itinerario?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            ¿Estás seguro de que deseas eliminar este itinerario? Esta acción no
            se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting}>
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting}
            autoFocus
          >
            {deleting ? <CircularProgress size={20} /> : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 3,
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button variant="outlined" onClick={() => navigate("/itineraries")}>
            ← Volver a Itinerarios
          </Button>
          {!loading && !error && itinerary && itinerary.userId === auth.user?.id && (
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                onClick={() => navigate(`/itinerary/${id}/edit`)}
              >
                Editar Itinerario
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleDeleteClick}
              >
                Eliminar
              </Button>
            </Box>
          )}
        </Box>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
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

              <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
                <Tabs
                  value={activeTab}
                  onChange={(_: React.SyntheticEvent, newValue: number) =>
                    setActiveTab(newValue)
                  }
                >
                  <Tab label="Vista de Lista" />
                  <Tab label="Vista de Mapa" />
                </Tabs>
              </Box>

              {activeTab === 0 && (
                <ItineraryPlacesGrid items={itinerary.items} />
              )}
              {activeTab === 1 && <ItineraryMap items={itinerary.items} />}
            </Box>
          </>
        )}
      </Container>
    </>
  );
};

interface ItineraryPlacesGridProps {
  items: ItineraryItem[];
}

function ItineraryPlacesGrid({ items }: ItineraryPlacesGridProps) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Sort items by date
  const sortedItems = [...items].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // Get unique dates and create day chips
  const uniqueDates = Array.from(
    new Set(sortedItems.map((item) => item.date))
  ).sort();

  const dayChips = uniqueDates.map((date, index) => ({
    date,
    label: `Día ${index + 1}`,
    displayDate: new Date(date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      timeZone: "UTC",
    }),
  }));

  // Filter items by selected day
  const filteredItems = selectedDay
    ? sortedItems.filter((item) => item.date === selectedDay)
    : sortedItems;

  return (
    <>
      {/* Day filter chips */}
      <Stack
        direction="row"
        spacing={1}
        sx={{ mb: 3, flexWrap: "wrap", gap: 1 }}
      >
        <Chip
          label="Todos"
          onClick={() => setSelectedDay(null)}
          color={selectedDay === null ? "primary" : "default"}
          variant={selectedDay === null ? "filled" : "outlined"}
          sx={{ fontWeight: selectedDay === null ? 700 : 400 }}
        />
        {dayChips.map((chip) => (
          <Chip
            key={chip.date}
            label={`${chip.label} ${chip.displayDate}`}
            onClick={() => setSelectedDay(chip.date)}
            color={selectedDay === chip.date ? "primary" : "default"}
            variant={selectedDay === chip.date ? "filled" : "outlined"}
            sx={{ fontWeight: selectedDay === chip.date ? 700 : 400 }}
          />
        ))}
      </Stack>

      <Box
        sx={{
          mt: 2,
          display: "grid",
          gap: { xs: 3, md: 4 },
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
          },
        }}
      >
        {filteredItems.map((item) => (
          <Card
            key={item.id}
            onClick={() => window.open(`/place/${item.place?.id}`, "_blank")}
            elevation={0}
            sx={{
              height: "100%",
              display: "flex",
              cursor: "pointer",
              flexDirection: "column",
              border: "2px solid #000",
              borderRadius: 2,
              backgroundColor: "#fff",
              boxShadow: "6px 6px 4px 0px rgba(0,0,0,0.7)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translate(-2px, -2px)",
                boxShadow: "8px 8px 6px 0px rgba(0,0,0,0.7)",
                borderColor: "#333",
              },
            }}
          >
            <Box
              sx={{
                height: 200,
                backgroundImage: `url(${
                  item.place?.image || "/placeholder-image.jpg"
                })`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundColor: "#f0f0f0",
                borderBottom: "2px solid #000",
              }}
              onError={(e: any) => {
                const target = e.target as HTMLDivElement;
                target.style.backgroundImage = "url(/placeholder-image.jpg)";
              }}
            />
            <CardContent sx={{ flexGrow: 1, p: 3, backgroundColor: "#fff" }}>
              <Typography
                variant="h6"
                component="h3"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  fontSize: "1.25rem",
                  letterSpacing: "0.02em",
                  color: "#000",
                }}
              >
                {item.place?.name}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.7rem",
                    color: "#000",
                  }}
                >
                  {item.date}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </>
  );
}

export default ItineraryDetail;
