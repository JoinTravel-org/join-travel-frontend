import React, { useState } from 'react';
import type { Milestone } from '../types/user';

interface MilestonesProps {
  milestones: Milestone[];
}

const Milestones: React.FC<MilestonesProps> = ({ milestones }) => {
  const [hoveredMilestone, setHoveredMilestone] = useState<Milestone | null>(null);
  const category = milestones.length > 0 ? milestones[0].category : 'general';
  const title = category === 'level' ? 'Niveles' : category === 'badge' ? 'Insignias' : '🎯 Hitos para Progresar';

  return (
    <div style={{ width: '100%', margin: '16px 0', padding: '16px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3 style={{ marginBottom: '16px' }}>
        {title}
      </h3>

      {milestones.length === 0 ? (
        <p style={{ color: '#666', textAlign: 'center' }}>
          No hay hitos disponibles en este momento.
        </p>
      ) : (
        <div style={{ position: 'relative', padding: '40px 20px', minHeight: '120px' }}>
          {/* Timeline line */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '5%',
            right: '5%',
            height: '3px',
            backgroundColor: '#e0e0e0',
            zIndex: 1
          }} />

          {/* Milestones dots */}
          {milestones.map((milestone, index) => {
            const position = milestones.length > 1 ? (index / (milestones.length - 1)) * 90 + 5 : 50; // 5% to 95%
            return (
              <div
                key={milestone.id}
                style={{
                  position: 'absolute',
                  left: `${position}%`,
                  top: '50%',
                  transform: 'translate(-50%, -25px)',
                  zIndex: 2
                }}
                onMouseEnter={() => setHoveredMilestone(milestone)}
                onMouseLeave={() => setHoveredMilestone(null)}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      backgroundColor: milestone.isCompleted ? '#4caf50' : '#ccc',
                      cursor: 'pointer',
                      border: '3px solid white',
                      boxShadow: '0 3px 6px rgba(0,0,0,0.3)'
                    }}
                    title={milestone.title}
                  />
                  <div style={{
                    marginTop: '10px',
                    fontSize: '13px',
                    color: '#666',
                    textAlign: 'center',
                    maxWidth: '100px',
                    wordWrap: 'break-word',
                    lineHeight: '1.2'
                  }}>
                    {milestone.title.length > 18 ? milestone.title.substring(0, 18) + '...' : milestone.title}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Tooltip */}
          {hoveredMilestone && (
            <div style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '16px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              zIndex: 1000,
              maxWidth: '300px',
              fontSize: '14px',
              pointerEvents: 'none'
            }}>
              <h4 style={{ margin: '0 0 8px 0' }}>{hoveredMilestone.title}</h4>
              <p style={{ margin: '0 0 8px 0', color: '#666' }}>{hoveredMilestone.description}</p>
              <div style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Progreso: {hoveredMilestone.progress} / {hoveredMilestone.target}</span>
                  {(() => {
                    const percentage = hoveredMilestone.target > 0 ? Math.round((hoveredMilestone.progress / hoveredMilestone.target) * 100) : NaN;
                    return !isNaN(percentage) ? (
                      <span>{percentage}%</span>
                    ) : null;
                  })()}
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${hoveredMilestone.target > 0 ? Math.min((hoveredMilestone.progress / hoveredMilestone.target) * 100, 100) : 0}%`,
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