import React, { useState } from 'react';
import {
  Box,
  Card,
  CardMedia,
} from '@mui/material';
import MediaViewer from '../reviews/media/MediaViewer';
import type { UserMedia } from '../../types/user';

interface MediaGridProps {
  media: UserMedia[];
}

const MediaGrid: React.FC<MediaGridProps> = ({ media }) => {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<UserMedia | null>(null);

  const handleMediaClick = (item: UserMedia) => {
    setSelectedMedia(item);
    setViewerOpen(true);
  };

  const handleViewerClose = () => {
    setViewerOpen(false);
    setSelectedMedia(null);
  };

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const target = event.target as HTMLImageElement;
    target.src = '/placeholder-image.jpg'; // Fallback placeholder
  };

  return (
    <>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(3, 1fr)',
            md: 'repeat(4, 1fr)',
            lg: 'repeat(5, 1fr)',
          },
          gap: 1,
        }}
      >
        {media.map((item) => (
          <Card
            key={item.id}
            sx={{
              cursor: 'pointer',
              aspectRatio: '1',
              borderRadius: 1,
              overflow: 'hidden',
              '&:hover': {
                boxShadow: 2,
                transform: 'scale(1.02)',
              },
              transition: 'all 0.2s ease',
            }}
            onClick={() => handleMediaClick(item)}
          >
            <CardMedia
              component="img"
              image={`${import.meta.env.VITE_BACKEND_URL || "http://localhost:8080"}/api/media/${item.id}`}
              alt={item.filename}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              onError={handleImageError}
            />
          </Card>
        ))}
      </Box>

      {/* Media Viewer Modal */}
      {selectedMedia && (
        <MediaViewer
          media={selectedMedia}
          open={viewerOpen}
          onClose={handleViewerClose}
        />
      )}
    </>
  );
};

export default MediaGrid;