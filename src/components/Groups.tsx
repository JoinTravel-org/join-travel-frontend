import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import groupService from "../services/group.service";
import type { Group, CreateGroupRequest } from "../types/group";

interface CreateGroupForm extends CreateGroupRequest {}

export default function GroupPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const hasCheckedAuth = React.useRef(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CreateGroupForm>({
    name: "",
    description: "",
  });
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    if (!hasCheckedAuth.current) {
      hasCheckedAuth.current = true;
      if (!auth.isAuthenticated) {
        navigate("/login");
        return;
      }
      // Fetch groups when component mounts and user is authenticated
      fetchGroups();
    }
  }, [auth.isAuthenticated, navigate]);

  const fetchGroups = async () => {
    try {
      if (!auth.user?.id) return;
      const response = await groupService.getGroups(auth.user.id);
      setGroups(response.data);
    } catch (err) {
      console.error("Error fetching groups:", err);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setError(null);
    setForm({ name: "", description: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.user?.id) return;

    setLoading(true);
    setError(null);

    try {
      await groupService.createGroup(auth.user.id, form);
      handleClose();
      // Refresh groups list after creation
      await fetchGroups();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: 4,
        minHeight: "90vh", // Make it almost full screen height
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
        <Typography variant="h4" component="h1">
          Mis Grupos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          Crear Grupo
        </Button>
      </Box>

      {/* No Groups Message */}
      {groups.length === 0 && (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography
            variant="h6"
            color="text.secondary"
            textAlign="center"
            sx={{ mb: 2 }}
          >
            No hay grupos creados
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Crea un grupo para comenzar a compartir itinerarios con otros
            viajeros
          </Typography>
        </Box>
      )}

      {/* Create Group Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Crear Nuevo Grupo</DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Nombre del Grupo"
              fullWidth
              variant="outlined"
              value={form.name}
              onChange={handleChange}
              error={!!error}
              required
              inputProps={{ minLength: 5, maxLength: 50 }}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="description"
              label="Descripción (opcional)"
              fullWidth
              variant="outlined"
              value={form.description}
              onChange={handleChange}
              multiline
              rows={3}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || form.name.length < 5}
            >
              {loading ? <CircularProgress size={24} /> : "Crear"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
}
