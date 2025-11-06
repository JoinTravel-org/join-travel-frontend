import { io, Socket } from "socket.io-client";
import Logger from "../logger";
import type { DirectMessage } from "./directMessage.service";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

class SocketService {
  private socket: Socket | null = null;
  private messageListeners: Array<(message: DirectMessage) => void> = [];
  private messageSentListeners: Array<(message: DirectMessage) => void> = [];
  private messagesReadListeners: Array<(data: { userId: string }) => void> = [];
  private isConnecting = false;

  /**
   * Conectar al servidor WebSocket
   */
  connect(token: string): void {
    if (this.socket?.connected) {
      Logger.getInstance().info("Socket already connected");
      return;
    }

    // Si ya hay una conexión en proceso, no crear otra
    if (this.isConnecting) {
      Logger.getInstance().info("Connection already in progress");
      return;
    }

    this.isConnecting = true;
    Logger.getInstance().info("Starting socket connection...");

    try {
      Logger.getInstance().info(`Connecting to ${API_URL} with auth token`);

      this.socket = io(API_URL, {
        auth: {
          token,
        },
        transports: ["websocket", "polling"],
      });

      this.socket.on("connect", () => {
        Logger.getInstance().info("Socket connected successfully");
        this.isConnecting = false;
      });

      this.socket.on("disconnect", () => {
        Logger.getInstance().info("Socket disconnected");
        this.isConnecting = false;
      });

      this.socket.on("connect_error", (error) => {
        Logger.getInstance().error("Socket connection error", error);
        this.isConnecting = false;
      });

      this.socket.on("new_message", (message: DirectMessage) => {
        Logger.getInstance().info("New message received via socket");
        this.messageListeners.forEach((listener) => listener(message));
      });

      this.socket.on("message_sent", (message: DirectMessage) => {
        Logger.getInstance().info("Message sent confirmation received");
        this.messageSentListeners.forEach((listener) => listener(message));
      });

      this.socket.on("messages_read", (data: { userId: string }) => {
        Logger.getInstance().info(
          `Messages marked as read by user: ${data.userId}`
        );
        this.messagesReadListeners.forEach((listener) => listener(data));
      });

      this.socket.on("message_error", (error: { error: string }) => {
        Logger.getInstance().error("Message error", error);
      });
    } catch (error) {
      Logger.getInstance().error("Error connecting socket", error);
      this.isConnecting = false;
    }
  }

  /**
   * Desconectar del servidor WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.messageListeners = [];
      this.messageSentListeners = [];
      this.messagesReadListeners = [];
      this.isConnecting = false;
      Logger.getInstance().info("Socket disconnected and cleaned up");
    }
  }

  /**
   * Esperar a que el socket esté conectado
   */
  private async ensureConnected(): Promise<void> {
    if (!this.socket) {
      throw new Error("Socket not initialized. Please login first.");
    }

    // Si ya está conectado, retornar inmediatamente
    if (this.socket.connected) {
      return;
    }

    // Esperar hasta 5 segundos a que se conecte
    const socket = this.socket; // Guardar referencia para TypeScript

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Socket connection timeout"));
      }, 5000);

      const onConnect = () => {
        clearTimeout(timeout);
        socket.off("connect_error", onError);
        resolve();
      };

      const onError = (error: Error) => {
        clearTimeout(timeout);
        socket.off("connect", onConnect);
        reject(error);
      };

      socket.once("connect", onConnect);
      socket.once("connect_error", onError);

      // Si ya está conectado mientras configuramos los listeners
      if (socket.connected) {
        clearTimeout(timeout);
        socket.off("connect", onConnect);
        socket.off("connect_error", onError);
        resolve();
      }
    });
  }

  /**
   * Enviar un mensaje
   */
  async sendMessage(receiverId: string, content: string): Promise<void> {
    await this.ensureConnected();

    if (!this.socket) {
      throw new Error("Socket not available");
    }

    this.socket.emit("send_message", {
      receiverId,
      content,
    });

    Logger.getInstance().info(`Message sent to user: ${receiverId}`);
  }

  /**
   * Marcar mensajes como leídos
   */
  async markAsRead(otherUserId: string): Promise<void> {
    try {
      await this.ensureConnected();

      if (!this.socket) {
        return;
      }

      this.socket.emit("mark_as_read", {
        otherUserId,
      });

      Logger.getInstance().info(
        `Marked messages as read for user: ${otherUserId}`
      );
    } catch (error) {
      Logger.getInstance().error("Error marking messages as read", error);
    }
  }

  /**
   * Suscribirse a nuevos mensajes
   */
  onNewMessage(callback: (message: DirectMessage) => void): () => void {
    this.messageListeners.push(callback);

    // Retornar función para desuscribirse
    return () => {
      this.messageListeners = this.messageListeners.filter(
        (cb) => cb !== callback
      );
    };
  }

  /**
   * Suscribirse a confirmaciones de mensajes enviados
   */
  onMessageSent(callback: (message: DirectMessage) => void): () => void {
    this.messageSentListeners.push(callback);

    // Retornar función para desuscribirse
    return () => {
      this.messageSentListeners = this.messageSentListeners.filter(
        (cb) => cb !== callback
      );
    };
  }

  /**
   * Suscribirse a eventos de mensajes leídos
   */
  onMessagesRead(callback: (data: { userId: string }) => void): () => void {
    this.messagesReadListeners.push(callback);

    // Retornar función para desuscribirse
    return () => {
      this.messagesReadListeners = this.messagesReadListeners.filter(
        (cb) => cb !== callback
      );
    };
  }

  /**
   * Verificar si el socket está conectado
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export default new SocketService();
