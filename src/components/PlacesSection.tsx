import React from 'react';
import {
  Typography,
  Container,
  Box,
  Card,
  CardContent,
  Rating,
  CircularProgress,
  Pagination,
} from '@mui/material';

export interface Place {
  id: string;
  name: string;
  image?: string;
  rating: number;
}

interface Props {
  places: Place[];
  loading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
}

const PlacesSection: React.FC<Props> = ({ places, loading, page, totalPages, onPageChange }) => {
  return (
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
              onChange={onPageChange}
              color="primary"
              size="large"
            />
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default PlacesSection;