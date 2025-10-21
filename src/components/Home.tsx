import React, { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Container,
  Box,
  Paper,
  Card,
  CardContent,
  Stack,
  Rating,
  CircularProgress,
  Pagination,
} from '@mui/material';
import { useTheme } from '../hooks/useTheme';
import {
  Explore,
  Group,
  AddLocation,
  Star,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { trackEvent } from '../utils/analytics';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api.service';

/**
 * Home
 * - Semantic sections with a single H1
 * - Mobile-first responsive layout using CSS grid via sx
 * - Clear hierarchy, concise copy, strong primary CTA
 * - Accessible features list with list semantics
 */
interface Place {
  id: string;
  name: string;
  image?: string;
  rating: number;
}

const Home: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const auth = useAuth();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  React.useEffect(() => {
    document.title = 'JoinTravel — Explora el mundo, conecta y viaja mejor';
  }, []);

  const fetchPlaces = async (pageNum: number) => {
    try {
      const response = await api.getPlaces(pageNum, 20);
      const newPlaces = response.places || [];
      const totalCount = response.totalCount || 0;
      setPlaces(newPlaces);
      setTotalPages(Math.ceil(totalCount / 20));
    } catch (error) {
      console.error('Error fetching places:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces(1);
  }, []);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    // Scroll to top of places section with smooth animation
    setTimeout(() => {
      const placesSection = document.getElementById('places-section');
      if (placesSection) {
        placesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100); // Small delay to allow new content to render
  };

  useEffect(() => {
    fetchPlaces(page);
  }, [page]);

  const features = [
    {
      icon: <Star sx={{ fontSize: 40, color: 'var(--color-primary)' }} aria-hidden />,
      title: 'Reseñas y Comentarios',
      description: 'Lee opiniones de otros viajeros y comparte tus experiencias para guiar a la comunidad.',
    },
    {
      icon: <Explore sx={{ fontSize: 40, color: 'var(--color-primary)' }} aria-hidden />,
      title: 'Explora el Mundo',
      description: 'Accede a guías prácticas, mapas y recomendaciones de viajeros locales.',
    },
    {
      icon: <Group sx={{ fontSize: 40, color: 'var(--color-primary)' }} aria-hidden />,
      title: 'Conecta con Viajeros',
      description: 'Únete a una comunidad activa para compartir consejos y experiencias.',
    },
    {
      icon: <AddLocation sx={{ fontSize: 40, color: 'var(--color-primary)' }} aria-hidden />,
      title: 'Agrega Lugares',
      description: 'Enriquece nuestra base de datos agregando nuevos lugares desde Google Maps.',
      action: {
        text: 'Agregar Lugar',
        onClick: () => {
          if (auth.isAuthenticated) {
            navigate('/add-place');
          } else {
            navigate('/login');
          }
        },
      },
    },
  ];

  return (
    <Box component="div" sx={{ flexGrow: 1, backgroundColor: 'var(--color-bg)', containerType: 'inline-size' }}>
      {/* Hero Section */}
      <Box
        component="section"
        aria-labelledby="hero-title"
        sx={{
          py: { xs: 4, md: 6 },
          background:
            theme.palette.mode === 'light'
              ? 'linear-gradient(180deg, rgba(24,154,180,0.08) 0%, rgba(0,0,0,0) 60%)'
              : 'linear-gradient(180deg, rgba(24,154,180,0.15) 0%, rgba(0,0,0,0) 60%)',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              id="hero-title"
              variant="h1"
              component="h1"
              gutterBottom
              sx={{ fontWeight: 700, fontSize: 'var(--fs-h1)', lineHeight: 'var(--lh-tight)' }}
            >
              Explora el mundo con JoinTravel
            </Typography>
            <Typography
              variant="h5"
              component="p"
              sx={{ mb: 3, color: 'text.secondary' }}
            >
              Planifica aventuras únicas, conecta con viajeros como tú y crea recuerdos
              inolvidables con itinerarios fáciles y confiables.
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'center' }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={() => { trackEvent('cta_click', { cta: 'hero_primary', destination: '/register' }); navigate('/register'); }}
                aria-label="Crear cuenta para comenzar a viajar"
                sx={{ minWidth: 180 }}
              >
                Comenzar gratis
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Places Feed Section */}
      <Box
        id="places-section"
        component="section"
        aria-labelledby="places-title"
        sx={{ py: { xs: 5, md: 8 } }}
      >
        <Container maxWidth="lg">
          <Typography
            id="places-title"
            variant="h2"
            component="h2"
            gutterBottom
            sx={{ fontWeight: 700, fontSize: 'var(--fs-h2)' }}
          >
            Lugares Disponibles
          </Typography>

          <Box
            sx={{
              mt: 2,
              display: 'grid',
              gap: { xs: 3, md: 4 },
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
            }}
          >
            {places.map((place) => (
              <Card
                key={place.id}
                elevation={1}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 'var(--card-radius)',
                  boxShadow: 'var(--card-shadow)',
                  transition: 'transform var(--motion-duration-base) var(--motion-ease-standard), box-shadow var(--motion-duration-base) var(--motion-ease-standard)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 'var(--card-shadow-hover)',
                  },
                }}
              >
                <Box
                  sx={{
                    height: 200,
                    backgroundImage: `url(${place.image || '/placeholder-image.jpg'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundColor: 'var(--color-bg-secondary)',
                    borderRadius: 'var(--card-radius) var(--card-radius) 0 0',
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLDivElement;
                    target.style.backgroundImage = 'url(/placeholder-image.jpg)';
                  }}
                />
                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
                    {place.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Rating value={place.rating || 0} readOnly size="small" />
                    <Typography variant="body2" color="text.secondary">
                      ({typeof place.rating === 'number' ? place.rating.toFixed(1) : '0.0'})
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {!loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </Container>
      </Box>

      {/* Features Section */}
      <Box
        component="section"
        aria-labelledby="features-title"
        sx={{ py: { xs: 3, md: 5 } }}
      >
        <Container maxWidth="lg">
          <Typography
            id="features-title"
            variant="h2"
            component="h2"
            gutterBottom
            sx={{ fontWeight: 700, fontSize: 'var(--fs-h2)' }}
          >
            Todo lo que necesitas para tu próximo viaje
          </Typography>

          <Box
            role="list"
            sx={{
              mt: 2,
              display: 'grid',
              gap: { xs: 3, md: 4 },
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            }}
          >
            {features.map((feature, index) => (
              <Card
                key={index}
                role="listitem"
                elevation={1}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 'var(--card-radius)',
                  boxShadow: 'var(--card-shadow)',
                  transition: 'transform var(--motion-duration-base) var(--motion-ease-standard), box-shadow var(--motion-duration-base) var(--motion-ease-standard)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 'var(--card-shadow-hover)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'left', p: 3 }}>
                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    {feature.icon}
                    <Typography variant="h5" component="h3" sx={{ fontWeight: 700 }}>
                      {feature.title}
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                  {feature.action && (
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={feature.action.onClick}
                        sx={{ minWidth: 'auto' }}
                      >
                        {feature.action.text}
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Call to Action */}
      <Box component="section" aria-labelledby="cta-title" sx={{ py: { xs: 3, md: 5 } }}>
        <Container maxWidth="lg">
          <Paper
            elevation={3}
            sx={{
              p: { xs: 3, sm: 4 },
              textAlign: 'center',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-primary-contrast)',
              borderRadius: 'var(--card-radius)',
            }}
          >
            <Typography id="cta-title" variant="h2" component="h2" gutterBottom sx={{ fontWeight: 700, fontSize: 'var(--fs-h3)' }}>
              ¿Listo para tu próxima aventura?
            </Typography>
            <Typography variant="h6" component="p" sx={{ mb: 3, color: 'inherit', opacity: 0.95 }}>
              Únete hoy y empieza a planificar con confianza junto a miles de viajeros.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => { trackEvent('cta_click', { cta: 'cta_bottom', destination: '/register' }); navigate('/register'); }}
              aria-label="Comenzar registro"
              sx={{
                minWidth: 200,
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-primary)',
                '&:hover': {
                  backgroundColor: 'var(--color-bg)',
                },
              }}
            >
              Comenzar gratis
            </Button>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;