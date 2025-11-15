import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Fab,
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
  // Removed createDialogOpen state

  const fetchLists = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getUserLists();
      setLists(response.data);
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
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
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 3,
          }}
        >
          {lists.map((list) => (
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