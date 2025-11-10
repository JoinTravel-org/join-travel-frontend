import type { User } from "./user";
import type { Itinerary } from "./itinerary";

export interface CreateGroupRequest {
  name: string;
  description?: string;
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  adminId: string;
  admin?: User; // Full user object for admin if populated
  createdAt: string;
  updatedAt: string;
  members?: User[]; // Array of full user objects
  assignedItineraryId?: string | null;
  assignedItinerary?: Itinerary; // Full itinerary object if populated
}

export interface GroupResponse {
  success: boolean;
  data: Group;
  message?: string;
}

export interface GroupListResponse {
  success: boolean;
  data: Group[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}