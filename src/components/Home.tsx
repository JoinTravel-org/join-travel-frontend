import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Paper,
  Card,
  CardContent,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  FlightTakeoff,
  Explore,
  Group,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const features = [
    {
      icon: <FlightTakeoff sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Viajes Personalizados',
      description: 'Descubre destinos únicos adaptados a tus preferencias y presupuesto.',
    },
    {
      icon: <Explore sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Explora el Mundo',
      description: 'Accede a guías detalladas y recomendaciones de expertos locales.',
    },
    {
      icon: <Group sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Conecta con Viajeros',
      description: 'Únete a una comunidad de aventureros y comparte experiencias.',
    },
  ];

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
      {/* Navbar */}
      <AppBar position="static" color="primary">
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <img
              src="/logo.png"
              alt="JoinTravel Logo"
              style={{ height: '40px', marginRight: '12px' }}
            />
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              JoinTravel
            </Typography>
          </Box>

          {isMobile ? (
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button color="inherit" component={Link} to="/">
                Inicio
              </Button>
              <Button color="inherit" component={Link} to="/login">
                Iniciar Sesión
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Registrarse
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Descubre el Mundo con JoinTravel
          </Typography>
          <Typography variant="h5" component="p" sx={{ mb: 4, color: 'text.secondary' }}>
            Conecta con viajeros, planifica aventuras únicas y crea recuerdos inolvidables.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{ minWidth: 150 }}
            >
              Únete Ahora
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/login')}
              sx={{ minWidth: 150 }}
            >
              Iniciar Sesión
            </Button>
          </Box>
        </Box>

        {/* Features Section */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
          {features.map((feature, index) => (
            <Box key={index} sx={{ flex: '1 1 300px', maxWidth: '400px' }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>

        {/* Call to Action */}
        <Paper
          elevation={3}
          sx={{
            mt: 8,
            p: 4,
            textAlign: 'center',
            backgroundColor: theme.palette.secondary.main,
            color: 'white'
          }}
        >
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            ¿Listo para tu próxima aventura?
          </Typography>
          <Typography variant="h6" component="p" sx={{ mb: 3 }}>
            Únete a miles de viajeros que ya están explorando el mundo con JoinTravel.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/register')}
            sx={{
              backgroundColor: 'white',
              color: theme.palette.secondary.main,
              '&:hover': {
                backgroundColor: theme.palette.background.default,
              }
            }}
          >
            Comenzar mi viaje
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default Home;