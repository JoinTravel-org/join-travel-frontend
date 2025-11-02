import type { CreateGroupRequest, GroupListResponse, GroupResponse } from '../types/group';
import apiService from './api.service';

/**
 * Servicio para manejar grupos de viaje
 */
class GroupService {
    /**
     * Crea un nuevo grupo
     * @param data - Datos del grupo (nombre y descripción opcional)
     * @returns Promise con la respuesta del servidor
     */
    async createGroup(userId: string, data: CreateGroupRequest): Promise<GroupResponse> {
        try {
            const response = await apiService
                .getAxiosInstance()
                .post(`/groups/${userId}`, data);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 409) {
                throw new Error('Ya existe un grupo con ese nombre.');
            }
            throw new Error('Error al crear el grupo. Por favor intente nuevamente.');
        }
    }

    /**
     * Obtiene todos los grupos del usuario actual
     * @param page - Número de página
     * @param limit - Límite de grupos por página
     * @returns Promise con la lista de grupos
     */
    async getGroups(userid: string, page = 1, limit = 10): Promise<GroupListResponse> {
        try {
            const response = await apiService
                .getAxiosInstance()
                .get(`/groups?userid=${userid}&page=${page}&limit=${limit}`);
            return response.data;
        } catch (error) {
            throw error as GroupListResponse;
        }
    }

    /**
     * Obtiene un grupo por su ID
     * @param groupId - ID del grupo
     * @returns Promise con los datos del grupo
     */
    async getGroupById(groupId: string): Promise<GroupResponse> {
        try {
            const response = await apiService
                .getAxiosInstance()
                .get(`/groups/${groupId}`);
            return response.data;
        } catch (error) {
            throw error as GroupResponse;
        }
    }


}

export default new GroupService();