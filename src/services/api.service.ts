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

    // Request interceptor to log outgoing API calls
    this.api.interceptors.request.use(
      (config) => {
        Logger.getInstance().info(`API Request: ${config.method?.toUpperCase()} ${config.baseURL} ${config.url}`);
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
          throw {
            success: false,
            message:
              "No se pudo conectar con el servidor. Verifica tu conexión.",
          };
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
   * Agrega un nuevo lugar
   * @param place - Información del lugar
   * @returns Promise con la respuesta del servidor
   */
  async addPlace(place: { name: string; address: string; latitude: number; longitude: number }) {
    const response = await this.api.post("/places", place);
    return response.data;
  }

  /**
   * Verifica si un lugar ya existe por nombre y coordenadas
   * @param name - Nombre del lugar
   * @param latitude - Latitud
   * @param longitude - Longitud
   * @returns Promise con la respuesta del servidor
   */
  async checkPlaceExists(name: string, latitude: number, longitude: number) {
    const response = await this.api.get("/places/check", {
      params: { name, latitude, longitude }
    });
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
