import React, { useEffect, useRef, useState } from "react";
import {
  TextField,
  Button,
  Paper,
  Typography,
  Box,
  Alert,
  Link,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Email, Lock, Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import authService from "../services/auth.service";
import { getErrorMessage } from "../utils/validators";
import { useAuth } from "../hooks/useAuth";

interface LoginProps {
  onSwitchToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToRegister }) => {
  const navigate = useNavigate();
  const auth = useAuth();

  // Document title for SEO/UX
  useEffect(() => {
    document.title = "Iniciar sesión — JoinTravel";
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Extra UX from feature branch: disable button until inputs present and inline alerts
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [messagePassword, setMessagePassword] = useState(false);
  const [messageEmail, setMessageEmail] = useState(false);
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      setMessageEmail(false);
      setMessagePassword(false);
      isFirstRun.current = false;
      return;
    }
    setMessageEmail(!email);
    setMessagePassword(!password);
    setButtonDisabled(!(email && password));
  }, [email, password]);

  const validateEmail = (value: string) => {
    const trimmed = value.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(trimmed);
  };

  const emailInvalid = touched.email && !validateEmail(email);
  const passwordInvalid = touched.password && !password.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Mark all as touched for validation on submit
    setTouched({ email: true, password: true });

    // Trim inputs before validation/submit
    const trimmedEmail = email.replace(
      /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,
      ""
    );
    const trimmedPassword = password.trim();
    setEmail(trimmedEmail);
    setPassword(trimmedPassword);

    if (!validateEmail(trimmedEmail)) {
      setError("Formato de correo inválido.");
      return;
    }

    if (!trimmedPassword) {
      setError("La contraseña es requerida.");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      if (response.success) {
        // Use user data if available, otherwise create basic user object
        const user = response.data?.user || {
          id: "temp-id",
          email: trimmedEmail,
          isEmailConfirmed: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        auth.login(
          user,
          response.data!.accessToken,
          response.data!.refreshToken
        );

        navigate("/");
      } else {
        setError(
          response.message || "Error al iniciar sesión. Inténtalo nuevamente."
        );
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      // Provide more specific error messages for login
      if (errorMessage.includes("Error de conexión") || errorMessage.includes("Error interno")) {
        setError("Error al iniciar sesión. Verifica tu conexión a internet e intenta nuevamente.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 420,
          mx: "auto",
          mt: 8,
          backgroundColor: "var(--color-surface)",
          color: "var(--color-text)",
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          align="center"
          sx={{ fontWeight: 700 }}
        >
          Iniciar sesión
        </Typography>

        {/* Live region for form status messages */}
        <Box aria-live="polite" aria-atomic="true">
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} role="alert">
              {error}
            </Alert>
          )}
        </Box>

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Correo electrónico"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            error={emailInvalid}
            helperText={emailInvalid ? "Ingresa un correo válido." : " "}
            aria-invalid={emailInvalid ? "true" : "false"}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email sx={{ color: "action.active" }} aria-hidden />
                </InputAdornment>
              ),
            }}
          />
          {messageEmail && (
            <Alert severity="error" sx={{ mb: 2 }}>
              El correo electrónico es requerido.
            </Alert>
          )}

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            error={passwordInvalid}
            helperText={passwordInvalid ? "La contraseña es requerida." : " "}
            aria-invalid={passwordInvalid ? "true" : "false"}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: "action.active" }} aria-hidden />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    onClick={() => setShowPassword((s) => !s)}
                    onMouseDown={(e) => e.preventDefault()}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {messagePassword && (
            <Alert severity="error" sx={{ mb: 2 }}>
              La contraseña es requerida.
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 1.5, mb: 2 }}
            disabled={buttonDisabled || loading}
            aria-busy={loading ? "true" : "false"}
          >
            {loading ? "Iniciando sesión…" : "Iniciar sesión"}
          </Button>
        </Box>

        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Typography variant="body2">
            ¿No tienes cuenta?{" "}
            <Link
              component="button"
              variant="body2"
              onClick={onSwitchToRegister}
              sx={{
                cursor: "pointer",
                color: "var(--color-link)",
                "&:hover": { color: "var(--color-link-hover)" },
              }}
            >
              Regístrate aquí
            </Link>
          </Typography>
        </Box>
      </Paper>
    </>
  );
};

export default Login;
