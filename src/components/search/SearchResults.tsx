import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
} from "@mui/material";
import { Search as SearchIcon, Clear as ClearIcon } from "@mui/icons-material";
import { useSearchParams, useNavigate } from "react-router-dom";
import UserCard from "./UserCard";
import userService from "../../services/user.service";
import type { User } from "../../types/user";

const SearchResults: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

  const performSearch = async (query: string) => {
    if (!query.trim() || query.trim().length < 3) {
      setUsers([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await userService.searchUsers(query.trim());
      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        setUsers([]);
        setError(response.message || "Error al buscar usuarios");
      }
    } catch (err) {
      console.error("Search error:", err);
      setUsers([]);
      setError("Error al buscar usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [searchParams]);

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setUsers([]);
    setError(null);
    setSearchParams({});
  };

  const handleUserClick = (user: User) => {
    navigate(`/user/${user.id}`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        Buscar Usuarios
      </Typography>

      {/* Search Form */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box component="form" onSubmit={handleSearchSubmit}>
          <TextField
            fullWidth
            placeholder="Buscar usuarios por email..."
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton onClick={handleClearSearch} size="small">
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Busca usuarios escribiendo al menos 3 caracteres de su email
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Results */}
      {!loading && !error && (
        <>
          {users.length > 0 ? (
            <>
              <Typography variant="h6" gutterBottom>
                {users.length} usuario{users.length !== 1 ? "s" : ""} encontrado{users.length !== 1 ? "s" : ""}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {users.map((user) => (
                  <UserCard key={user.id} user={user} onClick={() => handleUserClick(user)} />
                ))}
              </Box>
            </>
          ) : searchQuery && searchQuery.length >= 3 && !loading ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No se encontraron usuarios
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Intenta con un email diferente o verifica la ortografía
              </Typography>
            </Box>
          ) : null}
        </>
      )}
    </Container>
  );
};

export default SearchResults;