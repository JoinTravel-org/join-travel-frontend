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
    async createGroup(data: CreateGroupRequest): Promise<GroupResponse> {
        try {
            const response = await apiService
                .getAxiosInstance()
                .post('/groups', data);
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
     * @returns Promise con la lista de grupos
     */
    async getGroups(): Promise<GroupListResponse> {
        try {
            const response = await apiService
                .getAxiosInstance()
                .get('/groups');
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

    /**
     * Agrega miembros a un grupo
     * @param groupId - ID del grupo
     * @param userIds - Array de IDs de usuario a agregar
     * @returns Promise con los datos actualizados del grupo
     */
    async addMember(groupId: string, userIds: string[]): Promise<GroupResponse> {
        try {
            const response = await apiService
                .getAxiosInstance()
                .post(`/groups/${groupId}/members`, { userIds });
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                throw new Error('Grupo no encontrado.');
            }
            if (error.response?.status === 409) {
                throw new Error('Algunos usuarios ya son miembros del grupo.');
            }
            throw new Error('Error al agregar miembros. Por favor intente nuevamente.');
        }
    }

    /**
     * Elimina un miembro de un grupo
     * @param groupId - ID del grupo
     * @param userId - ID del usuario a eliminar
     * @returns Promise con los datos actualizados del grupo
     */
    async removeMember(groupId: string, userId: string): Promise<GroupResponse> {
        try {
            const response = await apiService
                .getAxiosInstance()
                .delete(`/groups/${groupId}/members/${userId}`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                throw new Error('Grupo o usuario no encontrado.');
            }
            if (error.response?.status === 403) {
                throw new Error('No tienes permisos para eliminar este usuario.');
            }
            throw new Error('Error al eliminar el miembro. Por favor intente nuevamente.');
        }
    }

    /**
     * Elimina un grupo por su ID
     * @param groupId - ID del grupo a eliminar
     * @returns Promise con la respuesta del servidor
     */
    async removeGroup(groupId: string): Promise<{ success: boolean; message?: string }> {
        try {
            const response = await apiService
                .getAxiosInstance()
                .delete(`/groups/${groupId}`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                throw new Error('Grupo no encontrado.');
            }
            if (error.response?.status === 403) {
                throw new Error('No tienes permisos para eliminar este grupo.');
            }
            throw new Error('Error al eliminar el grupo. Por favor intente nuevamente.');
        }
    }
}

export default new GroupService();