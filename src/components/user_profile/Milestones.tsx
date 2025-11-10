import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import type { Milestone } from '../../types/user';

interface MilestonesProps {
  milestones: Milestone[];
}

const Milestones: React.FC<MilestonesProps> = ({ milestones }) => {
  const [hoveredMilestone, setHoveredMilestone] = useState<Milestone | null>(null);
  const category = milestones.length > 0 ? milestones[0].category : 'general';
  const title = category === 'level' ? 'Niveles' : category === 'badge' ? 'Insignias' : '🎯 Hitos para Progresar';

  return (
    <Box sx={{
      width: '100%',
      margin: { xs: '12px 0', sm: '16px 0' },
      padding: { xs: '12px', sm: '16px' },
      border: '1px solid #ccc',
      borderRadius: '8px'
    }}>
      <Typography variant="h6" component="h3" sx={{ marginBottom: '16px' }}>
        {title}
      </Typography>

      {milestones.length === 0 ? (
        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
          No hay hitos disponibles en este momento.
        </Typography>
      ) : (
        <Box sx={{
          position: 'relative',
          padding: { xs: '30px 10px', sm: '40px 20px' },
          minHeight: '120px',
          overflowX: 'auto',
          '&::-webkit-scrollbar': {
            height: '4px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#f1f1f1',
            borderRadius: '2px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#c1c1c1',
            borderRadius: '2px',
            '&:hover': {
              backgroundColor: '#a8a8a8',
            },
          },
        }}>
          {/* Timeline line */}
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '20px',
            right: '20px',
            height: '3px',
            backgroundColor: 'grey.300',
            zIndex: 1,
            minWidth: `${Math.max(milestones.length * 160, 100)}%`
          }} />

          {/* Milestones dots */}
          {milestones.map((milestone, index) => {
            // Calculate position with more spacing between milestones
            const totalWidth = milestones.length * 160; // 160px per milestone for more space
            const position = (index * 160) + 80; // Center each milestone in its 160px slot

            return (
              <Box
                key={milestone.id}
                sx={{
                  position: 'absolute',
                  left: `${position}px`,
                  top: '50%',
                  transform: 'translate(-50%, -25px)',
                  zIndex: 2,
                  width: '140px',
                  display: 'flex',
                  justifyContent: 'center'
                }}
                onMouseEnter={() => setHoveredMilestone(milestone)}
                onMouseLeave={() => setHoveredMilestone(null)}
              >
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: '100px'
                }}>
                  <Box
                    sx={{
                      width: { xs: '40px', sm: '50px' },
                      height: { xs: '40px', sm: '50px' },
                      borderRadius: '50%',
                      backgroundColor: milestone.isCompleted ? 'success.main' : 'grey.400',
                      cursor: 'pointer',
                      border: '3px solid white',
                      boxShadow: '0 3px 6px rgba(0,0,0,0.3)',
                      flexShrink: 0,
                      '&:hover': {
                        transform: 'scale(1.1)',
                        transition: 'transform 0.2s ease'
                      }
                    }}
                    title={milestone.title}
                  />
                  <Box sx={{
                    marginTop: '10px',
                    fontSize: { xs: '10px', sm: '12px' },
                    color: 'text.secondary',
                    textAlign: 'center',
                    maxWidth: '120px',
                    wordWrap: 'break-word',
                    lineHeight: '1.2',
                    minHeight: '2.4em', // Ensure consistent height
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center'
                  }}>
                    {milestone.title.length > 20 ? milestone.title.substring(0, 20) + '...' : milestone.title}
                  </Box>
                </Box>
              </Box>
            );
          })}

          {/* Tooltip */}
          {hoveredMilestone && (
            <Box sx={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '8px',
              padding: { xs: '12px', sm: '16px' },
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              zIndex: 1000,
              maxWidth: { xs: '280px', sm: '300px' },
              fontSize: { xs: '13px', sm: '14px' },
              pointerEvents: 'none'
            }}>
              <Typography variant="h6" sx={{ margin: '0 0 8px 0' }}>
                {hoveredMilestone.title}
              </Typography>
              <Typography variant="body2" sx={{ margin: '0 0 8px 0', color: 'text.secondary' }}>
                {hoveredMilestone.description}
              </Typography>
              <Box sx={{ marginBottom: '8px' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <Typography variant="body2">
                    Progreso: {hoveredMilestone.progress} / {hoveredMilestone.target}
                  </Typography>
                  {(() => {
                    const percentage = hoveredMilestone.target > 0 ? Math.round((hoveredMilestone.progress / hoveredMilestone.target) * 100) : NaN;
                    return !isNaN(percentage) ? (
                      <Typography variant="body2">{percentage}%</Typography>
                    ) : null;
                  })()}
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
                      width: `${hoveredMilestone.target > 0 ? Math.min((hoveredMilestone.progress / hoveredMilestone.target) * 100, 100) : 0}%`,
                      height: '100%',
                      backgroundColor: hoveredMilestone.isCompleted ? 'success.main' : 'primary.main',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </Box>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  Instrucciones:
                </Typography>
                <Box component="ol" sx={{ paddingLeft: '20px', margin: '4px 0' }}>
                  {hoveredMilestone.instructions.map((instruction, idx) => (
                    <Box component="li" key={idx} sx={{ marginBottom: '2px', fontSize: 'inherit' }}>
                      {instruction}
                    </Box>
                  ))}
                </Box>
              </Box>
              {hoveredMilestone.category === 'badge' && hoveredMilestone.badgeName && (
                <Typography variant="body2" sx={{ margin: '8px 0 0 0', color: 'text.secondary' }}>
                  🏆 Al completar obtendrás: <strong>{hoveredMilestone.badgeName}</strong>
                </Typography>
              )}
              {hoveredMilestone.category === 'level' && hoveredMilestone.levelRequired && (
                <Typography variant="body2" sx={{ margin: '8px 0 0 0', color: 'text.secondary' }}>
                  ⭐ Al completar subirás al Nivel {hoveredMilestone.levelRequired}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Milestones;