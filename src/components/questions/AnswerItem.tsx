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
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

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

  const timeAgo = formatDistanceToNow(new Date(answer.createdAt), {
    addSuffix: true,
    locale: es,
  });

  return (
    <Box
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        p: 2,
        bgcolor: "background.default",
      }}
    >
      {/* Answer Header */}
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 1 }}>
        <Avatar sx={{ width: 28, height: 28 }}>
          {answer.userEmail?.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2">
            {answer.content}
          </Typography>
          <Typography variant="caption" color="text.secondary">
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
        <Typography variant="caption" color="text.secondary">
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