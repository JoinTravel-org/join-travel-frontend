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
    <div style={{ padding: '20px' }}>
      <h1>Perfil de Usuario</h1>
      <p>Bienvenido, {user.email}</p>

      {stats && <UserStats stats={stats} />}

      {milestonesLoading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          Cargando hitos...
        </div>
      ) : (
        <Milestones milestones={milestones} />
      )}

      <Notification
        notification={notification}
        onClose={clearNotification}
      />
    </div>
  );
};

export default Profile;