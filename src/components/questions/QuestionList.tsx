import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Stack,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import QuestionItem from "./QuestionItem";
import AddQuestionForm from "./AddQuestionForm";
import questionService from "../../services/question.service";
import type { Question } from "../../services/question.service";
import { useAuth } from "../../hooks/useAuth";

interface QuestionListProps {
  placeId: string;
  refreshTrigger?: number;
}

const QuestionList: React.FC<QuestionListProps> = ({ placeId, refreshTrigger }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const auth = useAuth();

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await questionService.getQuestionsByPlace(placeId);
      if (response.success && response.data) {
        setQuestions(response.data);
      } else {
        setError(response.message || "Error al cargar las preguntas");
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
      setError("Error al cargar las preguntas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [placeId, refreshTrigger]);

  const handleQuestionCreated = () => {
    setShowAddForm(false);
    fetchQuestions();
  };

  const handleVoteUpdate = (questionId: string, newVoteCount: number, userVote: 'up' | null) => {
    setQuestions(prevQuestions =>
      prevQuestions.map(q =>
        q.id === questionId
          ? { ...q, voteCount: newVoteCount, userVote }
          : q
      )
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 2,
        flexDirection: { xs: "column", sm: "row" },
        gap: { xs: 1, sm: 0 }
      }}>
        <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: "1.125rem", md: "1.25rem" } }}>
          Preguntas y Respuestas
        </Typography>
        {auth.isAuthenticated && (
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setShowAddForm(!showAddForm)}
            size="small"
            fullWidth
          >
            {showAddForm ? "Cancelar" : "Hacer Pregunta"}
          </Button>
        )}
      </Box>

      {showAddForm && (
        <Box sx={{ mb: 3 }}>
          <AddQuestionForm
            placeId={placeId}
            onQuestionCreated={handleQuestionCreated}
            onCancel={() => setShowAddForm(false)}
          />
        </Box>
      )}

      {questions.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No hay preguntas aún.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            ¡Sé el primero en hacer una pregunta sobre este lugar!
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {questions.map((question) => (
            <QuestionItem
              key={question.id}
              question={question}
              onVoteUpdate={handleVoteUpdate}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default QuestionList;