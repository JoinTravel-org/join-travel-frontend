import apiService from './api.service';

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
      const response = await apiService.register(data.email, data.password);
      return response;
    } catch (error) {
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
      const response = await apiService.confirmEmail(token);
      return response;
    } catch (error) {
      throw error as ApiError;
    }
  }
}

export default new AuthService();
