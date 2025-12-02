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
  const [previousStats, setPreviousStats] = useState<UserStats | null>(null);

  const fetchUserStats = async () => {
    if (!user?.id || user.id === 'undefined') return;

    setLoading(true);
    setError(null);

    try {
      const response = await userService.getUserStats(user.id);
      if (response.success && response.data) {
        // Store previous stats for comparison after actions
        setPreviousStats(stats);

        setStats(response.data);
        // Update user stats in context immediately for header display
        updateUserStats(response.data);

        // Only set notification if it comes from the backend (badge earned)
        if (response.notification) {
          setNotification(response.notification);
        }
      } else {
        setError(response.message || 'Error al obtener estadísticas');
      }
    } catch (err) {
      console.error('Error fetching user stats:', err);
      setError('Error de conexión al obtener estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const updatePoints = async (action: string) => {
    if (!user?.id || user.id === 'undefined') return;

    try {
      const response = await userService.updateUserPoints(user.id, action);
      if (response.success && response.data) {
        // Check for level up after points update using previous stats
        const previousLevel = previousStats?.level || 0;
        const newLevel = response.data.level;

        if (newLevel > previousLevel && previousLevel > 0) {
          const levelUpNotification: LevelUpNotification = {
            newLevel: newLevel,
            levelName: response.data.levelName,
            message: `¡Felicidades! Has alcanzado el Nivel ${newLevel}: ${response.data.levelName}`
          };
          setNotification(levelUpNotification);
        }

        // Check for new badges
        const previousBadges = previousStats?.badges || [];
        const newBadges = response.data.badges || [];
        const earnedBadges = newBadges.filter(newBadge =>
          !previousBadges.some(prevBadge => prevBadge.name === newBadge.name)
        );

        if (earnedBadges.length > 0) {
          const badgeNotification: LevelUpNotification = {
            newLevel: newLevel, // Use current level as placeholder
            levelName: response.data.levelName, // Use current level name
            message: `¡Felicidades! Has obtenido ${earnedBadges.length > 1 ? 'nuevas insignias' : 'una nueva insignia'}`,
            newBadges: earnedBadges.map(badge => badge.name)
          };
          setNotification(badgeNotification);
        }

        setStats(response.data);
        // Update user stats in context immediately for header display
        updateUserStats(response.data);

        // Set notification only if it comes from the backend (badge earned from action)
        if (response.notification) {
          setNotification(response.notification);
        }
      } else {
        setError(response.message || 'Error al actualizar puntos');
        throw new Error(response.message || 'Error al actualizar puntos');
      }
    } catch (err) {
      console.error('Error updating points:', err);
      setError('Error temporal de actualización. Inténtalo de nuevo más tarde.');
      throw err; // Re-throw to allow caller to handle
    }
  };

  const clearNotification = () => {
    setNotification(null);
  };

  useEffect(() => {
    // Clear notification only when user logs out
    if (!user?.id) {
      setNotification(null);
      setStats(null);
      setPreviousStats(null);
    }

    if (user?.id) {
      fetchUserStats();
    }
  }, [user?.id]);

  // Add effect to detect changes after actions and show notifications
  useEffect(() => {
    if (user?.stats && previousStats) {
      // Check for level up
      const previousLevel = previousStats.level;
      const newLevel = user.stats.level;

      if (newLevel > previousLevel && previousLevel > 0) {
        const levelUpNotification: LevelUpNotification = {
          newLevel: newLevel,
          levelName: user.stats.levelName,
          message: `¡Felicidades! Has alcanzado el Nivel ${newLevel}: ${user.stats.levelName}`
        };
        setNotification(levelUpNotification);
      }

      // Check for new badges
      const previousBadges = previousStats.badges || [];
      const newBadges = user.stats.badges || [];
      const earnedBadges = newBadges.filter(newBadge =>
        !previousBadges.some(prevBadge => prevBadge.name === newBadge.name)
      );

      if (earnedBadges.length > 0) {
        const badgeNotification: LevelUpNotification = {
          newLevel: newLevel,
          levelName: user.stats.levelName,
          message: `¡Felicidades! Has obtenido ${earnedBadges.length > 1 ? 'nuevas insignias' : 'una nueva insignia'}`,
          newBadges: earnedBadges.map(badge => badge.name)
        };
        setNotification(badgeNotification);
      }

      // Update previous stats after checking for changes
      setPreviousStats(user.stats);
    }
  }, [user?.stats, previousStats]);

  // Effect to ensure header updates immediately when stats change
  useEffect(() => {
    if (user?.stats) {
      setStats(user.stats);
    }
  }, [user?.stats]);

  return {
    stats,
    loading,
    error,
    notification,
    fetchUserStats,
    updatePoints,
    clearNotification,
    setNotification,
  };
};