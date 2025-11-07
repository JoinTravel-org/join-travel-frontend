import React from 'react';
import type { UserStats as UserStatsType } from '../../types/user';
import BadgeComponent from './Badge';

interface UserStatsProps {
  stats: UserStatsType;
}

const UserStats: React.FC<UserStatsProps> = ({ stats }) => {
  return (
    <div style={{ maxWidth: '600px', margin: '16px auto', padding: '16px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <div>
        <h2 style={{ marginBottom: '16px' }}>
          Estadísticas de Usuario
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ marginRight: '8px' }}>⭐</span>
              <h3 style={{ margin: 0 }}>
                Nivel {stats.level}: {stats.levelName}
              </h3>
            </div>
            <p style={{ color: '#666', margin: 0 }}>
              {stats.points} puntos acumulados
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ marginRight: '8px' }}>📈</span>
              <p style={{ margin: 0 }}>
                Progreso al siguiente nivel
              </p>
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${stats.progressToNext}%`,
                  height: '100%',
                  backgroundColor: '#1976d2',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
            <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>
              {stats.progressToNext}% completado
            </p>
          </div>
        </div>

        {stats.badges.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <h4 style={{ marginBottom: '8px' }}>
              🏆 Insignias
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {stats.badges.map((badge, index) => (
                <BadgeComponent
                  key={`${badge.name}-${index}`}
                  badge={badge}
                  showShareButton={true}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserStats;