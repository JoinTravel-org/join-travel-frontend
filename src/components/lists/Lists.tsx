import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Fab,
  TextField,
  MenuItem,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api.service';
import ListCard from './ListCard';
import type { List } from '../../types/list';

const Lists: React.FC = () => {
  const navigate = useNavigate();
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // filter states: search by list name or by place location
  const [filterQuery, setFilterQuery] = useState("");
  const [filterType, setFilterType] = useState<"name" | "location">("name");
  // Removed createDialogOpen state

  const fetchLists = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getUserLists();
      setLists(response.data || []);
    } catch (err: any) {
      console.error('Error fetching lists:', err);
      setError(err.message || 'Error al cargar las listas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  // no author dependency; keep original behavior: fetch current user's lists once

  const handleCreateSuccess = () => {
    fetchLists();
  };

  const handleEdit = (list: List) => {
    // TODO: Implement edit functionality
    console.log('Edit list:', list);
  };

  const handleDelete = async (listId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta lista?')) {
      return;
    }

    try {
      await apiService.deleteList(listId);
      setLists(prev => prev.filter(list => list.id !== listId));
    } catch (err: any) {
      console.error('Error deleting list:', err);
      setError(err.message || 'Error al eliminar la lista');
    }
  };

  const handleView = (list: List) => {
    navigate(`/list/${list.id}`);
  };

  // compute filtered lists locally by name or by place location
  const filteredLists = useMemo(() => {
    if (!filterQuery || filterQuery.trim() === "") return lists;
    const q = filterQuery.trim().toLowerCase();
    if (filterType === "name") {
      return lists.filter((l) => (l.title || "").toLowerCase().includes(q));
    }
    // location filter: check any place city or place name
    return lists.filter((l) => {
      if (!l.places || l.places.length === 0) return false;
      return l.places.some((p) => {
        const city = (p.city || "").toLowerCase();
        const pname = (p.name || "").toLowerCase();
        return city.includes(q) || pname.includes(q);
      });
    });
  }, [lists, filterQuery, filterType]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" gap={2} alignItems="center" mb={2} flexDirection={{ xs: 'column', sm: 'row' }}>
        <TextField
          label="Buscar"
          placeholder={filterType === 'name' ? 'Buscar por nombre de lista' : 'Buscar por ubicación (lugar o nombre del lugar)'}
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          sx={{ width: { xs: '100%', sm: 360 } }}
        />

        <TextField
          select
          label="Filtro"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as 'name' | 'location')}
          sx={{ width: 160 }}
        >
          <MenuItem value="name">Nombre</MenuItem>
          <MenuItem value="location">Ubicación</MenuItem>
        </TextField>

        <Box flex="1" />
      </Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        flexDirection={{ xs: "column", sm: "row" }}
        gap={2}
      >
        <Typography variant="h4" component="h1">
          Mis Listas
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/create-list')}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          Crear Lista
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {lists.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No tienes listas aún
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Crea tu primera lista para organizar tus lugares favoritos
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/create-list')}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Crear Primera Lista
          </Button>
        </Box>
      ) : filteredLists.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No hay listas que coincidan con la búsqueda.
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: "1fr", sm: "repeat(auto-fill, minmax(300px, 1fr))" },
            gap: 3,
          }}
        >
          {filteredLists.map((list) => (
            <ListCard
              key={list.id}
              list={list}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          ))}
        </Box>
      )}

      {/* Floating Action Button for mobile */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', md: 'none' },
        }}
        onClick={() => navigate('/create-list')}
      >
        <AddIcon />
      </Fab>

    </Box>
  );
};

export default Lists;