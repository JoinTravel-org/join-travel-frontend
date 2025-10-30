import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import userService from '../services/user.service';
import type { UserStats, LevelUpNotification } from '../types/user';

export const useUserStats = () => {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error('useUserStats must be used within an AuthProvider');
  }
  const { user, updateUserStats } = authContext;
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<LevelUpNotification | null>(null);

  const fetchUserStats = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    console.log('[DEBUG] Fetching user stats for user:', user.id);

    try {
      const response = await userService.getUserStats(user.id);
      console.log('[DEBUG] User stats response:', response);
      if (response.success && response.data) {
        console.log('[DEBUG] Updating stats in hook and context:', response.data);
        console.log('[DEBUG] Previous stats:', stats);
        console.log('[DEBUG] New stats:', response.data);
        setStats(response.data);
        updateUserStats(response.data);

        if (response.notification) {
          console.log('[DEBUG] Setting notification:', response.notification);
          setNotification(response.notification);
        } else {
          console.log('[DEBUG] No notification in response');
        }
      } else {
        console.log('[DEBUG] Error in response:', response.message);
        setError(response.message || 'Error al obtener estadísticas');
      }
    } catch (err) {
      console.error('[DEBUG] Error fetching user stats:', err);
      setError('Error de conexión al obtener estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const updatePoints = async (action: string) => {
    if (!user?.id) return;

    console.log('[DEBUG] Updating points for user:', user.id, 'action:', action);
    console.log('[DEBUG] Current stats before update:', stats);

    try {
      const response = await userService.updateUserPoints(user.id, action);
      console.log('[DEBUG] Update points response:', response);
      if (response.success && response.data) {
        console.log('[DEBUG] Updating stats after points change:', response.data);
        console.log('[DEBUG] Level before:', stats?.level, 'Level after:', response.data.level);
        setStats(response.data);
        updateUserStats(response.data);

        if (response.notification) {
          console.log('[DEBUG] Setting notification after points update:', response.notification);
          setNotification(response.notification);
        } else {
          console.log('[DEBUG] No level up notification received');
        }
      } else {
        console.log('[DEBUG] Error in update points response:', response.message);
        setError(response.message || 'Error al actualizar puntos');
      }
    } catch (err) {
      console.error('[DEBUG] Error updating points:', err);
      setError('Error temporal de actualización. Inténtalo de nuevo más tarde.');
    }
  };

  const clearNotification = () => {
    console.log('[DEBUG] Clearing notification');
    setNotification(null);
  };

  useEffect(() => {
    console.log('[DEBUG] useUserStats useEffect triggered, user:', user, 'stats:', stats);
    if (user?.id) {
      console.log('[DEBUG] Fetching user stats (always, not just when !stats)');
      fetchUserStats();
    }
  }, [user?.id]);

  return {
    stats,
    loading,
    error,
    notification,
    fetchUserStats,
    updatePoints,
    clearNotification,
  };
};