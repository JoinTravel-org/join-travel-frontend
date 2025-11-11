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

interface AddAnswerFormProps {
  questionId: string;
  onAnswerCreated: () => void;
  onCancel: () => void;
}

const AddAnswerForm: React.FC<AddAnswerFormProps> = ({
  questionId,
  onAnswerCreated,
  onCancel,
}) => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError("La respuesta no puede estar vacía");
      return;
    }

    if (content.length < 10) {
      setError("La respuesta debe tener al menos 10 caracteres");
      return;
    }

    if (content.length > 1000) {
      setError("La respuesta no puede tener más de 1000 caracteres");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await questionService.createAnswer({
        questionId,
        content: content.trim(),
      });

      if (response.success) {
        setContent("");
        onAnswerCreated();
      } else {
        setError(response.message || "Error al crear la respuesta");
      }
    } catch (err) {
      console.error("Error creating answer:", err);
      setError("Error al crear la respuesta");
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
        borderRadius: 1,
        p: 2,
        bgcolor: "background.default",
        mt: 1,
      }}
    >
      <TextField
        fullWidth
        multiline
        minRows={2}
        maxRows={4}
        placeholder="Escribe tu respuesta..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={loading}
        helperText={`${content.length}/1000 caracteres`}
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
          size="small"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          size="small"
          disabled={loading || !content.trim()}
          startIcon={loading ? <CircularProgress size={14} /> : undefined}
        >
          {loading ? "Publicando..." : "Publicar Respuesta"}
        </Button>
      </Stack>
    </Box>
  );
};

export default AddAnswerForm;