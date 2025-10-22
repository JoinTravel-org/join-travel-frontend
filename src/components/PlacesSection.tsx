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

import { useNavigate } from 'react-router-dom';

export interface Place {
    id: string;
    name: string;
    address: string;
    latitude: string;
    longitude: string;
    image?: string;
    rating: number | null;
    createdAt: string;
    updatedAt: string;
    description: string | null;
    city: string | null;
}

interface Props {
  places: Place[];
  loading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
}

const PlacesSection: React.FC<Props> = ({ places, loading, page, totalPages, onPageChange }) => {
    const navigate = useNavigate();
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
              onClick={() => navigate(`/place/${place.id}`)}
              elevation={0}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: '2px solid #000',
                borderRadius: 2,
                backgroundColor: '#fff',
                boxShadow: '6px 6px 4px 0px rgba(0,0,0,0.7)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translate(-2px, -2px)',
                  boxShadow: '8px 8px 6px 0px rgba(0,0,0,0.7)',
                  borderColor: '#333',
                },
              }}
            >
              <Box
                sx={{
                  height: 200,
                  backgroundImage: `url(${place.image || '/placeholder-image.jpg'})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: '#f0f0f0',
                  borderBottom: '2px solid #000',
                }}
                onError={(e) => {
                  const target = e.target as HTMLDivElement;
                  target.style.backgroundImage = 'url(/placeholder-image.jpg)';
                }}
              />
              <CardContent sx={{ flexGrow: 1, p: 3, backgroundColor: '#fff' }}>
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    fontSize: '1.25rem',
                    letterSpacing: '0.02em',
                    color: '#000'
                  }}
                >
                  {place.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Rating
                    value={place.rating || 0}
                    readOnly
                    size="small"
                    sx={{
                      '& .MuiRating-iconFilled': {
                        color: '#000',
                      },
                      '& .MuiRating-iconEmpty': {
                        color: '#ccc',
                      }
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      color: '#000'
                    }}
                  >
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