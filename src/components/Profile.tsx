import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUserStats } from '../hooks/useUserStats';
import UserStats from './UserStats';
import Notification from './Notification';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { stats, notification, clearNotification } = useUserStats();

  console.log('[DEBUG] Profile component rendering, user:', user, 'stats:', stats, 'notification:', notification);

  if (!user) {
    return <div>Debe iniciar sesión para ver su perfil.</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Perfil de Usuario</h1>
      <p>Bienvenido, {user.email}</p>

      {stats && <UserStats stats={stats} />}

      <Notification
        notification={notification}
        onClose={clearNotification}
      />
    </div>
  );
};

export default Profile;