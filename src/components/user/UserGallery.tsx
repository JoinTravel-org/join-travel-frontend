import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import userService from '../../services/user.service';
import MediaGrid from '../media/MediaGrid';
import type { UserMedia } from '../../types/user';

interface UserGalleryProps {
  userId: string;
}

const UserGallery: React.FC<UserGalleryProps> = ({ userId }) => {
  const [media, setMedia] = useState<UserMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserMedia = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await userService.getUserMedia(userId);
        if (response.success && response.data) {
          // Sort by createdAt descending (newest first) and limit to 20
          const sortedMedia = response.data
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 20);
          setMedia(sortedMedia);
        } else {
          setMedia([]);
        }
      } catch (err: unknown) {
        const errorMessage = (err as { message?: string })?.message || '';
        setError(errorMessage || 'Error al cargar la galería');
        setMedia([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserMedia();
  }, [userId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Galería de Fotos
      </Typography>

      {media.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          No hay fotos disponibles.
        </Typography>
      ) : (
        <MediaGrid media={media} />
      )}
    </Box>
  );
};

export default UserGallery;