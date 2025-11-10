import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Stack,
} from "@mui/material";
import AnswerItem from "./AnswerItem";
import questionService, { type Answer } from "../../services/question.service";

interface AnswerListProps {
  questionId: string;
  refreshTrigger?: number;
}

const AnswerList: React.FC<AnswerListProps> = ({ questionId, refreshTrigger }) => {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnswers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await questionService.getAnswersByQuestion(questionId);
      if (response.success && response.data) {
        setAnswers(response.data);
      } else {
        setError(response.message || "Error al cargar las respuestas");
      }
    } catch (err) {
      console.error("Error fetching answers:", err);
      setError("Error al cargar las respuestas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnswers();
  }, [questionId, refreshTrigger]);

  const handleVoteUpdate = (answerId: string, newVoteCount: number, userVote: 'up' | null) => {
    setAnswers(prevAnswers =>
      prevAnswers.map(a =>
        a.id === answerId
          ? { ...a, voteCount: newVoteCount, userVote }
          : a
      )
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
        <CircularProgress size={20} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 1 }}>
        {error}
      </Alert>
    );
  }

  if (answers.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 2 }}>
        <Typography variant="body2" color="text.secondary">
          No hay respuestas aún. ¡Sé el primero en responder!
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        {answers.length} {answers.length === 1 ? 'respuesta' : 'respuestas'}
      </Typography>
      <Stack spacing={1.5}>
        {answers.map((answer) => (
          <AnswerItem
            key={answer.id}
            answer={answer}
            onVoteUpdate={handleVoteUpdate}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default AnswerList;