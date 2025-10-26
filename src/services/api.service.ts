import axios, { AxiosError } from "axios";
import Logger from "../logger";
import type { CreateItineraryRequest, CreateItineraryResponse } from "../types/itinerary";

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
        Logger.getInstance().info(
          `API Request: ${config.method?.toUpperCase()} ${config.baseURL} ${
            config.url
          }`
        );
        const token = localStorage.getItem("accessToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        Logger.getInstance().info(
          `API Request: ${config.method?.toUpperCase()} ${config.baseURL} ${
            config.url
          } - Data: ${JSON.stringify(config.data || {})}`
        );
        return config;
      },
      (error) => {
        Logger.getInstance().error("API Request Error", JSON.stringify(error));
        return Promise.reject(error);
      }
    );

    // Interceptor para manejar errores globalmente
    this.api.interceptors.response.use(
      (response) => {
        Logger.getInstance().info(
          `API Response: ${
            response.status
          } ${response.config.method?.toUpperCase()} ${
            response.config.baseURL
          } ${response.config.url}`
        );
        return response;
      },
      (error: AxiosError) => {
        if (error.response) {
          // El servidor respondió con un código de error
          Logger.getInstance().error(
            `API Error Response: ${
              error.response.status
            } ${error.config?.method?.toUpperCase()} ${error.config?.baseURL} ${
              error.config?.url
            }`,
            JSON.stringify(error.response.data)
          );
          throw error.response.data;
        } else if (error.request) {
          // La petición fue hecha pero no hubo respuesta
          Logger.getInstance().error(
            "API Request failed: No response from server",
            error.request
          );
          if (error.code === "ECONNABORTED") {
            throw {
              success: false,
              message: "Error al guardar la reseña",
            };
          } else {
            throw {
              success: false,
              message: "Error al guardar la reseña",
            };
          }
        } else {
          // Algo pasó al configurar la petición
          Logger.getInstance().error(
            "API Request setup error",
            JSON.stringify(error.message)
          );
          throw {
            success: false,
            message: "Error al guardar la reseña",
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
  async addPlace(place: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    image?: string;
    city?: string;
    description?: string;
  }) {
    const placeData = {
      name: place.name,
      address: place.address,
      latitude: place.latitude,
      longitude: place.longitude,
      ...(place.image && { image: place.image }),
      ...(place.city && { city: place.city }),
      ...(place.description && { description: place.description }),
    };
    Logger.getInstance().info(JSON.stringify(placeData))
    const response = await this.api.post("/places", placeData);
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
      params: { name, latitude, longitude },
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

  /*
   * Obtiene una lista de lugares con paginación
   * @param page - Número de página
   * @param limit - Número de lugares por página
   * @returns Promise con la respuesta del servidor
   */
  async getPlaces(page: number = 1, limit: number = 20) {
    const response = await this.api.get("/places", {
      params: { page, limit },
    });

    return response.data;
  }

  async getPlaceById(id: string) {
    const response = await this.api.get(`/places/${id}`);
    return response.data;
  }

  /**
   * Actualiza la descripción de un lugar
   * @param id - ID del lugar
   * @param description - Nueva descripción
   * @returns Promise con la respuesta del servidor
   */
  async updatePlaceDescription(id: string, description: string) {
    const response = await this.api.put(`/places/${id}/description`, {
      description,
    });
    return response.data;
  }

  /**
   * Crea un nuevo itinerario
   * @param itinerary - Información del itinerario
   * @returns Promise con la respuesta del servidor
   */
  async createItinerary(itinerary: CreateItineraryRequest): Promise<CreateItineraryResponse> {
    const response = await this.api.post("/itineraries", itinerary);
    return response.data;
  }

  /**
   * Obtiene todos los itinerarios del usuario autenticado
   * @returns Promise con los itinerarios del usuario
   */
  async getUserItineraries() {
    const response = await this.api.get("/itineraries");
    return response.data;
  }

  /**
   * Obtiene un itinerario por su ID
   * @param id - ID del itinerario
   * @returns Promise con el itinerario
   */
  async getItineraryById(id: string) {
    const response = await this.api.get(`/itineraries/${id}`);
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
