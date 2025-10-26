import type { Place } from './place';

/**
 * Itinerary item interface representing a place and its visit date
 */
export interface ItineraryItem {
  place: Place;
  date: string;
}

/**
 * Itinerary interface representing a complete travel itinerary
 */
export interface Itinerary {
  id?: string;
  name: string;
  items: ItineraryItem[];
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Request payload for creating a new itinerary (backend format with place IDs)
 */
export interface CreateItineraryRequest {
  name: string;
  items: Array<{
    placeId: string;
    date: string;
  }>;
}

/**
 * Response from the backend when creating an itinerary
 */
export interface CreateItineraryResponse {
  success: boolean;
  message: string;
  data?: Itinerary;
}
