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
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import groupService from "../services/group.service";
import userService from "../services/user.service";
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
  const [addUserOpen, setAddUserOpen] = useState<string | null>(null); // groupId or null
  const [addUserEmail, setAddUserEmail] = useState("");
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [addUserError, setAddUserError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
      const response = await groupService.getGroups();
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

    setLoading(true);
    setError(null);

    try {
      await groupService.createGroup(form);
      handleClose();
      // Refresh groups list after creation
      await fetchGroups();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (groupId: string) => {
    setAddUserLoading(true);
    setAddUserError(null);
    try {
      // Search for user by email
      const searchResult = await userService.searchUsers(addUserEmail.trim());
      const user =
        searchResult.data && searchResult.data.length > 0
          ? searchResult.data[0]
          : null;

      if (!user || !user.id) {
        setAddUserError("El usuario no existe.");
        setAddUserLoading(false);
        return;
      }

      // Add user by ID
      await groupService.addMember(groupId, [user.id]);
      setAddUserOpen(null);
      setAddUserEmail("");
      await fetchGroups(); // Refresh group list to show new member
    } catch (err: any) {
      setAddUserError(err.message || "No se pudo agregar el usuario.");
    } finally {
      setAddUserLoading(false);
    }
  };

  const handleRemoveUser = async (groupId: string, userId: string) => {
    try {
      await groupService.removeMember(groupId, userId);
      await fetchGroups(); // Refresh group list after removal
    } catch (err: any) {
      alert(err.message || "No se pudo eliminar el usuario.");
    }
  };

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: 4,
        minHeight: "90vh",
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
      {groups.length === 0 ? (
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
      ) : (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          {groups.map((group) => (
            <Box
              key={group.id}
              sx={{
                position: "relative",
                border: "1px solid #e0e0e0",
                borderRadius: 2,
                p: 2,
                minWidth: 250,
                maxWidth: 350,
                flex: "1 1 250px",
                background: "#fafafa",
              }}
            >
              <Typography variant="h6" sx={{ mb: 1 }}>
                {group.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {group.description || "Sin descripción"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Admin: {group.admin?.email || group.adminId}
              </Typography>

              {/* Display group members */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Usuarios:
                </Typography>
                {group.members && group.members.length > 0 ? (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                    {group.members
                      ?.filter((member) => member.id !== auth.user?.id)
                      .map((member) => (
                        <Box
                          key={member.id}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            pl: 1,
                          }}
                        >
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ flexGrow: 1 }}
                          >
                            • {member.email}
                          </Typography>
                          <Button
                            size="small"
                            color="error"
                            sx={{ minWidth: 0, ml: 1 }}
                            onClick={() => handleRemoveUser(group.id, member.id)}
                          >
                            <CloseIcon fontSize="small" />
                          </Button>
                        </Box>
                      ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.disabled" sx={{ pl: 1 }}>
                    No hay usuarios agregados
                  </Typography>
                )}
              </Box>

              <Box sx={{ mt: 2 }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<PersonAddIcon />}
                  onClick={() => {
                    setAddUserOpen(group.id);
                    setAddUserEmail("");
                    setAddUserError(null);
                  }}
                >
                  Agregar usuarios
                </Button>
              </Box>
              {addUserOpen === group.id && (
                <Box sx={{ mt: 2 }}>
                  <TextField
                    size="small"
                    label="Email del usuario"
                    value={addUserEmail}
                    onChange={(e) => setAddUserEmail(e.target.value)}
                    disabled={addUserLoading}
                    sx={{ mr: 1 }}
                  />
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => handleAddUser(group.id)}
                    disabled={addUserLoading || !addUserEmail}
                  >
                    {addUserLoading ? <CircularProgress size={18} /> : "Agregar"}
                  </Button>
                  <Button
                    size="small"
                    onClick={() => {
                      setAddUserOpen(null);
                      setAddUserEmail("");
                      setAddUserError(null);
                    }}
                    sx={{ ml: 1 }}
                  >
                    Cancelar
                  </Button>
                  {addUserError && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                      {addUserError}
                    </Alert>
                  )}
                </Box>
              )}

              {/* Delete Group Button */}
              <Box sx={{ position: "absolute", top: 8, right: 8 }}>
                <Button
                  size="small"
                  color="error"
                  onClick={() => {
                    setGroupToDelete(group);
                    setDeleteDialogOpen(true);
                    setDeleteError(null);
                  }}
                  sx={{ minWidth: 0, p: 0 }}
                >
                  <DeleteIcon />
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {/* Create Group Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            Crear Nuevo Grupo
            <Button
              onClick={handleClose}
              size="small"
              sx={{ position: "absolute", right: 8, top: 8 }}
            >
              <CloseIcon />
            </Button>
          </DialogTitle>
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

      {/* Delete Group Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Eliminar grupo</DialogTitle>
        <DialogContent>
          <Typography>
            Esta acción no se puede deshacer. ¿Eliminar grupo?
          </Typography>
          {deleteError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deleteError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>No</Button>
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              if (!groupToDelete) return;
              setDeleteLoading(true);
              setDeleteError(null);
              try {
                await groupService.removeGroup(groupToDelete.id);
                setDeleteDialogOpen(false);
                setGroupToDelete(null);
                await fetchGroups();
              } catch (err: any) {
                setDeleteError(err.message || "No se pudo eliminar el grupo.");
              } finally {
                setDeleteLoading(false);
              }
            }}
            disabled={deleteLoading}
          >
            {deleteLoading ? <CircularProgress size={18} /> : "Sí, eliminar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
