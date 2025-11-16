import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Alert,
  CircularProgress,
  Link as MuiLink,
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import authService from "../../services/auth.service";

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Criterio 3: Validar formato de email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setError(null);
    
    // Validar formato mientras el usuario escribe
    if (newEmail && !validateEmail(newEmail)) {
      setEmailError("Formato de correo inválido");
    } else {
      setEmailError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Criterio 3: Bloquear envío si el formato no es válido
    if (!validateEmail(email)) {
      setEmailError("Formato de correo inválido");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Criterio 1: Enviar link de recuperación
      const response = await authService.forgotPassword(email);
      
      if (response.success) {
        setSuccess(true);
        setEmail(""); // Limpiar el campo
      }
    } catch (err: unknown) {
      // Criterio 2: Mostrar mensaje específico si no existe el correo
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al enviar el correo de recuperación");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 4,
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: "100%" }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Recuperar Contraseña
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }} align="center">
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
          </Typography>

          {success ? (
            <Box>
              <Alert severity="success" sx={{ mb: 2 }}>
                Se ha enviado un enlace de recuperación a tu correo electrónico. 
                Por favor revisa tu bandeja de entrada y sigue las instrucciones.
                <br />
                <strong>El enlace expirará en 24 horas.</strong>
              </Alert>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate("/login")}
                sx={{ mt: 2 }}
              >
                Volver al inicio de sesión
              </Button>
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <TextField
                fullWidth
                label="Correo Electrónico"
                type="email"
                value={email}
                onChange={handleEmailChange}
                margin="normal"
                required
                autoFocus
                disabled={loading}
                error={!!emailError}
                helperText={emailError}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading || !!emailError || !email}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Enviar link de recuperación"
                )}
              </Button>

              <Box sx={{ textAlign: "center", mt: 2 }}>
                <Typography variant="body2">
                  ¿Recordaste tu contraseña?{" "}
                  <MuiLink component={Link} to="/login" underline="hover">
                    Iniciar sesión
                  </MuiLink>
                </Typography>
              </Box>
            </form>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPassword;
