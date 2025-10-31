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

    try {
      const response = await userService.getUserStats(user.id);
      if (response.success && response.data) {
        // Check for level up before updating stats
        const currentLevel = stats?.level || 0;
        const newLevel = response.data.level;

        if (newLevel > currentLevel && currentLevel > 0) {
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
          setNotification(response.notification);
        } else if (!response.notification && newLevel <= currentLevel) {
          setNotification(null);
        }

        // Check for badge changes in the updated stats
        if (response.data && response.data.badges) {
          const currentBadges = stats?.badges || [];
          const newBadges = response.data.badges;
          const earnedBadges = newBadges.filter(newBadge =>
            !currentBadges.some(existingBadge => existingBadge.name === newBadge.name)
          );

          if (earnedBadges.length > 0 && !response.notification) {
            // Create notification for newly earned badges if not already present
            const badgeNotification: LevelUpNotification = {
              newLevel: newLevel,
              levelName: response.data.levelName,
              message: `¡Felicidades! Has obtenido ${earnedBadges.length === 1 ? 'una nueva insignia' : `${earnedBadges.length} nuevas insignias`}.`,
              newBadges: earnedBadges.map(badge => badge.name)
            };
            setNotification(badgeNotification);
            console.log('Created badge notification:', badgeNotification);
          }
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
    if (!user?.id) return;

    try {
      const response = await userService.updateUserPoints(user.id, action);
      if (response.success && response.data) {
        // Check for level up after points update
        const currentLevel = stats?.level || 0;
        const newLevel = response.data.level;

        if (newLevel > currentLevel && currentLevel > 0) {
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
          setNotification(response.notification);
          console.log('Badge notification received:', response.notification);
        } else if (!response.notification && newLevel <= currentLevel) {
          setNotification(null);
        }

        // Check for badge changes in the updated stats
        if (response.data && response.data.badges) {
          const currentBadges = stats?.badges || [];
          const newBadges = response.data.badges;
          const earnedBadges = newBadges.filter(newBadge =>
            !currentBadges.some(existingBadge => existingBadge.name === newBadge.name)
          );

          if (earnedBadges.length > 0 && !response.notification) {
            // Create notification for newly earned badges if not already present
            const badgeNotification: LevelUpNotification = {
              newLevel: newLevel,
              levelName: response.data.levelName,
              message: `¡Felicidades! Has obtenido ${earnedBadges.length === 1 ? 'una nueva insignia' : `${earnedBadges.length} nuevas insignias`}.`,
              newBadges: earnedBadges.map(badge => badge.name)
            };
            setNotification(badgeNotification);
            console.log('Created badge notification:', badgeNotification);
          }
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
    setNotification(null);

    if (user?.id) {
      fetchUserStats();
    } else {
      setNotification(null);
    }
  }, [user?.id]);

  // Add effect to react to user stats changes from context
  useEffect(() => {
    if (user?.stats && user.stats !== stats) {
      // Check for level up when stats change from context
      const currentLevel = stats?.level || 0;
      const newLevel = user.stats.level;

      if (newLevel > currentLevel && currentLevel > 0) {
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