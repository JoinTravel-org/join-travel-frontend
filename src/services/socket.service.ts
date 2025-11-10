import { io, Socket } from "socket.io-client";
import Logger from "../logger";
import type { DirectMessage } from "./directMessage.service";
import type { GroupMessage } from "../types/groupMessage";

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3005";
const logger = Logger.getInstance();

class SocketService {
  private socket: Socket | null = null;
  private messageListeners: Set<(message: DirectMessage) => void> = new Set();
  private groupMessageListeners: Map<
    string,
    Set<(message: GroupMessage) => void>
  > = new Map();

  /**
   * Conecta al servidor de websockets
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

    this.socket.on("message_error", (error) => {
      logger.error("Socket message error", error);
    });
  }

  /**
   * Desconecta del servidor de websockets
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.messageListeners.clear();
      this.groupMessageListeners.clear();
    }
  }

  /**
   * Envía un mensaje directo
   */
  sendDirectMessage(receiverId: string, content: string) {
    if (!this.socket?.connected) {
      throw new Error("Socket not connected");
    }
    this.socket.emit("send_message", { receiverId, content });
  }

  /**
   * Marca mensajes como leídos
   */
  markAsRead(otherUserId: string) {
    if (!this.socket?.connected) {
      throw new Error("Socket not connected");
    }
    this.socket.emit("mark_as_read", { otherUserId });
  }

  /**
   * Une a un grupo para recibir mensajes en tiempo real
   */
  joinGroup(groupId: string) {
    if (!this.socket?.connected) {
      throw new Error("Socket not connected");
    }
    this.socket.emit("join_group", { groupId });
    logger.info(`Joined group ${groupId}`);
  }

  /**
   * Sale de un grupo
   */
  leaveGroup(groupId: string) {
    if (!this.socket?.connected) {
      return;
    }
    this.socket.emit("leave_group", { groupId });
    logger.info(`Left group ${groupId}`);
  }

  /**
   * Envía un mensaje a un grupo
   */
  sendGroupMessage(groupId: string, content: string) {
    if (!this.socket?.connected) {
      throw new Error("Socket not connected");
    }
    this.socket.emit("send_group_message", { groupId, content });
  }

  /**
   * Suscribe a nuevos mensajes directos
   */
  onNewMessage(callback: (message: DirectMessage) => void) {
    this.messageListeners.add(callback);
    return () => {
      this.messageListeners.delete(callback);
    };
  }

  /**
   * Suscribe a nuevos mensajes de un grupo
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
   * Verifica si el socket está conectado
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export default new SocketService();
