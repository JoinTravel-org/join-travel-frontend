import type {
  CreateExpenseRequest,
  AssignExpenseRequest,
  ExpenseResponse,
  GroupExpensesResponse,
  DeleteExpenseResponse,
} from "../types/expense";
import apiService from "./api.service";

/**
 * Servicio para manejar gastos de grupos
 */
class ExpenseService {
  /**
   * Crea un nuevo gasto para un grupo
   * @param groupId - ID del grupo
   * @param data - Datos del gasto (concepto y monto)
   * @returns Promise con la respuesta del servidor
   */
  async createExpense(
    groupId: string,
    data: CreateExpenseRequest
  ): Promise<ExpenseResponse> {
    try {
      const response = await apiService
        .getAxiosInstance()
        .post(`/groups/${groupId}/expenses`, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error("Valor incorrecto.");
      }
      if (error.response?.status === 403) {
        throw new Error("No tienes permisos para agregar gastos a este grupo.");
      }
      if (error.response?.status === 404) {
        throw new Error("Grupo no encontrado.");
      }
      throw new Error("Error al crear el gasto. Por favor intente nuevamente.");
    }
  }

  /**
   * Obtiene todos los gastos de un grupo
   * @param groupId - ID del grupo
   * @returns Promise con la lista de gastos y total
   */
  async getGroupExpenses(groupId: string): Promise<GroupExpensesResponse> {
    try {
      const response = await apiService
        .getAxiosInstance()
        .get(`/groups/${groupId}/expenses`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new Error(
          "No tienes permisos para ver los gastos de este grupo."
        );
      }
      if (error.response?.status === 404) {
        throw new Error("Grupo no encontrado.");
      }
      throw new Error(
        "Error al obtener los gastos. Por favor intente nuevamente."
      );
    }
  }

  /**
   * Elimina un gasto
   * @param expenseId - ID del gasto a eliminar
   * @returns Promise con la respuesta del servidor
   */
  async deleteExpense(expenseId: string): Promise<DeleteExpenseResponse> {
    try {
      const response = await apiService
        .getAxiosInstance()
        .delete(`/expenses/${expenseId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new Error("No tienes permisos para eliminar este gasto.");
      }
      if (error.response?.status === 404) {
        throw new Error("Gasto no encontrado.");
      }
      throw new Error(
        "Error al eliminar el gasto. Por favor intente nuevamente."
      );
    }
  }

  /**
   * Asigna un gasto a un miembro del grupo (solo admin)
   * @param expenseId - ID del gasto
   * @param data - Datos de asignación (paidById)
   * @returns Promise con el gasto actualizado
   */
  async assignExpense(
    expenseId: string,
    data: AssignExpenseRequest
  ): Promise<ExpenseResponse> {
    try {
      const response = await apiService
        .getAxiosInstance()
        .patch(`/expenses/${expenseId}/assign`, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error("Usuario inválido.");
      }
      if (error.response?.status === 403) {
        throw new Error("Solo el administrador puede asignar gastos.");
      }
      if (error.response?.status === 404) {
        throw new Error("Gasto no encontrado.");
      }
      throw new Error(
        "Error al asignar el gasto. Por favor intente nuevamente."
      );
    }
  }
}

export default new ExpenseService();
