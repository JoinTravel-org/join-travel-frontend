import React, { useEffect, useState } from 'react';
import type { LevelUpNotification } from '../types/user';

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
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: '#4caf50',
        color: 'white',
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        zIndex: 10000, // Increased z-index to ensure visibility
        maxWidth: '400px',
        animation: 'slideIn 0.3s ease-out'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>
            🎉 ¡Felicidades!
          </h3>
          <p style={{ margin: 0, fontSize: '16px' }}>
            Has alcanzado el Nivel {notification.newLevel}: {notification.levelName}
          </p>
        </div>
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
      </div>
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
    </div>
  );
};

export default Notification;