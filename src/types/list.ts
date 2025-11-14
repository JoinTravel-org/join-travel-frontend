import type { Place } from './place';

/**
 * List interface representing a collection of places
 */
export interface List {
  id: string;
  title: string;
  description: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  places: Place[];
}

/**
 * Request payload for creating a new list
 */
export interface CreateListRequest {
  title: string;
  description?: string;
}

/**
 * Request payload for updating a list
 */
export interface UpdateListRequest {
  title?: string;
  description?: string;
}

/**
 * Response from the backend when creating a list
 */
export interface CreateListResponse {
  success: boolean;
  message: string;
  data: List;
}

/**
 * Response from the backend when updating a list
 */
export interface UpdateListResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    title: string;
    description: string | null;
    userId: string;
    updatedAt: string;
  };
}

/**
 * Response from the backend when deleting a list
 */
export interface DeleteListResponse {
  success: boolean;
  message: string;
}

/**
 * Response from the backend when getting user lists
 */
export interface GetUserListsResponse {
  success: boolean;
  data: List[];
}

/**
 * Response from the backend when getting a specific list
 */
export interface GetListResponse {
  success: boolean;
  data: List;
}

/**
 * Response from the backend when adding/removing a place from list
 */
export interface ModifyListPlaceResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    title: string;
    places: Place[];
  };
}