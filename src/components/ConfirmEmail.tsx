import React, { useEffect, useState, useRef } from "react";
import {
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import { CheckCircle, Error as ErrorIcon } from "@mui/icons-material";
import { useSearchParams, useNavigate } from "react-router-dom";
import authService from "../services/auth.service";
import { getErrorMessage } from "../utils/validators";

/**
 * Estados posibles del proceso de confirmación
 */
type ConfirmationStatus = "loading" | "success" | "error";

const ConfirmEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<ConfirmationStatus>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    document.title =
      status === 'loading'
        ? 'Confirmando email — JoinTravel'
        : status === 'success'
          ? 'Email confirmado — JoinTravel'
          : 'Error de confirmación — JoinTravel';
  }, [status]);

  const hasRunRef = useRef(false);

  useEffect(() => {
    const confirmEmail = async () => {
      const token = searchParams.get("token");

      // Validar que existe el token
      if (!token) {
        setStatus("error");
        setMessage("No se proporcionó un token de confirmación válido.");
        return;
      }

      try {
        // Llamar al servicio de confirmación
        const response = await authService.confirmEmail(token);

        setStatus("success");
        setMessage(response.message || "Email confirmado exitosamente.");

        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } catch (err) {
        setStatus("error");
        setMessage(getErrorMessage(err));
      }
    };

    // Prevent the effect from running twice in Strict Mode or repeated re-triggers
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    confirmEmail();
  }, [searchParams, navigate]);

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <Paper
      elevation={3}
      sx={{ p: 4, maxWidth: 500, mx: "auto", mt: 8, textAlign: "center" }}
    >
      {status === "loading" && (
        <Box role="status" aria-live="polite">
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h5" gutterBottom>
            Confirmando tu email...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Por favor espera un momento
          </Typography>
        </Box>
      )}

      {status === "success" && (
        <Box aria-live="polite" aria-atomic="true">
          <CheckCircle color="success" sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h4" gutterBottom color="success.main">
            ¡Email confirmado!
          </Typography>
          <Alert severity="success" sx={{ mt: 2, mb: 3, textAlign: "left" }}>
            {message}
          </Alert>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Serás redirigido al inicio en unos segundos...
          </Typography>
          <Button variant="contained" onClick={handleGoHome} fullWidth>
            Ir al inicio ahora
          </Button>
        </Box>
      )}

      {status === "error" && (
        <Box aria-live="polite" aria-atomic="true">
          <ErrorIcon color="error" sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h4" gutterBottom color="error.main">
            Error en la confirmación
          </Typography>
          <Alert severity="error" sx={{ mt: 2, mb: 3, textAlign: "left" }}>
            {message}
          </Alert>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Posibles causas:
            <br />
            • El token ha expirado (válido por 24 horas)
            <br />
            • El token ya fue utilizado
            <br />• El enlace está incorrecto
          </Typography>
          <Button variant="contained" onClick={handleGoHome} fullWidth>
            Volver al inicio
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default ConfirmEmail;
