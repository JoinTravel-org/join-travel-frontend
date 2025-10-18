import React, { useState } from 'react';
import {
  TextField,
  Button,
  Paper,
  Typography,
  Box,
  Alert,
  Link,
} from '@mui/material';
import { Email, Lock } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface LoginProps {
  onSwitchToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToRegister }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('Formato de correo inválido.');
      return;
    }

    if (!password) {
      setError('La contraseña es requerida.');
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For demo purposes, accept any email/password combination
      console.log('Login attempt:', { email, password });
      // Simulate successful login and redirect to home
      navigate('/');

    } catch {
      setError('Error al iniciar sesión. Inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Iniciar Sesión
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          InputProps={{
            startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />,
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
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            startAdornment: <Lock sx={{ mr: 1, color: 'action.active' }} />,
          }}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={loading}
        >
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </Button>
      </Box>

      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Typography variant="body2">
          ¿No tienes cuenta?{' '}
          <Link
            component="button"
            variant="body2"
            onClick={onSwitchToRegister}
            sx={{ cursor: 'pointer' }}
          >
            Regístrate aquí
          </Link>
        </Typography>
      </Box>
    </Paper>
  );
};

export default Login;