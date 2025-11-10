import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Stack,
  Alert,
  CircularProgress,
} from "@mui/material";
import questionService from "../../services/question.service";

interface AddQuestionFormProps {
  placeId: string;
  onQuestionCreated: () => void;
  onCancel: () => void;
}

const AddQuestionForm: React.FC<AddQuestionFormProps> = ({
  placeId,
  onQuestionCreated,
  onCancel,
}) => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError("La pregunta no puede estar vacía");
      return;
    }

    if (content.length < 10) {
      setError("La pregunta debe tener al menos 10 caracteres");
      return;
    }

    if (content.length > 500) {
      setError("La pregunta no puede tener más de 500 caracteres");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await questionService.createQuestion({
        placeId,
        content: content.trim(),
      });

      if (response.success) {
        setContent("");
        onQuestionCreated();
      } else {
        setError(response.message || "Error al crear la pregunta");
      }
    } catch (err) {
      console.error("Error creating question:", err);
      setError("Error al crear la pregunta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        p: 2,
        bgcolor: "background.paper",
      }}
    >
      <TextField
        fullWidth
        multiline
        minRows={3}
        maxRows={6}
        placeholder="Escribe tu pregunta sobre este lugar..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={loading}
        helperText={`${content.length}/500 caracteres`}
        sx={{ mb: 2 }}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button
          type="button"
          variant="outlined"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading || !content.trim()}
          startIcon={loading ? <CircularProgress size={16} /> : undefined}
        >
          {loading ? "Publicando..." : "Publicar Pregunta"}
        </Button>
      </Stack>
    </Box>
  );
};

export default AddQuestionForm;