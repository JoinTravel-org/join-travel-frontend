import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUserStats } from '../hooks/useUserStats';
import UserStats from './UserStats';
import Notification from './Notification';
import Milestones from './Milestones';
import userService from '../services/user.service';
import type { Milestone } from '../types/user';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { stats, notification, clearNotification } = useUserStats();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [milestonesLoading, setMilestonesLoading] = useState(false);

  console.log('[DEBUG] Profile component rendering, user:', user, 'stats:', stats, 'notification:', notification);

  useEffect(() => {
    const fetchMilestones = async () => {
      if (!user?.id) return;

      setMilestonesLoading(true);
      try {
        const response = await userService.getUserMilestones(user.id);
        if (response.success && response.data) {
          setMilestones(response.data);
        }
      } catch (error) {
        console.error('Error fetching milestones:', error);
      } finally {
        setMilestonesLoading(false);
      }
    };

    fetchMilestones();
  }, [user?.id]);

  if (!user) {
    return <div>Debe iniciar sesión para ver su perfil.</div>;
  }

  return (
    <div style={{ padding: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
      {/* Left Sidebar - User Stats */}
      <div style={{
        flex: '0 0 300px',
        minWidth: '250px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div>
          <h1 style={{ marginBottom: '8px' }}>Perfil de Usuario</h1>
          <p style={{ margin: 0, color: '#666' }}>Bienvenido, {user.email}</p>
        </div>

        {stats && <UserStats stats={stats} />}

        <Notification
          notification={notification}
          onClose={clearNotification}
        />
      </div>

      {/* Main Content - Milestones */}
      <div style={{
        flex: '2',
        minWidth: '600px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {milestonesLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            Cargando hitos...
          </div>
        ) : (
          <>
            {/* Levels Section */}
            <Milestones milestones={milestones.filter(m => m.category === 'level')} />

            {/* Badges Section */}
            <Milestones milestones={milestones.filter(m => m.category === 'badge')} />
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;