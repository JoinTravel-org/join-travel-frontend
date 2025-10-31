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
  const [previousLevel, setPreviousLevel] = useState<number | null>(null);

  const fetchUserStats = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    console.log('[DEBUG] Fetching user stats for user:', user.id);

    try {
      const response = await userService.getUserStats(user.id);
      console.log('[DEBUG] User stats response:', response);
      if (response.data) {
        console.log('[DEBUG] Response data:', response.data);
        console.log('[DEBUG] Level:', response.data.level, 'LevelName:', response.data.levelName);
      }
      console.log('[DEBUG] Response notification:', response.notification);
      if (response.success && response.data) {
        console.log('[DEBUG] Updating stats in hook and context:', response.data);
        console.log('[DEBUG] Previous stats:', stats);
        console.log('[DEBUG] New stats:', response.data);

        // Check for level up before updating stats
        const currentLevel = stats?.level || 0;
        const newLevel = response.data.level;

        console.log('[DEBUG] Level check - Current:', currentLevel, 'New:', newLevel);

        if (newLevel > currentLevel && currentLevel > 0) {
          console.log('[DEBUG] Level up detected! Creating notification');
          const levelUpNotification: LevelUpNotification = {
            newLevel: newLevel,
            levelName: response.data.levelName,
            message: `¡Felicidades! Has alcanzado el Nivel ${newLevel}: ${response.data.levelName}`
          };
          setNotification(levelUpNotification);
        }

        setStats(response.data);
        updateUserStats(response.data);

        if (response.notification) {
          console.log('[DEBUG] Backend provided notification:', response.notification);
          setNotification(response.notification);
        } else if (!response.notification && newLevel <= currentLevel) {
          console.log('[DEBUG] No notification in response and no level up, resetting to null');
          console.log('[DEBUG] Current notification before reset:', notification);
          setNotification(null);
          console.log('[DEBUG] Notification reset to null');
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
      if (response.data) {
        console.log('[DEBUG] Update response data:', response.data);
        console.log('[DEBUG] New Level:', response.data.level, 'New LevelName:', response.data.levelName);
      }
      console.log('[DEBUG] Update response notification:', response.notification);
      if (response.success && response.data) {
        console.log('[DEBUG] Updating stats after points change:', response.data);
        console.log('[DEBUG] Level before:', stats?.level, 'Level after:', response.data.level);

        // Check for level up after points update
        const currentLevel = stats?.level || 0;
        const newLevel = response.data.level;

        console.log('[DEBUG] Level check after points - Current:', currentLevel, 'New:', newLevel);

        if (newLevel > currentLevel && currentLevel > 0) {
          console.log('[DEBUG] Level up detected after points update! Creating notification');
          const levelUpNotification: LevelUpNotification = {
            newLevel: newLevel,
            levelName: response.data.levelName,
            message: `¡Felicidades! Has alcanzado el Nivel ${newLevel}: ${response.data.levelName}`
          };
          setNotification(levelUpNotification);
        }

        setStats(response.data);
        updateUserStats(response.data);

        if (response.notification) {
          console.log('[DEBUG] Backend provided notification after points update:', response.notification);
          setNotification(response.notification);
        } else if (!response.notification && newLevel <= currentLevel) {
          console.log('[DEBUG] No level up notification received after points update, resetting to null');
          setNotification(null);
        }
      } else {
        console.log('[DEBUG] Error in update points response:', response.message);
        setError(response.message || 'Error al actualizar puntos');
        throw new Error(response.message || 'Error al actualizar puntos');
      }
    } catch (err) {
      console.error('[DEBUG] Error updating points:', err);
      setError('Error temporal de actualización. Inténtalo de nuevo más tarde.');
      throw err; // Re-throw to allow caller to handle
    }
  };

  const clearNotification = () => {
    console.log('[DEBUG] Clearing notification');
    setNotification(null);
  };

  useEffect(() => {
    console.log('[DEBUG] useUserStats useEffect triggered, user:', user, 'stats:', stats);
    // Always reset notification when this effect runs to ensure clean state
    console.log('[DEBUG] Resetting notification on useEffect trigger');
    setNotification(null);

    if (user?.id) {
      console.log('[DEBUG] Fetching user stats (always, not just when !stats)');
      fetchUserStats();
    } else {
      // Reset notification when user logs out or changes
      console.log('[DEBUG] No user, resetting notification');
      setNotification(null);
    }
  }, [user?.id]);

  // Add effect to react to user stats changes from context
  useEffect(() => {
    console.log('[DEBUG] useUserStats user.stats changed:', user?.stats);
    if (user?.stats && user.stats !== stats) {
      console.log('[DEBUG] Updating local stats from user context:', user.stats);

      // Check for level up when stats change from context
      const currentLevel = stats?.level || 0;
      const newLevel = user.stats.level;

      console.log('[DEBUG] Level check from context - Current:', currentLevel, 'New:', newLevel);

      if (newLevel > currentLevel && currentLevel > 0) {
        console.log('[DEBUG] Level up detected from context! Creating notification');
        const levelUpNotification: LevelUpNotification = {
          newLevel: newLevel,
          levelName: user.stats.levelName,
          message: `¡Felicidades! Has alcanzado el Nivel ${newLevel}: ${user.stats.levelName}`
        };
        setNotification(levelUpNotification);
      }

      setStats(user.stats);
      // Don't reset notification here if we just created one
      if (newLevel <= currentLevel) {
        console.log('[DEBUG] Resetting notification due to stats change from context (no level up)');
        setNotification(null);
      }
    }
  }, [user?.stats, stats]);

  return {
    stats,
    loading,
    error,
    notification,
    fetchUserStats,
    updatePoints,
    clearNotification,
    previousLevel,
  };
};