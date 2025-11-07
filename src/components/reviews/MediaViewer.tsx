import React, { useState, useEffect } from 'react';
import {
  Box,
  Modal,
  IconButton,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Close, Download } from '@mui/icons-material';
import reviewService from '../../services/review.service';
import type { ReviewMedia } from '../../types/review';

interface MediaViewerProps {
  media: ReviewMedia;
  open: boolean;
  onClose: () => void;
}

const MediaViewer: React.FC<MediaViewerProps> = ({
  media,
  open,
  onClose,
}) => {
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (open && media) {
      loadMedia();
    }
  }, [open, media]);

  const loadMedia = async () => {
    try {
      setLoading(true);
      setError('');
      const blob = await reviewService.getReviewMedia(media.id);
      const url = URL.createObjectURL(blob);
      setMediaUrl(url);
    } catch {
      setError('Error al cargar el archivo multimedia');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (mediaUrl) {
      const link = document.createElement('a');
      link.href = mediaUrl;
      link.download = media.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };


  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          maxWidth: '90vw',
          maxHeight: '90vh',
          bgcolor: 'background.paper',
          borderRadius: 2,
          p: 1,
          boxShadow: 24,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1,
          }}
        >
          <Typography variant="h6" sx={{ flex: 1, mr: 2 }}>
            {media.filename}
          </Typography>
          <Box>
            <IconButton onClick={handleDownload} size="small">
              <Download />
            </IconButton>
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </Box>

        {/* Media Content */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '200px',
            maxHeight: '80vh',
            overflow: 'auto',
          }}
        >
          {loading && <CircularProgress />}
          {error && <Alert severity="error">{error}</Alert>}
          {mediaUrl && !loading && (
            <>
              {media.mimeType.startsWith('image/') ? (
                <img
                  src={mediaUrl}
                  alt={media.filename}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                  }}
                />
              ) : media.mimeType.startsWith('video/') ? (
                <video
                  controls
                  crossOrigin="anonymous"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                  }}
                >
                  <source src={mediaUrl} type={media.mimeType} />
                  Tu navegador no soporta la reproducción de video.
                </video>
              ) : null}
            </>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default MediaViewer;