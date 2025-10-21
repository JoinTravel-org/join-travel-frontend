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
 * Interfaz para los datos de login
 */
export interface LoginData {
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
 * Interfaz para la respuesta de logout
 */
export interface LogoutResponse {
  success: boolean;
  message: string;
}

/**
 * Interfaz para la respuesta de login
 */
export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    accessToken: string;
    refreshToken: string;
    user?: {
      id: string;
      email: string;
      isEmailConfirmed: boolean;
      createdAt: string;
      updatedAt: string;
    };
  };
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

  /**
   * Inicia sesión de un usuario
   * @param data - Datos de login (email y password)
   * @returns Promise con la respuesta del login
   */
  async login(data: LoginData): Promise<LoginResponse> {
    try {
      Logger.getInstance().info(`Attempting to login user with email: ${data.email}`);
      const response = await apiService.login(data.email, data.password);
      Logger.getInstance().info(`User login successful for email: ${data.email}`);
      return response;
    } catch (error) {
      Logger.getInstance().error(`User login failed for email: ${data.email}`, error);
      throw error as ApiError;
    }
  }

  /**
   * Cierra sesión de un usuario
   * @returns Promise con la respuesta del logout
   */
  async logout(): Promise<LogoutResponse> {
    try {
      Logger.getInstance().info(`Attempting to logout user`);
      const response = await apiService.logout();
      Logger.getInstance().info(`User logout successful`);
      return response;
    } catch (error) {
      Logger.getInstance().error(`User logout failed`, error);
      throw error as ApiError;
    }
  }
}

export default new AuthService();
