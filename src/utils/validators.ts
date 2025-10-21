/**
 * Interfaz para los errores de validación de contraseña
 */
export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
}

/**
 * Valida el formato del email
 * @param email - Email a validar
 * @returns true si el formato es válido, false en caso contrario
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida que la contraseña cumpla con los requisitos:
 * - Al menos 8 caracteres
 * - Al menos una mayúscula
 * - Al menos un número
 * - Al menos un símbolo
 * @param password - Contraseña a validar
 * @returns Objeto con isValid y array de errores
 */
export const validatePassword = (password: string): PasswordValidation => {
  const errors: string[] = [];

  if (!password || password.length < 8) {
    errors.push("Al menos 8 caracteres");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Una mayúscula");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Un número");
  }

  if (!/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/;'`~]/.test(password)) {
    errors.push("Un símbolo");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Obtiene un mensaje de error amigable para el usuario
 * @param error - Error recibido de la API
 * @returns Mensaje de error formateado
 */
export const getErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null) {
    const apiError = error as { message?: string; errors?: string[] };

    if (
      apiError.errors &&
      Array.isArray(apiError.errors) &&
      apiError.errors.length > 0
    ) {
      return `${
        apiError.message || "Error de validación"
      }:\n${apiError.errors.join("\n")}`;
    }

    if (apiError.message) {
      return apiError.message;
    }
  }

  return "Error inesperado. Por favor intenta de nuevo.";
};
