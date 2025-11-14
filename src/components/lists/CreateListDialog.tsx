import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
} from '@mui/material';
import apiService from '../../services/api.service';
import type { CreateListRequest } from '../../types/list';

interface CreateListDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateListDialog: React.FC<CreateListDialogProps> = ({ open, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('El título es requerido');
      return;
    }

    if (title.length < 3) {
      setError('El título debe tener al menos 3 caracteres');
      return;
    }

    if (description && description.length > 500) {
      setError('La descripción no puede exceder los 500 caracteres');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const listData: CreateListRequest = {
        title: title.trim(),
        ...(description.trim() && { description: description.trim() }),
      };

      await apiService.createList(listData);
      onSuccess();
      handleClose();
    } catch (err: any) {
      console.error('Error creating list:', err);
      if (err.details) {
        setError(err.details.join(', '));
      } else {
        setError(err.message || 'Error al crear la lista');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Crear Nueva Lista</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Título"
              fullWidth
              variant="outlined"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              inputProps={{ maxLength: 100 }}
              helperText={`${title.length}/100 caracteres`}
            />
            <TextField
              margin="dense"
              label="Descripción (opcional)"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              inputProps={{ maxLength: 500 }}
              helperText={`${description.length}/500 caracteres`}
            />
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Creando...' : 'Crear Lista'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateListDialog;