import React, { useState } from 'react';
import {
  Box,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Chip,
} from '@mui/material';
import { PlayArrow, InsertDriveFile } from '@mui/icons-material';
import MediaViewer from './MediaViewer';
import type { ReviewMedia } from '../types/review';

interface MediaGridProps {
  media: ReviewMedia[];
}

const MediaGrid: React.FC<MediaGridProps> = ({ media }) => {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<ReviewMedia | null>(null);

  const handleMediaClick = (item: ReviewMedia) => {
    setSelectedMedia(item);
    setViewerOpen(true);
  };

  const handleViewerClose = () => {
    setViewerOpen(false);
    setSelectedMedia(null);
  };

  const getFileTypeIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return null; // Images show thumbnail
    } else if (mimeType.startsWith('video/')) {
      return <PlayArrow sx={{ color: 'white', fontSize: 40 }} />;
    } else {
      return <InsertDriveFile sx={{ color: 'white', fontSize: 40 }} />;
    }
  };

  const getFileTypeLabel = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'Imagen';
    if (mimeType.startsWith('video/')) return 'Video';
    return 'Archivo';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      <ImageList
        sx={{
          width: '100%',
          height: 'auto',
          gridTemplateColumns: {
            xs: 'repeat(auto-fill, minmax(120px, 1fr))!important',
            sm: 'repeat(auto-fill, minmax(150px, 1fr))!important',
          },
          gap: '8px!important',
        }}
        cols={0}
        rowHeight={120}
      >
        {media.map((item) => (
          <ImageListItem
            key={item.id}
            sx={{
              cursor: 'pointer',
              borderRadius: 1,
              overflow: 'hidden',
              '&:hover': {
                opacity: 0.8,
              },
            }}
            onClick={() => handleMediaClick(item)}
          >
            {item.mimeType.startsWith('image/') ? (
              <img
                src={item.url}
                alt={item.filename}
                loading="lazy"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  bgcolor: 'grey.300',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {getFileTypeIcon(item.mimeType)}
              </Box>
            )}
            <ImageListItemBar
              title={item.filename}
              subtitle={
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  <Chip
                    label={getFileTypeLabel(item.mimeType)}
                    size="small"
                    sx={{ height: 16, fontSize: '0.6rem' }}
                  />
                  <Chip
                    label={formatFileSize(item.fileSize)}
                    size="small"
                    variant="outlined"
                    sx={{ height: 16, fontSize: '0.6rem' }}
                  />
                </Box>
              }
              sx={{
                '& .MuiImageListItemBar-title': {
                  fontSize: '0.75rem',
                  lineHeight: 1.2,
                },
                '& .MuiImageListItemBar-subtitle': {
                  fontSize: '0.6rem',
                },
              }}
            />
          </ImageListItem>
        ))}
      </ImageList>

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