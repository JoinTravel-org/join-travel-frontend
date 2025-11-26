import { io, Socket } from "socket.io-client";
import Logger from "../logger";
import type { DirectMessage } from "./directMessage.service";
import type { GroupMessage } from "../types/groupMessage";
import type { Notification } from "../types/notification";

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3005";
const logger = Logger.getInstance();

class SocketService {
  private socket: Socket | null = null;
  private messageListeners: Set<(message: DirectMessage) => void> = new Set();
  private groupMessageListeners: Map<
    string,
    Set<(message: GroupMessage) => void>
  > = new Map();
  private notificationListeners: Set<(notification: Notification) => void> =
    new Set();

  /**
   * Connect to the websocket server
   */
  connect(token: string) {
    if (this.socket?.connected) {
      logger.info("Socket already connected");
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    this.socket.on("connect", () => {
      logger.info("Socket connected");
    });

    this.socket.on("disconnect", () => {
      logger.info("Socket disconnected");
    });

    this.socket.on("new_message", (message) => {
      logger.info(`New direct message received: ${message.id}`);
      this.messageListeners.forEach((listener) => listener(message));
    });

    this.socket.on("new_group_message", (message) => {
      logger.info(`New group message received: ${message.id}`);
      const listeners = this.groupMessageListeners.get(message.groupId);
      if (listeners) {
        listeners.forEach((listener) => listener(message));
      }
    });

    this.socket.on("new_notification", (notification) => {
      const receiveTime = Date.now();
      console.log(
        "[Socket] ✓ New notification received via socket:",
        notification
      );
      logger.info(
        `New notification received: ${notification.id}, type: ${notification.type}, title: ${notification.title}, read: ${notification.read}`
      );
      console.log(
        `[Socket] Notifying ${this.notificationListeners.size} listeners at ${receiveTime}`
      );
      this.notificationListeners.forEach((listener) => {
        try {
          listener(notification);
        } catch (error) {
          logger.error(`Error in notification listener: ${error instanceof Error ? error.message : String(error)}`);
        }
      });
      const processTime = Date.now();
      logger.debug(`Notification processing completed in ${processTime - receiveTime}ms`);
    });

    this.socket.on("message_error", (error) => {
      logger.error("Socket message error", error);
    });
  }

  /**
   * Disconnect from the websocket server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.messageListeners.clear();
      this.groupMessageListeners.clear();
      this.notificationListeners.clear();
    }
  }

  /**
   * Send a direct message
   */
  sendDirectMessage(receiverId: string, content: string) {
    if (!this.socket?.connected) {
      throw new Error("Socket not connected");
    }
    this.socket.emit("send_message", { receiverId, content });
  }

  /**
   * Mark messages as read
   */
  markAsRead(otherUserId: string) {
    if (!this.socket?.connected) {
      throw new Error("Socket not connected");
    }
    this.socket.emit("mark_as_read", { otherUserId });
  }

  /**
   * Join a group to receive real-time messages
   */
  joinGroup(groupId: string) {
    if (!this.socket?.connected) {
      throw new Error("Socket not connected");
    }
    this.socket.emit("join_group", { groupId });
    logger.info(`Joined group ${groupId}`);
  }

  /**
   * Leave a group
   */
  leaveGroup(groupId: string) {
    if (!this.socket?.connected) {
      return;
    }
    this.socket.emit("leave_group", { groupId });
    logger.info(`Left group ${groupId}`);
  }

  /**
   * Send a message to a group
   */
  sendGroupMessage(groupId: string, content: string) {
    if (!this.socket?.connected) {
      throw new Error("Socket not connected");
    }
    this.socket.emit("send_group_message", { groupId, content });
  }

  /**
   * Subscribe to new direct messages
   */
  onNewMessage(callback: (message: DirectMessage) => void) {
    this.messageListeners.add(callback);
    return () => {
      this.messageListeners.delete(callback);
    };
  }

  /**
   * Subscribe to new group messages
   */
  onNewGroupMessage(
    groupId: string,
    callback: (message: GroupMessage) => void
  ) {
    if (!this.groupMessageListeners.has(groupId)) {
      this.groupMessageListeners.set(groupId, new Set());
    }
    this.groupMessageListeners.get(groupId)!.add(callback);

    return () => {
      const listeners = this.groupMessageListeners.get(groupId);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.groupMessageListeners.delete(groupId);
        }
      }
    };
  }

  /**
   * Suscribe a nuevas notificaciones
   */
  onNewNotification(callback: (notification: Notification) => void) {
    this.notificationListeners.add(callback);
    return () => {
      this.notificationListeners.delete(callback);
    };
  }

  /**
   * Verifica si el socket está conectado
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export default new SocketService();
