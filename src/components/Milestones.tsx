import React from 'react';
import type { Milestone } from '../types/user';

interface MilestonesProps {
  milestones: Milestone[];
}

const Milestones: React.FC<MilestonesProps> = ({ milestones }) => {
  return (
    <div style={{ maxWidth: '800px', margin: '16px auto', padding: '16px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2 style={{ marginBottom: '16px' }}>
        🎯 Hitos para Progresar
      </h2>

      {milestones.length === 0 ? (
        <p style={{ color: '#666', textAlign: 'center' }}>
          No hay hitos disponibles en este momento.
        </p>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {milestones.map((milestone) => (
            <div
              key={milestone.id}
              style={{
                padding: '16px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                backgroundColor: milestone.isCompleted ? '#f0f8f0' : '#fff',
                opacity: milestone.isCompleted ? 0.8 : 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ marginRight: '8px', fontSize: '20px' }}>
                  {milestone.isCompleted ? '✅' : '⏳'}
                </span>
                <h3 style={{ margin: 0, flex: 1 }}>
                  {milestone.title}
                </h3>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  backgroundColor: milestone.category === 'badge' ? '#e3f2fd' : '#fff3e0',
                  color: milestone.category === 'badge' ? '#1976d2' : '#f57c00',
                }}>
                  {milestone.category === 'badge' ? '🏆 Insignia' : '⭐ Nivel'}
                </span>
              </div>

              <p style={{ color: '#666', marginBottom: '12px' }}>
                {milestone.description}
              </p>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '14px' }}>
                    Progreso: {milestone.progress} / {milestone.target}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                    {Math.round((milestone.progress / milestone.target) * 100)}%
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.min((milestone.progress / milestone.target) * 100, 100)}%`,
                      height: '100%',
                      backgroundColor: milestone.isCompleted ? '#4caf50' : '#1976d2',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <h4 style={{ marginBottom: '8px', fontSize: '16px' }}>
                  📋 Instrucciones para completar:
                </h4>
                <ol style={{ paddingLeft: '20px', margin: 0 }}>
                  {milestone.instructions.map((instruction, index) => (
                    <li key={index} style={{ marginBottom: '4px', color: '#555' }}>
                      {instruction}
                    </li>
                  ))}
                </ol>
              </div>

              {milestone.category === 'badge' && milestone.badgeName && (
                <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                  🏆 Al completar obtendrás: <strong>{milestone.badgeName}</strong>
                </p>
              )}

              {milestone.category === 'level' && milestone.levelRequired && (
                <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                  ⭐ Al completar subirás al Nivel {milestone.levelRequired}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Milestones;