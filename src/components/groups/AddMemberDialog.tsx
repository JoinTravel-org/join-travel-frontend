import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SearchIcon from "@mui/icons-material/Search";
import userService from "../../services/user.service";
import groupService from "../../services/group.service";
import type { User } from "../../types/user";

interface AddMemberDialogProps {
  open: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
  currentMembers: User[];
  onMemberAdded: () => void;
}

export const AddMemberDialog: React.FC<AddMemberDialogProps> = ({
  open,
  onClose,
  groupId,
  groupName,
  currentMembers,
  onMemberAdded,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setSearchQuery("");
      setSearchResults([]);
      setError(null);
      setSuccess(null);
      setHasSearched(false);
    }
  }, [open]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError("Por favor ingrese un nombre o email para buscar");
      return;
    }

    if (searchQuery.trim().length < 2) {
      setError("El término de búsqueda debe tener al menos 2 caracteres");
      return;
    }

    setSearching(true);
    setError(null);
    setSuccess(null);
    setHasSearched(true);

    try {
      const response = await userService.searchUsers(searchQuery.trim());

      if (!response.success || !response.data) {
        setSearchResults([]);
        return;
      }

      // Filter out users who are already members
      const filteredResults = response.data.filter(
        (user: User) => !currentMembers.some((member) => member.id === user.id)
      );

      setSearchResults(filteredResults);
    } catch (err: unknown) {
      if (
        err instanceof Error &&
        (err.message?.includes("no encontrado") ||
          err.message?.includes("not found"))
      ) {
        setError("Error al buscar usuarios.");
      } else if (err instanceof Error) {
        setError(err.message || "Error al buscar usuarios");
      } else {
        setError("Error al buscar usuarios");
      }
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleAddMember = async (user: User) => {
    setAdding(true);
    setError(null);
    setSuccess(null);

    try {
      await groupService.addMember(groupId, [user.id]);
      setSuccess(`${user.email} ha sido agregado al grupo exitosamente`);

      // Clear search
      setSearchQuery("");
      setSearchResults([]);
      setHasSearched(false);

      // Notify parent component
      setTimeout(() => {
        onMemberAdded();
        setSuccess(null);
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Error al agregar miembro al grupo");
      } else {
        setError("Error al agregar miembro al grupo");
      }
    } finally {
      setAdding(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          margin: { xs: 1, sm: 2 },
          width: { xs: "calc(100% - 16px)", sm: "auto" },
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <PersonAddIcon />
          <Typography variant="h6">Agregar miembro a {groupName}</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label="Buscar por nombre o email"
            placeholder="Ej: Juan Pérez o juan@email.com"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={searching || adding}
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ mr: 1, color: "action.active" }} />
              ),
            }}
            sx={{ mb: 2 }}
          />

          <Button
            fullWidth
            variant="contained"
            onClick={handleSearch}
            disabled={searching || adding || !searchQuery.trim() || searchQuery.trim().length < 2}
            startIcon={
              searching ? <CircularProgress size={20} /> : <SearchIcon />
            }
          >
            {searching ? "Buscando..." : "Buscar usuarios"}
          </Button>

          {/* Search Results */}
          {hasSearched && searchResults.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Resultados de búsqueda ({searchResults.length}):
              </Typography>
              <List>
                {searchResults.map((user) => (
                  <ListItem key={user.id} disablePadding>
                    <ListItemButton
                      onClick={() => handleAddMember(user)}
                      disabled={adding}
                      sx={{
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 1,
                        mb: 1,
                      }}
                    >
                      <ListItemText
                        primary={user.email}
                        secondary={user.name || "Sin nombre"}
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={adding}
                        startIcon={
                          adding ? (
                            <CircularProgress size={16} />
                          ) : (
                            <PersonAddIcon />
                          )
                        }
                      >
                        {adding ? "Agregando..." : "Agregar"}
                      </Button>
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Messages */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {success}
            </Alert>
          )}

          {hasSearched &&
            searchResults.length === 0 &&
            !error &&
            !searching && (
              <Alert severity="info" sx={{ mt: 2 }}>
                No se encontraron usuarios que coincidan con la búsqueda.
              </Alert>
            )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={adding}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
