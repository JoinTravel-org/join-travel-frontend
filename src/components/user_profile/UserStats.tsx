import React from 'react';
import { Box, Typography } from '@mui/material';
import type { UserStats as UserStatsType } from '../../types/user';
import BadgeComponent from './Badge';

interface UserStatsProps {
  stats: UserStatsType;
}

const UserStats: React.FC<UserStatsProps> = ({ stats }) => {
  return (
    <Box sx={{
      maxWidth: '600px',
      margin: { xs: '8px auto', sm: '16px auto' },
      padding: { xs: '12px', sm: '16px' },
      border: '1px solid #ccc',
      borderRadius: '8px'
    }}>
      <Box>
        <Typography variant="h6" component="h2" sx={{ marginBottom: '16px' }}>
          Estadísticas de Usuario
        </Typography>

        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: { xs: '12px', sm: '16px' }
        }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <Typography sx={{ marginRight: '8px' }}>⭐</Typography>
              <Typography variant="h6" component="h3" sx={{ margin: 0 }}>
                Nivel {stats.level}: {stats.levelName}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', margin: 0 }}>
              {stats.points} puntos acumulados
            </Typography>
          </Box>

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <Typography sx={{ marginRight: '8px' }}>📈</Typography>
              <Typography variant="body2" sx={{ margin: 0 }}>
                Progreso al siguiente nivel
              </Typography>
            </Box>
            <Box sx={{
              width: '100%',
              height: '8px',
              backgroundColor: 'grey.300',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <Box
                sx={{
                  width: `${stats.progressToNext}%`,
                  height: '100%',
                  backgroundColor: 'primary.main',
                  transition: 'width 0.3s ease'
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', margin: '4px 0 0 0' }}>
              {stats.progressToNext}% completado
            </Typography>
          </Box>
        </Box>

        {stats.badges.length > 0 && (
          <Box sx={{ marginTop: '16px' }}>
            <Typography variant="h6" component="h4" sx={{ marginBottom: '8px' }}>
              🏆 Insignias
            </Typography>
            <Box sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: { xs: '6px', sm: '8px' },
              justifyContent: { xs: 'center', sm: 'flex-start' }
            }}>
              {stats.badges.map((badge, index) => (
                <BadgeComponent
                  key={`${badge.name}-${index}`}
                  badge={badge}
                  showShareButton={true}
                />
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default UserStats;