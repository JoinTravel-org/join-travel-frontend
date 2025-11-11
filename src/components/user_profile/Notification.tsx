import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import type { LevelUpNotification } from '../../types/user';

interface NotificationProps {
  notification: LevelUpNotification | null;
  onClose: () => void;
  autoHideDuration?: number;
}

const Notification: React.FC<NotificationProps> = ({ notification, onClose, autoHideDuration = 10000 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [notification, onClose, autoHideDuration]);

  if (!notification || !isVisible) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: { xs: '10px', sm: '20px' },
        right: { xs: '10px', sm: '20px' },
        left: { xs: '10px', sm: 'auto' },
        backgroundColor: notification.newBadges && notification.newBadges.length > 0 ? '#ff6f00' : '#1976d2',
        color: 'white',
        padding: { xs: '12px', sm: '16px' },
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        zIndex: 10000, // Increased z-index to ensure visibility
        maxWidth: { xs: 'calc(100vw - 20px)', sm: '400px' },
        animation: 'slideIn 0.3s ease-out'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6" sx={{ margin: '0 0 8px 0' }}>
            {notification.newBadges && notification.newBadges.length > 0 ? '🏆 ¡Nueva insignia!' : '🎉 ¡Felicidades!'}
          </Typography>
          {notification.newBadges && notification.newBadges.length > 0 ? (
            <Box>
              <Typography variant="body1" sx={{ margin: 0 }}>
                {notification.message}
              </Typography>
              <Box sx={{ margin: '8px 0 0 0' }}>
                <Typography variant="body2" sx={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>
                  🏆 ¡Nuevas insignias obtenidas!
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {notification.newBadges.map((badgeName, index) => (
                    <Box
                      key={index}
                      sx={{
                        padding: '2px 6px',
                        backgroundColor: '#ffe0b2',
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: '#e65100',
                        fontWeight: 'bold'
                      }}
                    >
                      {badgeName}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          ) : (
            <Typography variant="body1" sx={{ margin: 0 }}>
              {notification.message}
            </Typography>
          )}
        </Box>
        <button
          onClick={() => {
            setIsVisible(false);
            onClose();
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '0',
            marginLeft: '8px'
          }}
          aria-label="Cerrar notificación"
        >
          ×
        </button>
      </Box>
    <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </Box>
  );
};

export default Notification;