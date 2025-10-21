import axios, { AxiosError } from "axios";
import Logger from "../logger";

/**
 * Configuración del cliente API con axios
 */
class ApiService {
  private api;

  constructor() {
    const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

    this.api = axios.create({
      baseURL: `${baseURL}/api`,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000, // 30 segundos para permitir el envío de email
    });

    // Request interceptor to log outgoing API calls and add auth token
    this.api.interceptors.request.use(
      (config) => {
        Logger.getInstance().info(`API Request: ${config.method?.toUpperCase()} ${config.baseURL} ${config.url}`);
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        Logger.getInstance().error("API Request Error", error);
        return Promise.reject(error);
      }
    );

    // Interceptor para manejar errores globalmente
    this.api.interceptors.response.use(
      (response) => {
        Logger.getInstance().info(`API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.baseURL} ${response.config.url}`);
        return response;
      },
      (error: AxiosError) => {
        if (error.response) {
          // El servidor respondió con un código de error
          Logger.getInstance().error(`API Error Response: ${error.response.status} ${error.config?.method?.toUpperCase()} ${error.config?.baseURL} ${error.config?.url}`, error.response.data);
          throw error.response.data;
        } else if (error.request) {
          // La petición fue hecha pero no hubo respuesta
          Logger.getInstance().error("API Request failed: No response from server", error.request);
          if (error.code === 'ECONNABORTED') {
            throw {
              success: false,
              message: "Tiempo de espera agotado.",
            };
          } else {
            throw {
              success: false,
              message: "No se pudo conectar con el servidor. Verifica tu conexión.",
            };
          }
        } else {
          // Algo pasó al configurar la petición
          Logger.getInstance().error("API Request setup error", error.message);
          throw {
            success: false,
            message: "Error inesperado. Por favor intenta de nuevo.",
          };
        }
      }
    );
  }

  /**
   * Registra un nuevo usuario
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   * @returns Promise con la respuesta del servidor
   */
  async register(email: string, password: string) {
    const response = await this.api.post("/auth/register", {
      email,
      password,
    });
    return response.data;
  }

  /**
   * Confirma el email de un usuario
   * @param token - Token de confirmación
   * @returns Promise con la respuesta del servidor
   */
  async confirmEmail(token: string) {
    const response = await this.api.get(`/auth/confirm-email/${token}`);
    return response.data;
  }

  /**
   * Inicia sesión de un usuario
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   * @returns Promise con la respuesta del servidor
   */
  async login(email: string, password: string) {
    const response = await this.api.post("/auth/login", {
      email,
      password,
    });
    return response.data;
  }

  /**
   * Cierra sesión de un usuario
   * @returns Promise con la respuesta del servidor
   */
  async logout() {
    const response = await this.api.post("/auth/logout");
    return response.data;
  }

  /**
   * Obtiene la instancia de axios para peticiones personalizadas
   * @returns Instancia de axios
   */
  getAxiosInstance() {
    return this.api;
  }
}

export default new ApiService();
