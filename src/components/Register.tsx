import React, { useState } from "react";
import {
  TextField,
  Button,
  Paper,
  Typography,
  Box,
  Alert,
  Link,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { Email, Lock } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import authService from "../services/auth.service";
import {
  isValidEmail,
  validatePassword,
  getErrorMessage,
} from "../utils/validators";

interface RegisterProps {
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const handleInputChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));

      if (field === "password") {
        const validation = validatePassword(value);
        setPasswordErrors(validation.errors);
      }
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validar formato de email
    if (!isValidEmail(formData.email)) {
      setError("Formato de correo inválido.");
      return;
    }

    // Validar requisitos de contraseña
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      setError("La contraseña no cumple con los requisitos.");
      return;
    }

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      // Llamar al servicio de autenticación real
      const response = await authService.register({
        email: formData.email,
        password: formData.password,
      });

      // Mostrar mensaje de éxito
      setSuccess(
        response.message ||
          "Usuario registrado exitosamente. Por favor revisa tu correo para confirmar tu cuenta."
      );

      // Limpiar formulario
      setFormData({ email: "", password: "", confirmPassword: "" });
      setPasswordErrors([]);

      // Redirigir al home después de 3 segundos para que el usuario vea el mensaje
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (err) {
      // Manejar errores de la API
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: "auto", mt: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Registrarse
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Correo electrónico"
          name="email"
          autoComplete="email"
          autoFocus
          value={formData.email}
          onChange={handleInputChange("email")}
          InputProps={{
            startAdornment: <Email sx={{ mr: 1, color: "action.active" }} />,
          }}
        />

        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Contraseña"
          type="password"
          id="password"
          autoComplete="new-password"
          value={formData.password}
          onChange={handleInputChange("password")}
          InputProps={{
            startAdornment: <Lock sx={{ mr: 1, color: "action.active" }} />,
          }}
          helperText={
            passwordErrors.length > 0
              ? `Faltan: ${passwordErrors.join(", ")}`
              : "Mínimo 8 caracteres, 1 mayúscula, 1 número, 1 símbolo"
          }
          error={passwordErrors.length > 0}
        />

        <TextField
          margin="normal"
          required
          fullWidth
          name="confirmPassword"
          label="Confirmar contraseña"
          type="password"
          id="confirmPassword"
          autoComplete="new-password"
          value={formData.confirmPassword}
          onChange={handleInputChange("confirmPassword")}
          InputProps={{
            startAdornment: <Lock sx={{ mr: 1, color: "action.active" }} />,
          }}
        />

        <FormControlLabel
          control={<Checkbox value="terms" color="primary" required />}
          label="Acepto los términos y condiciones"
          sx={{ mt: 1 }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={loading || passwordErrors.length > 0}
        >
          {loading ? "Registrando..." : "Registrar"}
        </Button>
      </Box>

      <Box sx={{ textAlign: "center", mt: 2 }}>
        <Typography variant="body2">
          ¿Ya tienes cuenta?{" "}
          <Link
            component="button"
            variant="body2"
            onClick={onSwitchToLogin}
            sx={{ cursor: "pointer" }}
          >
            Inicia sesión aquí
          </Link>
        </Typography>
      </Box>
    </Paper>
  );
};

export default Register;
