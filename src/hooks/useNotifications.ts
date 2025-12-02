import { useState, useEffect, useCallback, useContext } from "react";
import notificationService from "../services/notification.service";
import socketService from "../services/socket.service";
import type { Notification } from "../types/notification";
import Logger from "../logger";
import { AuthContext } from "../contexts/AuthContext";

const logger = Logger.getInstance();

export const useNotifications = () => {
  const authContext = useContext(AuthContext);
  const isAuthenticated = authContext?.isAuthenticated || false;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtiene las notificaciones del usuario
   */
  const fetchNotifications = useCallback(async (limit?: number) => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await notificationService.getNotifications(limit);
      if (response.success && response.data) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al cargar notificaciones";
      logger.error("Error fetching notifications", { error: err });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Obtiene el conteo de notificaciones no leídas
   */
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const response = await notificationService.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.data.count);
      }
    } catch (err) {
      logger.error("Error fetching unread count", err);
    }
  }, [isAuthenticated]);

  /**
   * Marca una notificación como leída
   */
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await notificationService.markAsRead(notificationId);
      if (response.success) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, read: true } : notif
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      logger.error("Error marking notification as read", err);
      throw err;
    }
  }, []);

  /**
   * Marca todas las notificaciones como leídas
   */
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await notificationService.markAllAsRead();
      if (response.success) {
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      logger.error("Error marking all notifications as read", err);
      throw err;
    }
  }, []);

  /**
   * Elimina una notificación
   */
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await notificationService.deleteNotification(
        notificationId
      );
      if (response.success) {
        setNotifications((prev) => {
          const notification = prev.find((n) => n.id === notificationId);
          if (notification && !notification.read) {
            setUnreadCount((count) => Math.max(0, count - 1));
          }
          return prev.filter((notif) => notif.id !== notificationId);
        });
      }
    } catch (err) {
      logger.error("Error deleting notification", err);
      throw err;
    }
  }, []);

  /**
   * Maneja nuevas notificaciones en tiempo real
   */
  useEffect(() => {
    if (!isAuthenticated) return;

    console.log("[useNotifications] Setting up notification listener");
    const unsubscribe = socketService.onNewNotification((notification) => {
      console.log(
        "[useNotifications] ✓ Notification received in hook:",
        notification
      );
      logger.info("New notification received via socket");
      setNotifications((prev) => {
        console.log(
          "[useNotifications] Adding notification to list, current count:",
          prev.length
        );
        return [notification, ...prev];
      });
      if (!notification.read) {
        setUnreadCount((prev) => {
          console.log(
            "[useNotifications] Incrementing unread count from",
            prev,
            "to",
            prev + 1
          );
          return prev + 1;
        });
      }
    });

    // Check socket connection status and handle reconnection
    const checkConnection = () => {
      const isConnected = socketService.isConnected();
      if (!isConnected) {
        logger.warn("Socket disconnected, attempting to reconnect for notifications");
        // The socket service should handle reconnection automatically
        // We can add additional error handling here if needed
      }
    };

    // Check connection periodically
    const connectionCheckInterval = setInterval(checkConnection, 30000); // Check every 30 seconds

    return () => {
      console.log("[useNotifications] Cleaning up notification listener");
      unsubscribe();
      clearInterval(connectionCheckInterval);
    };
  }, [isAuthenticated]);

  /**
   * Carga las notificaciones al montar el componente
   */
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};
