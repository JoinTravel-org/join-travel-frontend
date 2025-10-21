import apiService from "./api.service";
import Logger from "../logger";

/**
 * Interfaz para los datos de registro
 */
export interface RegisterData {
  email: string;
  password: string;
}

/**
 * Interfaz para la respuesta del registro
 */
export interface RegisterResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    email: string;
    isEmailConfirmed: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * Interfaz para la respuesta de confirmación de email
 */
export interface ConfirmEmailResponse {
  success: boolean;
  message: string;
}

/**
 * Interfaz para errores de la API
 */
export interface ApiError {
  success: false;
  message: string;
  errors?: string[];
}

/**
 * Servicio de autenticación
 */
class AuthService {
  /**
   * Registra un nuevo usuario
   * @param data - Datos de registro (email y password)
   * @returns Promise con la respuesta del registro
   */
  async register(data: RegisterData): Promise<RegisterResponse> {
    try {
      Logger.getInstance().info(`Attempting to register user with email: ${data.email}`);
      const response = await apiService.register(data.email, data.password);
      Logger.getInstance().info(`User registration successful for email: ${data.email}`);
      return response;
    } catch (error) {
      Logger.getInstance().error(`User registration failed for email: ${data.email}`, error);
      throw error as ApiError;
    }
  }

  /**
   * Confirma el email de un usuario mediante token
   * @param token - Token de confirmación enviado por email
   * @returns Promise con la respuesta de confirmación
   */
  async confirmEmail(token: string): Promise<ConfirmEmailResponse> {
    try {
      Logger.getInstance().info(`Attempting to confirm email with token: ${token.substring(0, 10)}...`);
      const response = await apiService.confirmEmail(token);
      Logger.getInstance().info(`Email confirmation successful for token: ${token.substring(0, 10)}...`);
      return response;
    } catch (error) {
      Logger.getInstance().error(`Email confirmation failed for token: ${token.substring(0, 10)}...`, error);
      throw error as ApiError;
    }
  }
}

export default new AuthService();
