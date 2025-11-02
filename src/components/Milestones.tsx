import React, { useState } from 'react';
import type { Milestone } from '../types/user';

interface MilestonesProps {
  milestones: Milestone[];
}

const Milestones: React.FC<MilestonesProps> = ({ milestones }) => {
  const [hoveredMilestone, setHoveredMilestone] = useState<Milestone | null>(null);
  const category = milestones.length > 0 ? milestones[0].category : 'general';
  const title = category === 'level' ? '⭐ Hitos de Niveles' : category === 'badge' ? '🏆 Hitos de Insignias' : '🎯 Hitos para Progresar';

  return (
    <div style={{ maxWidth: '800px', margin: '16px auto', padding: '16px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3 style={{ marginBottom: '16px' }}>
        {title}
      </h3>

      {milestones.length === 0 ? (
        <p style={{ color: '#666', textAlign: 'center' }}>
          No hay hitos disponibles en este momento.
        </p>
      ) : (
        <div style={{ position: 'relative', padding: '20px 0' }}>
          {/* Timeline line */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '10%',
            right: '10%',
            height: '2px',
            backgroundColor: '#e0e0e0',
            zIndex: 1
          }} />

          {/* Milestones dots */}
          {milestones.map((milestone, index) => {
            const position = milestones.length > 1 ? (index / (milestones.length - 1)) * 80 + 10 : 50; // 10% to 90%
            return (
              <div
                key={milestone.id}
                style={{
                  position: 'absolute',
                  left: `${position}%`,
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 2
                }}
                onMouseEnter={() => setHoveredMilestone(milestone)}
                onMouseLeave={() => setHoveredMilestone(null)}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: milestone.isCompleted ? '#4caf50' : '#ccc',
                      cursor: 'pointer',
                      border: '2px solid white',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                    title={milestone.title}
                  />
                  <div style={{
                    marginTop: '8px',
                    fontSize: '12px',
                    color: '#666',
                    textAlign: 'center',
                    maxWidth: '80px',
                    wordWrap: 'break-word'
                  }}>
                    {milestone.title.length > 15 ? milestone.title.substring(0, 15) + '...' : milestone.title}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Tooltip */}
          {hoveredMilestone && (
            <div style={{
              position: 'absolute',
              bottom: '70px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '16px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              zIndex: 3,
              maxWidth: '300px',
              fontSize: '14px'
            }}>
              <h4 style={{ margin: '0 0 8px 0' }}>{hoveredMilestone.title}</h4>
              <p style={{ margin: '0 0 8px 0', color: '#666' }}>{hoveredMilestone.description}</p>
              <div style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Progreso: {hoveredMilestone.progress} / {hoveredMilestone.target}</span>
                  <span>{Math.round((hoveredMilestone.progress / hoveredMilestone.target) * 100)}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.min((hoveredMilestone.progress / hoveredMilestone.target) * 100, 100)}%`,
                      height: '100%',
                      backgroundColor: hoveredMilestone.isCompleted ? '#4caf50' : '#1976d2',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
              </div>
              <div>
                <strong>Instrucciones:</strong>
                <ol style={{ paddingLeft: '20px', margin: '4px 0' }}>
                  {hoveredMilestone.instructions.map((instruction, idx) => (
                    <li key={idx} style={{ marginBottom: '2px' }}>{instruction}</li>
                  ))}
                </ol>
              </div>
              {hoveredMilestone.category === 'badge' && hoveredMilestone.badgeName && (
                <p style={{ margin: '8px 0 0 0', color: '#666' }}>
                  🏆 Al completar obtendrás: <strong>{hoveredMilestone.badgeName}</strong>
                </p>
              )}
              {hoveredMilestone.category === 'level' && hoveredMilestone.levelRequired && (
                <p style={{ margin: '8px 0 0 0', color: '#666' }}>
                  ⭐ Al completar subirás al Nivel {hoveredMilestone.levelRequired}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Milestones;