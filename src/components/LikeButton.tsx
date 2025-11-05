import React, { useState, useEffect } from 'react';
import { IconButton, Typography, Box, Alert } from '@mui/material';
import { Favorite, FavoriteBorder, HeartBroken } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import reviewService from '../services/review.service';

interface LikeButtonProps {
  reviewId: string;
  initialLikeCount?: number;
  initialDislikeCount?: number;
  onReactionChange?: (reactionType: 'like' | 'dislike' | null, likeCount: number, dislikeCount: number) => void;
}

const LikeButton: React.FC<LikeButtonProps> = ({
  reviewId,
  initialLikeCount = 0,
  initialDislikeCount = 0,
  onReactionChange
}) => {
  const { isAuthenticated } = useAuth();
  const [reactionType, setReactionType] = useState<'like' | 'dislike' | null>(null);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [dislikeCount, setDislikeCount] = useState(initialDislikeCount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load initial reaction status when component mounts
    if (isAuthenticated) {
      loadReactionStatus();
    }
  }, [reviewId, isAuthenticated]);

  const loadReactionStatus = async () => {
    try {
      const status = await reviewService.getReactionStatus(reviewId);
      setReactionType(status.reactionType);
      setLikeCount(status.likeCount);
      setDislikeCount(status.dislikeCount);
    } catch (error) {
      console.error('Error loading reaction status:', error);
    }
  };

  const handleReactionToggle = async (type: 'like' | 'dislike') => {
    if (!isAuthenticated) {
      setError('Debe iniciar sesión para calificar.');
      return;
    }

    setLoading(true);
    setError(null);

    // Store previous state for rollback
    const previousReactionType = reactionType;
    const previousLikeCount = likeCount;
    const previousDislikeCount = dislikeCount;

    // Optimistically update UI
    if (previousReactionType === type) {
      // Remove reaction
      setReactionType(null);
      if (type === 'like') {
        setLikeCount(prev => prev - 1);
      } else {
        setDislikeCount(prev => prev - 1);
      }
    } else if (previousReactionType === null) {
      // Add new reaction
      setReactionType(type);
      if (type === 'like') {
        setLikeCount(prev => prev + 1);
      } else {
        setDislikeCount(prev => prev + 1);
      }
    } else {
      // Change reaction type
      setReactionType(type);
      if (type === 'like') {
        setLikeCount(prev => prev + 1);
        setDislikeCount(prev => prev - 1);
      } else {
        setDislikeCount(prev => prev + 1);
        setLikeCount(prev => prev - 1);
      }
    }

    try {
      const result = await reviewService.toggleReaction(reviewId, type);
      setReactionType(result.reactionType);
      setLikeCount(result.likeCount);
      setDislikeCount(result.dislikeCount);
      onReactionChange?.(result.reactionType, result.likeCount, result.dislikeCount);

      // Update points for reaction action and handle badge notifications
      try {
        // Disabled because action reaction does not exist
        // await updatePoints('reaction');
      } catch (pointsError) {
        console.error('Error updating points for reaction:', pointsError);
        // Don't show error to user for points update failure
      }
    } catch (error: any) {
      console.error('Error toggling reaction:', error);
      // Rollback optimistic update
      setReactionType(previousReactionType);
      setLikeCount(previousLikeCount);
      setDislikeCount(previousDislikeCount);

      // Show user-friendly error message
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.message === 'Network Error') {
        setError('No se pudo enviar voto.');
      } else {
        setError('Error al procesar la reacción. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
      <Box display="flex" alignItems="center" gap={1}>
        {/* Like Button */}
        <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
          <IconButton
            onClick={() => handleReactionToggle('like')}
            disabled={loading || !isAuthenticated}
            size="small"
            sx={{
              color: reactionType === 'like' ? 'error.main' : 'text.secondary',
              '&:hover': {
                color: reactionType === 'like' ? 'error.dark' : 'error.main',
              },
              transition: 'color 0.2s ease',
            }}
            aria-label={reactionType === 'like' ? 'Quitar like' : 'Dar like'}
          >
            {reactionType === 'like' ? <Favorite fontSize="small" /> : <FavoriteBorder fontSize="small" />}
          </IconButton>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ minWidth: '20px', textAlign: 'center', fontSize: '0.7rem' }}
          >
            {likeCount}
          </Typography>
        </Box>

        {/* Dislike Button */}
        <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
          <IconButton
            onClick={() => handleReactionToggle('dislike')}
            disabled={loading || !isAuthenticated}
            size="small"
            sx={{
              color: reactionType === 'dislike' ? 'primary.main' : 'text.secondary',
              '&:hover': {
                color: reactionType === 'dislike' ? 'primary.dark' : 'primary.main',
              },
              transition: 'color 0.2s ease',
            }}
            aria-label={reactionType === 'dislike' ? 'Quitar dislike' : 'Dar dislike'}
          >
            <HeartBroken fontSize="small" />
          </IconButton>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ minWidth: '20px', textAlign: 'center', fontSize: '0.7rem' }}
          >
            {dislikeCount}
          </Typography>
        </Box>
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