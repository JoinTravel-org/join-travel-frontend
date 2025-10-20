import axios, { AxiosError } from "axios";

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

    // Interceptor para manejar errores globalmente
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          // El servidor respondió con un código de error
          throw error.response.data;
        } else if (error.request) {
          // La petición fue hecha pero no hubo respuesta
          throw {
            success: false,
            message:
              "No se pudo conectar con el servidor. Verifica tu conexión.",
          };
        } else {
          // Algo pasó al configurar la petición
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
   * Obtiene la instancia de axios para peticiones personalizadas
   * @returns Instancia de axios
   */
  getAxiosInstance() {
    return this.api;
  }
}

export default new ApiService();
