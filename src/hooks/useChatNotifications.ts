import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useLocation } from 'react-router-dom';
import directMessageService from '../services/directMessage.service';

interface ChatNotificationsState {
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

/**
 * Hook para manejar notificaciones de chat (mensajes sin leer)
 */
export const useChatNotifications = () => {
  const auth = useAuth();
  const location = useLocation();
  const [state, setState] = useState<ChatNotificationsState>({
    unreadCount: 0,
    loading: false,
    error: null,
  });

  const fetchUnreadCount = async () => {
    if (!auth.isAuthenticated || !auth.user) {
      setState(prev => ({ ...prev, unreadCount: 0, loading: false }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await directMessageService.getUnreadCount();
      console.log(`Chat notifications response: ${JSON.stringify(response)}`); // Debug log
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          unreadCount: response.data!.unreadCount,
          loading: false,
        }));
      } else {
        // Si la respuesta no es exitosa, resetear contador a 0
        setState(prev => ({
          ...prev,
          unreadCount: 0,
          error: 'Failed to fetch unread count',
          loading: false,
        }));
      }
    } catch (error) {
      console.error('Error fetching unread message count:', error);
      // En caso de error, resetear contador a 0
      setState(prev => ({
        ...prev,
        unreadCount: 0,
        error: 'Error fetching unread count',
        loading: false,
      }));
    }
  };

  // Función para marcar mensajes como leídos (puede ser útil para actualizar el contador)
  const markAsRead = (count: number = 0) => {
    setState(prev => ({
      ...prev,
      unreadCount: Math.max(0, prev.unreadCount - count),
    }));
  };

  // Cargar contador inicial cuando el usuario se autentica
  useEffect(() => {
    if (auth.isAuthenticated && auth.user) {
      fetchUnreadCount();
    } else {
      setState(prev => ({ ...prev, unreadCount: 0, loading: false, error: null }));
    }
  }, [auth.isAuthenticated, auth.user]);

  // Actualizar contador periódicamente (cada 30 segundos)
  useEffect(() => {
    if (!auth.isAuthenticated || !auth.user) return;

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [auth.isAuthenticated, auth.user]);

  // Refrescar contador cuando cambie la ruta (especialmente al volver de /chats)
  useEffect(() => {
    if (auth.isAuthenticated && auth.user) {
      fetchUnreadCount();
    }
  }, [location.pathname, auth.isAuthenticated, auth.user]);

  return {
    unreadCount: state.unreadCount,
    hasUnreadMessages: state.unreadCount > 0,
    loading: state.loading,
    error: state.error,
    refetch: fetchUnreadCount,
    markAsRead,
  };
};