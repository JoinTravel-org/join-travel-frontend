import React, { useState, useEffect } from 'react';
import { IconButton, Typography, Box, Alert } from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import reviewService from '../services/review.service';
import { useUserStats } from '../hooks/useUserStats';

interface LikeButtonProps {
  reviewId: string;
  initialLikeCount?: number;
  onLikeChange?: (liked: boolean, likeCount: number) => void;
}

const LikeButton: React.FC<LikeButtonProps> = ({
  reviewId,
  initialLikeCount = 0,
  onLikeChange
}) => {
  const { isAuthenticated } = useAuth();
  const { updatePoints } = useUserStats();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load initial like status when component mounts
    if (isAuthenticated) {
      loadLikeStatus();
    }
  }, [reviewId, isAuthenticated]);

  const loadLikeStatus = async () => {
    try {
      const status = await reviewService.getLikeStatus(reviewId);
      setLiked(status.liked);
      setLikeCount(status.likeCount);
    } catch (error) {
      console.error('Error loading like status:', error);
    }
  };

  const handleLikeToggle = async () => {
    if (!isAuthenticated) {
      // Could show a login prompt here
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await reviewService.toggleLike(reviewId);
      setLiked(result.liked);
      setLikeCount(result.likeCount);
      onLikeChange?.(result.liked, result.likeCount);

      // Update points for like action and handle badge notifications
      try {
        // Disabled because action like does not exist
        // await updatePoints('like');
      } catch (pointsError) {
        console.error('Error updating points for like:', pointsError);
        // Don't show error to user for points update failure
      }
    } catch (error: any) {
      console.error('Error toggling like:', error);
      // Show user-friendly error message
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Error al procesar el like. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
      <Box display="flex" alignItems="center" gap={0.5}>
        <IconButton
          onClick={handleLikeToggle}
          disabled={loading || !isAuthenticated}
          size="small"
          sx={{
            color: liked ? 'error.main' : 'text.secondary',
            '&:hover': {
              color: liked ? 'error.dark' : 'error.main',
            },
            transition: 'color 0.2s ease',
          }}
          aria-label={liked ? 'Quitar like' : 'Dar like'}
        >
          {liked ? <Favorite fontSize="small" /> : <FavoriteBorder fontSize="small" />}
        </IconButton>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ minWidth: '20px', textAlign: 'center' }}
        >
          {likeCount}
        </Typography>
      </Box>
      {error && (
        <Alert severity="error" sx={{ fontSize: '0.75rem', padding: '2px 8px' }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default LikeButton;