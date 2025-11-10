import apiService from "./api.service";
import Logger from "../logger";

/**
 * Interfaz para una pregunta
 */
export interface Question {
  id: string;
  placeId: string;
  userId: string;
  content: string;
  voteCount: number;
  createdAt: string;
  updatedAt: string;
  userEmail?: string;
  userVote?: 'up' | null;
}

/**
 * Interfaz para una respuesta
 */
export interface Answer {
  id: string;
  questionId: string;
  userId: string;
  content: string;
  voteCount: number;
  createdAt: string;
  updatedAt: string;
  userEmail?: string;
  userVote?: 'up' | null;
}

/**
 * Interfaz para crear una pregunta
 */
export interface CreateQuestionData {
  placeId: string;
  content: string;
}

/**
 * Interfaz para crear una respuesta
 */
export interface CreateAnswerData {
  questionId: string;
  content: string;
}

/**
 * Interfaz para la respuesta de lista de preguntas
 */
export interface QuestionsResponse {
  success: boolean;
  data?: Question[];
  message?: string;
}

/**
 * Interfaz para la respuesta de lista de respuestas
 */
export interface AnswersResponse {
  success: boolean;
  data?: Answer[];
  message?: string;
}

/**
 * Interfaz para la respuesta de creación
 */
export interface CreateResponse {
  success: boolean;
  data?: Question | Answer;
  message?: string;
}

/**
 * Interfaz para la respuesta de voto
 */
export interface VoteResponse {
  success: boolean;
  data?: {
    voteCount: number;
    userVote: 'up' | null;
  };
  message?: string;
}

/**
 * Servicio para manejar preguntas y respuestas de lugares
 */
class QuestionService {
  /**
   * Crea una nueva pregunta para un lugar
   * @param questionData - Datos de la pregunta
   * @returns Promise con la respuesta del servidor
   */
  async createQuestion(questionData: CreateQuestionData): Promise<CreateResponse> {
    try {
      Logger.getInstance().info(`Creating question for place: ${questionData.placeId}`);
      const response = await apiService
        .getAxiosInstance()
        .post(`/places/${questionData.placeId}/questions`, {
          content: questionData.content,
        });
      Logger.getInstance().info(`Question created successfully`);
      return response.data;
    } catch (error) {
      Logger.getInstance().error(`Failed to create question`, error);
      throw error;
    }
  }

  /**
   * Obtiene todas las preguntas de un lugar
   * @param placeId - ID del lugar
   * @param limit - Número máximo de preguntas (opcional)
   * @param offset - Offset para paginación (opcional)
   * @returns Promise con la lista de preguntas
   */
  async getQuestionsByPlace(
    placeId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<QuestionsResponse> {
    try {
      Logger.getInstance().info(`Getting questions for place: ${placeId}`);
      const response = await apiService
        .getAxiosInstance()
        .get(`/places/${placeId}/questions`, {
          params: { limit, offset },
        });
      Logger.getInstance().info(`Retrieved ${response.data.data?.length || 0} questions`);
      return response.data;
    } catch (error) {
      Logger.getInstance().error(`Failed to get questions for place: ${placeId}`, error);
      throw error;
    }
  }

  /**
   * Vota por una pregunta
   * @param questionId - ID de la pregunta
   * @returns Promise con el estado actualizado del voto
   */
  async voteQuestion(questionId: string): Promise<VoteResponse> {
    try {
      Logger.getInstance().info(`Voting on question: ${questionId}`);
      const response = await apiService
        .getAxiosInstance()
        .post(`/places/questions/${questionId}/vote`);
      Logger.getInstance().info(`Vote toggled successfully`);
      return response.data;
    } catch (error) {
      Logger.getInstance().error(`Failed to vote on question: ${questionId}`, error);
      throw error;
    }
  }

  /**
   * Obtiene el estado del voto del usuario para una pregunta
   * @param questionId - ID de la pregunta
   * @returns Promise con el estado del voto
   */
  async getQuestionVoteStatus(questionId: string): Promise<VoteResponse> {
    try {
      const response = await apiService
        .getAxiosInstance()
        .get(`/places/questions/${questionId}/vote`);
      return response.data;
    } catch (error) {
      Logger.getInstance().error(`Failed to get vote status for question: ${questionId}`, error);
      throw error;
    }
  }

  /**
   * Crea una nueva respuesta para una pregunta
   * @param answerData - Datos de la respuesta
   * @returns Promise con la respuesta del servidor
   */
  async createAnswer(answerData: CreateAnswerData): Promise<CreateResponse> {
    try {
      Logger.getInstance().info(`Creating answer for question: ${answerData.questionId}`);
      const response = await apiService
        .getAxiosInstance()
        .post(`/questions/${answerData.questionId}/answers`, {
          content: answerData.content,
        });
      Logger.getInstance().info(`Answer created successfully`);
      return response.data;
    } catch (error) {
      Logger.getInstance().error(`Failed to create answer`, error);
      throw error;
    }
  }

  /**
   * Obtiene todas las respuestas de una pregunta
   * @param questionId - ID de la pregunta
   * @returns Promise con la lista de respuestas
   */
  async getAnswersByQuestion(questionId: string): Promise<AnswersResponse> {
    try {
      Logger.getInstance().info(`Getting answers for question: ${questionId}`);
      const response = await apiService
        .getAxiosInstance()
        .get(`/questions/${questionId}/answers`);
      Logger.getInstance().info(`Retrieved ${response.data.data?.length || 0} answers`);
      return response.data;
    } catch (error) {
      Logger.getInstance().error(`Failed to get answers for question: ${questionId}`, error);
      throw error;
    }
  }

  /**
   * Vota por una respuesta
   * @param answerId - ID de la respuesta
   * @returns Promise con el estado actualizado del voto
   */
  async voteAnswer(answerId: string): Promise<VoteResponse> {
    try {
      Logger.getInstance().info(`Voting on answer: ${answerId}`);
      const response = await apiService
        .getAxiosInstance()
        .post(`/places/answers/${answerId}/vote`);
      Logger.getInstance().info(`Vote toggled successfully`);
      return response.data;
    } catch (error) {
      Logger.getInstance().error(`Failed to vote on answer: ${answerId}`, error);
      throw error;
    }
  }

  /**
   * Obtiene el estado del voto del usuario para una respuesta
   * @param answerId - ID de la respuesta
   * @returns Promise con el estado del voto
   */
  async getAnswerVoteStatus(answerId: string): Promise<VoteResponse> {
    try {
      const response = await apiService
        .getAxiosInstance()
        .get(`/places/answers/${answerId}/vote`);
      return response.data;
    } catch (error) {
      Logger.getInstance().error(`Failed to get vote status for answer: ${answerId}`, error);
      throw error;
    }
  }
}

export default new QuestionService();