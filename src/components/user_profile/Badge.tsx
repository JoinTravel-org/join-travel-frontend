import React from 'react';
import { Box } from '@mui/material';
import type { Badge as BadgeType } from '../../types/user';

interface BadgeProps {
  badge: BadgeType;
  onShare?: (badge: BadgeType) => void;
  showShareButton?: boolean;
}

const Badge: React.FC<BadgeProps> = ({ badge, onShare, showShareButton = true }) => {
  const handleShare = () => {
    if (onShare) {
      onShare(badge);
    } else {
      // Default share functionality
      const shareText = `¡Acabo de ganar la insignia "${badge.name}" en JoinTravel! ${badge.description}`;
      const shareUrl = window.location.href;

      if (navigator.share) {
        navigator.share({
          title: `Insignia ganada: ${badge.name}`,
          text: shareText,
          url: shareUrl,
        });
      } else {
        // Fallback to clipboard
        navigator.clipboard.writeText(`${shareText} ${shareUrl}`).then(() => {
          alert('¡Texto copiado al portapapeles!');
        });
      }
    }
  };

  const getBadgeEmoji = (name: string): string => {
    const emojiMap: Record<string, string> = {
      '🌍 Primera Reseña': '🌍',
      '📸 Fotógrafo': '📸',
      '⭐ Popular': '⭐',
      'Viajero Activo': '✈️',
      'Guía Experto': '🎯',
      'Maestro Viajero': '🏆',
      'Super Like': '❤️'
    };
    return emojiMap[name] || '🏆';
  };

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: { xs: '6px', sm: '8px' },
        padding: { xs: '6px 10px', sm: '8px 12px' },
        border: '1px solid #1976d2',
        borderRadius: '20px',
        fontSize: { xs: '13px', sm: '14px' },
        color: '#1976d2',
        backgroundColor: '#f8f9fa',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
        minHeight: { xs: '32px', sm: '36px' }
      }}
      onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
        e.currentTarget.style.backgroundColor = '#e3f2fd';
        e.currentTarget.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
        e.currentTarget.style.backgroundColor = '#f8f9fa';
        e.currentTarget.style.transform = 'scale(1)';
      }}
      title={badge.description}
    >
      <span style={{ fontSize: '16px' }}>{getBadgeEmoji(badge.name)}</span>
      <span style={{ fontWeight: '500' }}>{badge.name}</span>

      {showShareButton && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleShare();
          }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px 4px',
            borderRadius: '50%',
            color: '#1976d2',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#bbdefb';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          title="Compartir insignia"
        >
          📤
        </button>
      )}

      {/* Tooltip with earned date */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#333',
          color: 'white',
          padding: { xs: '3px 6px', sm: '4px 8px' },
          borderRadius: '4px',
          fontSize: { xs: '11px', sm: '12px' },
          whiteSpace: 'nowrap',
          opacity: 0,
          pointerEvents: 'none',
          transition: 'opacity 0.2s ease',
          zIndex: 1000
        }}
        className="badge-tooltip"
      >
        Ganada el {new Date(badge.earned_at).toLocaleDateString('es-ES')}
      </Box>
    </Box>
  );
};

export default Badge;