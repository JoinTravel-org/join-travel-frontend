import React, { useState } from 'react';
import { Box, Skeleton, IconButton } from '@mui/material';
import { Image as ImageIcon, BrokenImage as BrokenImageIcon } from '@mui/icons-material';

interface ImagePreviewProps {
  src: string | null;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  onError?: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  src,
  alt,
  width = 300,
  height = 200,
  className,
  onError
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoaded(true);
    setImageError(true);
    onError?.();
  };

  // If no image source, show placeholder
  if (!src) {
    return (
      <Box
        sx={{
          width: '100%',
          height: height,
          maxWidth: width,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.100',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'grey.300',
        }}
        className={className}
        role="img"
        aria-label={`Sin imagen disponible para ${alt}`}
      >
        <ImageIcon sx={{ fontSize: 48, color: 'grey.400' }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: height,
        maxWidth: width,
        position: 'relative',
        borderRadius: 1,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'grey.300',
        backgroundImage: imageLoaded && !imageError ? `url(${src})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      className={className}
      role="img"
      aria-label={alt}
    >
      {/* Hidden img for loading detection */}
      <Box
        component="img"
        src={src}
        alt=""
        onLoad={handleImageLoad}
        onError={handleImageError}
        sx={{ display: 'none' }}
      />

      {/* Loading skeleton */}
      {!imageLoaded && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          sx={{ position: 'absolute', top: 0, left: 0 }}
        />
      )}

      {/* Error state */}
      {imageError && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'grey.100',
          }}
        >
          <BrokenImageIcon sx={{ fontSize: 48, color: 'grey.400' }} />
        </Box>
      )}
    </Box>
  );
};

export default ImagePreview;