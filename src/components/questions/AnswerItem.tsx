import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  CircularProgress,
  Alert,
} from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import questionService, { type Answer } from "../../services/question.service";
import { useAuth } from "../../hooks/useAuth";
// Custom time formatting without date-fns dependency

interface AnswerItemProps {
  answer: Answer;
  onVoteUpdate: (answerId: string, newVoteCount: number, userVote: 'up' | null) => void;
}

const AnswerItem: React.FC<AnswerItemProps> = ({ answer, onVoteUpdate }) => {
  const [voting, setVoting] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);
  const auth = useAuth();

  const handleVote = async () => {
    if (!auth.isAuthenticated) {
      return;
    }

    setVoting(true);
    setVoteError(null);

    try {
      const response = await questionService.voteAnswer(answer.id);
      if (response.success && response.data) {
        onVoteUpdate(answer.id, response.data.voteCount, response.data.userVote);
      } else {
        setVoteError(response.message || "Error al votar");
      }
    } catch (error) {
      console.error("Error voting on answer:", error);
      setVoteError("Error al votar");
    } finally {
      setVoting(false);
    }
  };

  // Simple fallback for time formatting without date-fns
  const timeAgo = (() => {
    const now = new Date();
    const created = new Date(answer.createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'hoy';
    } else if (diffDays === 1) {
      return 'hace 1 día';
    } else if (diffDays < 7) {
      return `hace ${diffDays} días`;
    } else {
      return created.toLocaleDateString('es-ES');
    }
  })();

  return (
    <Box
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        p: { xs: 1.5, md: 2 },
        bgcolor: "background.default",
        overflow: "hidden",
        wordWrap: "break-word",
      }}
    >
      {/* Answer Header */}
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: { xs: 1.5, md: 2 }, mb: 1 }}>
        <Avatar sx={{ width: { xs: 24, md: 28 }, height: { xs: 24, md: 28 } }}>
          {answer.userEmail?.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{
              fontSize: { xs: "0.875rem", md: "1rem" },
              wordBreak: "break-word",
              hyphens: "auto",
            }}
          >
            {answer.content}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontSize: { xs: "0.75rem", md: "0.875rem" },
              wordBreak: "break-word",
            }}
          >
            {answer.userEmail} • {timeAgo}
          </Typography>
        </Box>
      </Box>

      {/* Vote Section */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton
          size="small"
          onClick={handleVote}
          disabled={voting || !auth.isAuthenticated}
          sx={{
            color: answer.userVote === 'up' ? 'primary.main' : 'text.secondary',
            '&:hover': {
              color: 'primary.main',
            },
          }}
        >
          {voting ? (
            <CircularProgress size={14} />
          ) : answer.userVote === 'up' ? (
            <ThumbUpIcon fontSize="small" />
          ) : (
            <ThumbUpOutlinedIcon fontSize="small" />
          )}
        </IconButton>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontSize: { xs: "0.75rem", md: "0.875rem" } }}
        >
          {answer.voteCount} {answer.voteCount === 1 ? 'voto' : 'votos'}
        </Typography>
      </Box>

      {/* Vote Error */}
      {voteError && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {voteError}
        </Alert>
      )}
    </Box>
  );
};

export default AnswerItem;