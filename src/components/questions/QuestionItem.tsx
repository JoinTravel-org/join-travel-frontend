import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  IconButton,
  Collapse,
  CircularProgress,
  Alert,
} from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import questionService, { type Question } from "../../services/question.service";
import AnswerList from "./AnswerList";
import AddAnswerForm from "./AddAnswerForm";
import { useAuth } from "../../hooks/useAuth";
import UserAvatar from "../common/UserAvatar";
// import { formatDistanceToNow } from "date-fns";
// import { es } from "date-fns/locale";

interface QuestionItemProps {
  question: Question;
  onVoteUpdate: (questionId: string, newVoteCount: number, userVote: 'up' | null) => void;
}

const QuestionItem: React.FC<QuestionItemProps> = ({ question, onVoteUpdate }) => {
  const [expanded, setExpanded] = useState(false);
  const [showAddAnswer, setShowAddAnswer] = useState(false);
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
      const response = await questionService.voteQuestion(question.id);
      if (response.success && response.data) {
        onVoteUpdate(question.id, response.data.voteCount, response.data.userVote);
      } else {
        setVoteError(response.message || "Error al votar");
      }
    } catch (error) {
      console.error("Error voting on question:", error);
      setVoteError("Error al votar");
    } finally {
      setVoting(false);
    }
  };

  const handleAnswerCreated = () => {
    setShowAddAnswer(false);
    setExpanded(true); // Expand to show the new answer
    // Force refresh of answers by updating the key
    setExpanded(false);
    setTimeout(() => setExpanded(true), 10);
  };

  // Simple fallback for time formatting without date-fns
  const timeAgo = (() => {
    const now = new Date();
    const created = new Date(question.createdAt);
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
        borderRadius: 2,
        p: { xs: 1.5, md: 2 },
        bgcolor: "background.paper",
        overflow: "hidden",
        wordWrap: "break-word",
      }}
    >
      {/* Question Header */}
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: { xs: 1.5, md: 2 }, mb: 1 }}>
        <UserAvatar
          user={{
            name: question.userName,
            email: question.userEmail,
            profilePicture: question.userProfilePicture,
          }}
          size={32}
          sx={{ width: { xs: 28, md: 32 }, height: { xs: 28, md: 32 } }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body1"
            fontWeight={500}
            sx={{
              fontSize: { xs: "0.875rem", md: "1rem" },
              wordBreak: "break-word",
              hyphens: "auto",
            }}
          >
            {question.content}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontSize: { xs: "0.75rem", md: "0.875rem" },
              wordBreak: "break-word",
            }}
          >
            {question.userEmail} • {timeAgo}
          </Typography>
        </Box>
      </Box>

      {/* Vote and Actions */}
      <Box sx={{
        display: "flex",
        alignItems: { xs: "flex-start", sm: "center" },
        justifyContent: "space-between",
        mt: 2,
        flexDirection: { xs: "column", sm: "row" },
        gap: { xs: 1, sm: 0 }
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            size="small"
            onClick={handleVote}
            disabled={voting || !auth.isAuthenticated}
            sx={{
              color: question.userVote === 'up' ? 'primary.main' : 'text.secondary',
              '&:hover': {
                color: 'primary.main',
              },
            }}
          >
            {voting ? (
              <CircularProgress size={16} />
            ) : question.userVote === 'up' ? (
              <ThumbUpIcon fontSize="small" />
            ) : (
              <ThumbUpOutlinedIcon fontSize="small" />
            )}
          </IconButton>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.875rem", md: "1rem" } }}>
            {question.voteCount} {question.voteCount === 1 ? 'voto' : 'votos'}
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={1}
          sx={{
            width: { xs: "100%", sm: "auto" },
            justifyContent: { xs: "space-between", sm: "flex-end" }
          }}
        >
          {auth.isAuthenticated && (
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setShowAddAnswer(!showAddAnswer)}
              variant="text"
              sx={{ fontSize: { xs: "0.75rem", md: "0.875rem" } }}
            >
              Responder
            </Button>
          )}
          <Button
            size="small"
            endIcon={
              <ExpandMoreIcon
                sx={{
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                }}
              />
            }
            onClick={() => setExpanded(!expanded)}
            variant="text"
            sx={{ fontSize: { xs: "0.75rem", md: "0.875rem" } }}
          >
            Ver respuestas
          </Button>
        </Stack>
      </Box>

      {/* Vote Error */}
      {voteError && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {voteError}
        </Alert>
      )}

      {/* Add Answer Form */}
      {showAddAnswer && (
        <Box sx={{ mt: 2 }}>
          <AddAnswerForm
            questionId={question.id}
            onAnswerCreated={handleAnswerCreated}
            onCancel={() => setShowAddAnswer(false)}
          />
        </Box>
      )}

      {/* Answers Section */}
      <Collapse in={expanded}>
        <Box sx={{ mt: 2 }}>
          <AnswerList questionId={question.id} refreshTrigger={Date.now()} />
        </Box>
      </Collapse>
    </Box>
  );
};

export default QuestionItem;