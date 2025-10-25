import React, { useEffect, useState } from "react";
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
  InputAdornment,
  IconButton,
  List,
  ListItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Email, Lock, Visibility, VisibilityOff } from "@mui/icons-material";
import authService from "../services/auth.service";
import {
  isValidEmail,
  validatePassword,
  getErrorMessage,
} from "../utils/validators";

interface RegisterProps {
  onSwitchToLogin: () => void;
}

type PasswordValidation = {
  isValid: boolean;
  errors: string[];
};

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
  // Document title for SEO/UX
  useEffect(() => {
    document.title = "Crear cuenta — JoinTravel";
  }, []);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });

  const [touched, setTouched] = useState({
    email: false,
    password: false,
    confirmPassword: false,
    termsAccepted: false,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordValidation, setPasswordValidation] =
    useState<PasswordValidation>({
      isValid: false,
      errors: [],
    });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);

  const setField =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        field === "termsAccepted"
          ? (e.target as HTMLInputElement).checked
          : e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value as never }));

      if (field === "password") {
        const validation = validatePassword(value as string);
        setPasswordValidation(validation);
      }
    };

  const onBlur = (field: keyof typeof touched) => () =>
    setTouched((t) => ({ ...t, [field]: true }));

  const emailInvalid = touched.email && !isValidEmail(formData.email);
  const passwordInvalid =
    touched.password && !validatePassword(formData.password).isValid;
  const confirmInvalid =
    touched.confirmPassword && formData.confirmPassword !== formData.password;
  const termsInvalid = touched.termsAccepted && !formData.termsAccepted;

  const canSubmit =
    isValidEmail(formData.email) &&
    validatePassword(formData.password).isValid &&
    formData.confirmPassword === formData.password &&
    formData.termsAccepted &&
    !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Mark all fields as touched on submit
    setTouched({
      email: true,
      password: true,
      confirmPassword: true,
      termsAccepted: true,
    });

    if (!isValidEmail(formData.email)) {
      setError("Formato de correo inválido.");
      return;
    }

    const pwdValidation = validatePassword(formData.password);
    if (!pwdValidation.isValid) {
      setError("La contraseña no cumple con los requisitos.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (!formData.termsAccepted) {
      setError("Debes aceptar los términos y condiciones.");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register({
        email: formData.email,
        password: formData.password,
      });

      setSuccess(
        response.message ||
          "Usuario registrado exitosamente. Revisa tu correo para confirmar tu cuenta."
      );

      // Reset form
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        termsAccepted: false,
      });
      setPasswordValidation({ isValid: false, errors: [] });
      setTouched({
        email: false,
        password: false,
        confirmPassword: false,
        termsAccepted: false,
      });
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        maxWidth: 480,
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
        Crear cuenta
      </Typography>

      {/* Live region for form status messages */}
      <Box aria-live="polite" aria-atomic="true">
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} role="alert">
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} role="status">
            {success}
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
          value={formData.email}
          onChange={setField("email")}
          onBlur={onBlur("email")}
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

        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Contraseña"
          type={showPassword ? "text" : "password"}
          id="password"
          autoComplete="new-password"
          value={formData.password}
          onChange={setField("password")}
          onBlur={onBlur("password")}
          error={passwordInvalid}
          aria-invalid={passwordInvalid ? "true" : "false"}
          helperText={
            touched.password && passwordValidation.errors.length > 0 ? (
              <Box component="span">
                Faltan:
                <List dense sx={{ pl: 2, listStyleType: "disc" }}>
                  {passwordValidation.errors.map((it, idx) => (
                    <ListItem
                      key={idx}
                      sx={{
                        display: "list-item",
                        py: 0,
                        color: "text.secondary",
                      }}
                    >
                      {it}
                    </ListItem>
                  ))}
                </List>
              </Box>
            ) : (
              "Mínimo 8 caracteres, una mayúscula, un número y un símbolo."
            )
          }
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

        <TextField
          margin="normal"
          required
          fullWidth
          name="confirmPassword"
          label="Confirmar contraseña"
          type={showConfirm ? "text" : "password"}
          id="confirmPassword"
          autoComplete="new-password"
          value={formData.confirmPassword}
          onChange={setField("confirmPassword")}
          onBlur={onBlur("confirmPassword")}
          error={confirmInvalid}
          helperText={confirmInvalid ? "Las contraseñas deben coincidir." : " "}
          aria-invalid={confirmInvalid ? "true" : "false"}
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
                    showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  onClick={() => setShowConfirm((s) => !s)}
                  onMouseDown={(e) => e.preventDefault()}
                  edge="end"
                >
                  {showConfirm ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <FormControlLabel
          control={
            <Checkbox
              color="primary"
              checked={formData.termsAccepted}
              onChange={setField("termsAccepted")}
              onBlur={onBlur("termsAccepted")}
              inputProps={{ "aria-invalid": termsInvalid ? "true" : "false" }}
              required
            />
          }
          sx={{ mt: 1 }}
          label={
            <Typography variant="body2">
              Acepto los{" "}
              <Link
                component="button"
                onClick={() => setTermsDialogOpen(true)}
                underline="hover"
                sx={{
                  color: "var(--color-link)",
                  "&:hover": { color: "var(--color-link-hover)" },
                }}
              >
                términos y condiciones
              </Link>
            </Typography>
          }
        />
        {termsInvalid && (
          <Typography
            variant="caption"
            color="error"
            sx={{ display: "block", mt: 0.5 }}
            role="alert"
          >
            Debes aceptar los términos y condiciones.
          </Typography>
        )}

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={!canSubmit}
          aria-busy={loading ? "true" : "false"}
        >
          {loading ? "Registrando…" : "Crear cuenta"}
        </Button>
      </Box>

      <Box sx={{ textAlign: "center", mt: 2 }}>
        <Typography variant="body2">
          ¿Ya tienes cuenta?{" "}
          <Link
            component="button"
            variant="body2"
            onClick={onSwitchToLogin}
            sx={{
              cursor: "pointer",
              color: "var(--color-link)",
              "&:hover": { color: "var(--color-link-hover)" },
            }}
          >
            Inicia sesión aquí
          </Link>
        </Typography>
      </Box>

      <Dialog
        open={termsDialogOpen}
        onClose={() => setTermsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Términos y Condiciones</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Esta aplicación es una herramienta educativa desarrollada con fines
            de aprendizaje y demostración. Al registrarte, aceptas los
            siguientes términos:
          </Typography>
          <Typography variant="body1" component="div">
            <ul>
              <li>
                Esta aplicación está diseñada para uso productivo y educativo,
                con énfasis en entornos controlados y no críticos.
              </li>
              <li>
                Los datos proporcionados se utilizarán exclusivamente para el
                funcionamiento y mejora de esta aplicación, y sus derechos de
                propiedad intelectual sobre los mismos se mantendrán intactos,
                excepto en lo necesario para prestar el servicio.
              </li>
              <li>
                No ofrecemos garantías absolutas de seguridad, privacidad o
                disponibilidad continua, pero implementamos medidas razonables
                para proteger la información conforme a estándares de la
                industria.
              </li>
              <li>
                El uso de esta aplicación es bajo tu propio riesgo, aunque nos
                esforzamos por minimizarlo mediante prácticas seguras y
                actualizaciones regulares.
              </li>
              <li>
                Podemos modificar estos términos en cualquier momento,
                notificándote con antelación razonable a través de la aplicación
                o por correo electrónico.
              </li>
            </ul>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTermsDialogOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default Register;
