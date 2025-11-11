import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  IconButton,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Snackbar,
  Backdrop,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PeopleIcon from "@mui/icons-material/People";
import MapIcon from "@mui/icons-material/Map";
import { useAuth } from "../../hooks/useAuth";
import groupService from "../../services/group.service";
import apiService from "../../services/api.service";
import type { Group } from "../../types/group";
import type { Itinerary } from "../../types/itinerary";
import { useNavigate } from "react-router-dom";

interface GroupDetailDialogProps {
  open: boolean;
  group: Group | null;
  onClose: () => void;
  onAddMember: (group: Group) => void;
  onRefresh: () => void;
}

export const GroupDetailDialog: React.FC<GroupDetailDialogProps> = ({
  open,
  group,
  onClose,
  onAddMember,
  onRefresh,
}) => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [showItinerarySelector, setShowItinerarySelector] = useState(false);
  const [userItineraries, setUserItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assigningItinerary, setAssigningItinerary] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);

  const isAdmin = group?.adminId === auth.user?.id;

  useEffect(() => {
    if (showItinerarySelector && isAdmin) {
      loadUserItineraries();
    }
  }, [showItinerarySelector, isAdmin]);

  const loadUserItineraries = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getUserItineraries();
      if (response.success && response.data) {
        // Filtrar solo itinerarios que tengan items
        const validItineraries = response.data.filter(
          (it: Itinerary) => it.items && it.items.length > 0
        );
        setUserItineraries(validItineraries);
      }
    } catch (err) {
      console.error("Error loading itineraries:", err);
      setError("Error al cargar los itinerarios");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignItinerary = async (itineraryId: string) => {
    if (!group) return;

    setAssigningItinerary(true);
    setError(null);

    try {
      await groupService.assignItinerary(group.id, itineraryId);
      setShowItinerarySelector(false);
      setSuccessMessage("¡Itinerario asignado exitosamente al grupo!");
      setSuccessSnackbarOpen(true);
      onRefresh();
      
      // Wait 2 seconds before closing to show the success message
      await new Promise(resolve => setTimeout(resolve, 2000));
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al asignar el itinerario");
      }
    } finally {
      setAssigningItinerary(false);
    }
  };

  const handleRemoveItinerary = async () => {
    if (!group || !group.assignedItineraryId) return;

    if (
      !window.confirm(
        "¿Estás seguro de que quieres desasignar este itinerario del grupo?"
      )
    ) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await groupService.removeItinerary(group.id);
      setSuccessMessage("¡Itinerario desasignado exitosamente del grupo!");
      setSuccessSnackbarOpen(true);
      onRefresh();

      // Wait 2 seconds before closing to show the success message
      await new Promise(resolve => setTimeout(resolve, 2000));
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al desasignar el itinerario");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewItinerary = () => {
    if (group?.assignedItineraryId) {
      onClose(); // Close the dialog first
      navigate(`/itinerary/${group.assignedItineraryId}`);
    }
  };

  if (!group) return null;

  const isProcessing = assigningItinerary || loading;

  return (
    <Dialog
      open={open}
      onClose={isProcessing ? undefined : onClose}
      maxWidth="md"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          margin: { xs: 1, sm: 2 },
          width: { xs: "calc(100% - 16px)", sm: "auto" },
          minHeight: { xs: "80vh", sm: "400px" },
          position: "relative",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PeopleIcon color="primary" />
          <Typography variant="h6">{group.name}</Typography>
        </Box>
        <IconButton onClick={onClose} size="small" disabled={isProcessing}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Loading Backdrop */}
      <Backdrop
        open={isProcessing}
        sx={{
          position: "absolute",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          borderRadius: 1,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <CircularProgress size={60} />
          <Typography variant="body1" color="primary" fontWeight={500}>
            Procesando...
          </Typography>
        </Box>
      </Backdrop>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Descripción */}
        {group.description && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" color="text.secondary">
              {group.description}
            </Typography>
          </Box>
        )}

        {/* Itinerario Asignado */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
          >
            <MapIcon /> Itinerario
          </Typography>

          {group.assignedItinerary ? (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {group.assignedItinerary.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {group.assignedItinerary.items?.length || 0} lugares
                  {group.assignedItinerary.createdAt &&
                    ` • ${new Date(group.assignedItinerary.createdAt).toLocaleDateString("es-ES")}`}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={handleViewItinerary}>
                  Ver Itinerario
                </Button>
                {isAdmin && (
                  <Button
                    size="small"
                    color="error"
                    onClick={handleRemoveItinerary}
                    disabled={loading}
                  >
                    Desasignar
                  </Button>
                )}
              </CardActions>
            </Card>
          ) : (
            <>
              {showItinerarySelector ? (
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Selecciona un itinerario para asignar al grupo:
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => setShowItinerarySelector(false)}
                    >
                      Cancelar
                    </Button>
                  </Box>

                  {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                      <CircularProgress />
                    </Box>
                  ) : userItineraries.length === 0 ? (
                    <Alert severity="info">
                      No tienes itinerarios disponibles para asignar. Crea uno
                      primero.
                    </Alert>
                  ) : (
                    <List sx={{ maxHeight: 300, overflow: "auto" }}>
                      {userItineraries.map((itinerary) => (
                        <ListItemButton
                          key={itinerary.id}
                          onClick={() => itinerary.id && handleAssignItinerary(itinerary.id)}
                          disabled={assigningItinerary}
                          sx={{
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 1,
                            mb: 1,
                          }}
                        >
                          <ListItemText
                            primary={itinerary.name}
                            secondary={`${itinerary.items?.length || 0} lugares`}
                          />
                          {assigningItinerary && (
                            <CircularProgress size={20} />
                          )}
                        </ListItemButton>
                      ))}
                    </List>
                  )}
                </Box>
              ) : (
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    No hay itinerario asignado
                  </Typography>
                  {isAdmin && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AssignmentIcon />}
                      onClick={() => setShowItinerarySelector(true)}
                      sx={{ mt: 1 }}
                    >
                      Asignar Itinerario
                    </Button>
                  )}
                </Box>
              )}
            </>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Miembros */}
        <Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              Miembros ({group.members?.length || 0})
            </Typography>
            {isAdmin && (
              <Button
                size="small"
                startIcon={<PersonAddIcon />}
                onClick={() => onAddMember(group)}
              >
                Agregar
              </Button>
            )}
          </Box>

          <List>
            {group.members?.map((member) => (
              <ListItem
                key={member.id}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemAvatar>
                  <Avatar>{member.name?.charAt(0) || member.email.charAt(0)}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={member.name || member.email}
                  secondary={member.email}
                />
                {member.id === group.adminId && (
                  <Chip label="Admin" color="primary" size="small" />
                )}
              </ListItem>
            ))}
          </List>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isProcessing}>Cerrar</Button>
      </DialogActions>

      {/* Success Snackbar */}
      <Snackbar
        open={successSnackbarOpen}
        autoHideDuration={1900}
        onClose={() => setSuccessSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSuccessSnackbarOpen(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};
