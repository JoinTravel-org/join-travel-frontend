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
  Tabs,
  Tab,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import groupService from "../../services/group.service";
import GroupExpenses from "./GroupExpenses";
import type { Group, CreateGroupRequest } from "../../types/group";
import { AddMemberDialog } from "./AddMemberDialog";
import { GroupChatDialog } from "./GroupChatDialog";
import { GroupDetailDialog } from "./GroupDetailDialog";

export default function GroupPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const hasCheckedAuth = React.useRef(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CreateGroupRequest>({
    name: "",
    description: "",
  });
  const [groups, setGroups] = useState<Group[]>([]);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [selectedGroupForChat, setSelectedGroupForChat] =
    useState<Group | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedGroupForDetail, setSelectedGroupForDetail] = useState<Group | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

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
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al crear el grupo");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddMemberDialog = (group: Group) => {
    setSelectedGroup(group);
    setAddMemberDialogOpen(true);
  };

  const handleCloseAddMemberDialog = () => {
    setAddMemberDialogOpen(false);
    setSelectedGroup(null);
  };

  const handleMemberAdded = async () => {
    await fetchGroups(); // Refresh group list to show new member
  };

  const handleRemoveUser = async (groupId: string, userId: string) => {
    try {
      await groupService.removeMember(groupId, userId);
      await fetchGroups(); // Refresh group list after removal
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message || "No se pudo eliminar el usuario.");
      } else {
        alert("No se pudo eliminar el usuario.");
      }
    }
  };

  const handleGroupClick = (groupId: string) => {
    setSelectedGroupId(groupId);
    setTabValue(1); // Switch to expenses tab
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    if (newValue === 0) {
      setSelectedGroupId(null);
    } else if (newValue === 1) {
      // When switching to expenses tab, show all user expenses if no group selected
      if (!selectedGroupId) {
        // No need to set selectedGroupId, GroupExpenses will handle null
      }
    }
  };

  const handleOpenChat = (group: Group) => {
    setSelectedGroupForChat(group);
    setChatDialogOpen(true);
  };

  const handleCloseChat = () => {
    setChatDialogOpen(false);
    setSelectedGroupForChat(null);
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

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Grupos" />
          <Tab label="Gastos" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <>
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
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
              >
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
                    minWidth: 300,
                    maxWidth: 450,
                    flex: "1 1 350px",
                    background: "#fafafa",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    "&:hover": {
                      background: "#f5f5f5",
                      boxShadow: 1,
                    },
                  }}
                  onClick={(e) => {
                    // Prevent navigation if clicking on interactive elements
                    if (
                      (e.target as HTMLElement).closest(
                        "button, input, textarea, select"
                      )
                    ) {
                      e.stopPropagation();
                      return;
                    }
                    setSelectedGroupForDetail(group);
                    setDetailDialogOpen(true);
                  }}
                >
                  {/* Content that grows to push buttons down */}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {group.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
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
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 0.5,
                          }}
                        >
                          {group.members
                            .filter((member) => member.id !== group.adminId)
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
                                  {member.id === auth.user?.id && " (tú)"}
                                </Typography>
                                {/* Only show remove button if current user is admin */}
                                {group.adminId === auth.user?.id && (
                                  <Button
                                    size="small"
                                    color="error"
                                    sx={{ minWidth: 0, ml: 1 }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveUser(group.id, member.id);
                                    }}
                                  >
                                    <CloseIcon fontSize="small" />
                                  </Button>
                                )}
                              </Box>
                            ))}
                        </Box>
                      ) : (
                        <Typography
                          variant="body2"
                          color="text.disabled"
                          sx={{ pl: 1 }}
                        >
                          No hay usuarios agregados
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Buttons always at the bottom */}
                  <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {/* Only show add members button if current user is admin */}
                    {group.adminId === auth.user?.id && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<PersonAddIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenAddMemberDialog(group);
                        }}
                        sx={{ flex: "1 1 auto", minWidth: "140px" }}
                      >
                        Agregar
                      </Button>
                    )}
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedGroupId(group.id);
                        setTabValue(1);
                      }}
                      sx={{ flex: "1 1 auto", minWidth: "110px" }}
                    >
                      Gastos
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="secondary"
                      startIcon={<ChatIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenChat(group);
                      }}
                      sx={{ flex: "1 1 auto", minWidth: "100px" }}
                    >
                      Chat
                    </Button>
                  </Box>

                  {/* Delete Group Button - Only show if user is admin */}
                  {group.adminId === auth.user?.id && (
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
                  )}
                </Box>
              ))}
            </Box>
          )}
        </>
      )}

      {tabValue === 1 && (
        <GroupExpenses groupId={selectedGroupId || undefined} />
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
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
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
              } catch (err: unknown) {
                if (err instanceof Error) {
                  setDeleteError(
                    err.message || "No se pudo eliminar el grupo."
                  );
                } else {
                  setDeleteError("No se pudo eliminar el grupo.");
                }
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

      {/* Add Member Dialog */}
      {selectedGroup && (
        <AddMemberDialog
          open={addMemberDialogOpen}
          onClose={handleCloseAddMemberDialog}
          groupId={selectedGroup.id}
          groupName={selectedGroup.name}
          currentMembers={selectedGroup.members || []}
          onMemberAdded={handleMemberAdded}
        />
      )}

      {/* Group Chat Dialog */}
      {selectedGroupForChat && (
        <GroupChatDialog
          open={chatDialogOpen}
          onClose={handleCloseChat}
          groupId={selectedGroupForChat.id}
          groupName={selectedGroupForChat.name}
        />
      )}

      {/* Group Detail Dialog */}
      <GroupDetailDialog
        open={detailDialogOpen}
        group={selectedGroupForDetail}
        onClose={() => {
          setDetailDialogOpen(false);
          setSelectedGroupForDetail(null);
        }}
        onAddMember={(group) => {
          setSelectedGroup(group);
          setAddMemberDialogOpen(true);
        }}
        onRefresh={fetchGroups}
      />
    </Container>
  );
}
