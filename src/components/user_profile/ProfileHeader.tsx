import React, { useState } from 'react';
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import userService from '../../services/user.service';
import type { User } from '../../types/user';

interface ProfileHeaderProps {
  user: User;
  onUpdate: () => void;
  editable?: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  onUpdate,
  editable = false,
}) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editField, setEditField] = useState<'name' | 'age' | null>(null);
  const [editValue, setEditValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });
  const [avatarLoading, setAvatarLoading] = useState(false);

  const handleEditClick = (field: 'name' | 'age') => {
    setEditField(field);
    setEditValue(
      field === 'name'
        ? user.name || ''
        : user.age?.toString() || ''
    );
    setEditDialogOpen(true);
  };

  const handleEditConfirm = async () => {
    if (!editField) return;

    setLoading(true);
    try {
      let updateData: { name?: string; age?: number | null } = {};

      if (editField === 'name') {
        if (editValue.trim().length === 0) {
          throw new Error('El nombre no puede estar vacío');
        }
        if (editValue.length > 30) {
          throw new Error('El nombre no puede exceder 30 caracteres');
        }
        updateData.name = editValue.trim();
      } else if (editField === 'age') {
        if (editValue.trim().length === 0) {
          updateData.age = null;
        } else {
          const age = parseInt(editValue);
          if (isNaN(age) || age < 13 || age > 120) {
            throw new Error('La edad debe estar entre 13 y 120 años');
          }
          updateData.age = age;
        }
      }

      const response = await userService.updateProfile(
        updateData.name,
        updateData.age
      );

      if (response.success) {
        setSnackbar({
          open: true,
          message: 'Perfil actualizado correctamente',
          severity: 'success',
        });
        setEditDialogOpen(false);
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Error al actualizar perfil',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setSnackbar({
        open: true,
        message: 'El archivo no puede exceder 5MB',
        severity: 'error',
      });
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setSnackbar({
        open: true,
        message: 'Solo se permiten archivos JPG, PNG, GIF o WEBP',
        severity: 'error',
      });
      return;
    }

    setAvatarLoading(true);
    try {
      const response = await userService.uploadAvatar(file);
      if (response.success) {
        setSnackbar({
          open: true,
          message: 'Avatar actualizado correctamente',
          severity: 'success',
        });
        onUpdate();
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setSnackbar({
        open: true,
        message: 'Error al subir avatar',
        severity: 'error',
      });
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleAvatarDelete = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar tu foto de perfil?')) {
      return;
    }

    setAvatarLoading(true);
    try {
      const response = await userService.deleteAvatar();
      if (response.success) {
        setSnackbar({
          open: true,
          message: 'Avatar eliminado correctamente',
          severity: 'success',
        });
        onUpdate();
      }
    } catch (error) {
      console.error('Error deleting avatar:', error);
      setSnackbar({
        open: true,
        message: 'Error al eliminar avatar',
        severity: 'error',
      });
    } finally {
      setAvatarLoading(false);
    }
  };

  const getAvatarUrl = () => {
    if (user.profilePicture) {
      const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const avatarUrl = `${baseUrl}/uploads/avatars/${user.profilePicture}`;
      console.log('[ProfileHeader] Avatar URL:', avatarUrl, 'profilePicture:', user.profilePicture);
      return avatarUrl;
    }
    return undefined;
  };

  return (
    <Box>
      {/* Avatar Section */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Box sx={{ position: 'relative' }} key={user.profilePicture || 'no-avatar'}>
          {avatarLoading ? (
            <Box
              sx={{
                width: 134,
                height: 134,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                bgcolor: 'grey.200',
              }}
            >
              <CircularProgress size={67} />
            </Box>
          ) : (
            <Avatar
              src={getAvatarUrl()}
              alt={user.name || user.email}
              sx={{ width: 134, height: 134 }}
              imgProps={{
                onError: (e) => {
                  console.error('[ProfileHeader] Avatar image failed to load:', getAvatarUrl());
                  console.error('[ProfileHeader] Error event:', e);
                },
                onLoad: () => {
                  console.log('[ProfileHeader] Avatar image loaded successfully:', getAvatarUrl());
                }
              }}
            >
              {!user.profilePicture && <PersonIcon sx={{ fontSize: 67 }} />}
            </Avatar>
          )}
          {editable && (
            <>
              <input
                accept="image/jpeg,image/png,image/gif,image/webp"
                style={{ display: 'none' }}
                id="avatar-upload"
                type="file"
                onChange={handleAvatarUpload}
                disabled={avatarLoading}
              />
              <label htmlFor="avatar-upload">
                <IconButton
                  component="span"
                  size="small"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  }}
                  disabled={avatarLoading}
                >
                  <PhotoCameraIcon fontSize="small" />
                </IconButton>
              </label>
              {user.profilePicture && (
                <IconButton
                  size="small"
                  onClick={handleAvatarDelete}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bgcolor: 'error.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'error.dark',
                    },
                  }}
                  disabled={avatarLoading}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </>
          )}
        </Box>
      </Box>

      {/* User Info Fields */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Name Field */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 60 }}>
            Nombre:
          </Typography>
          <Typography variant="body1" sx={{ flex: 1 }}>
            {user.name || 'No especificado'}
          </Typography>
          {editable && (
            <IconButton
              size="small"
              onClick={() => handleEditClick('name')}
              sx={{ ml: 1 }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        {/* Email Field (not editable) */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 60 }}>
            Email:
          </Typography>
          <Typography variant="body1">{user.email}</Typography>
        </Box>

        {/* Age Field */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 60 }}>
            Edad:
          </Typography>
          <Typography variant="body1" sx={{ flex: 1 }}>
            {user.age !== undefined && user.age !== null ? `${user.age} años` : 'No especificada'}
          </Typography>
          {editable && (
            <IconButton
              size="small"
              onClick={() => handleEditClick('age')}
              sx={{ ml: 1 }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => !loading && setEditDialogOpen(false)}>
        <DialogTitle>
          Editar {editField === 'name' ? 'Nombre' : 'Edad'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={editField === 'name' ? 'Nombre' : 'Edad'}
            type={editField === 'age' ? 'number' : 'text'}
            fullWidth
            variant="outlined"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            disabled={loading}
            inputProps={
              editField === 'age'
                ? { min: 13, max: 120 }
                : { maxLength: 30 }
            }
            helperText={
              editField === 'name'
                ? `${editValue.length}/30 caracteres`
                : 'Edad entre 13 y 120 años (opcional)'
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleEditConfirm}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfileHeader;
