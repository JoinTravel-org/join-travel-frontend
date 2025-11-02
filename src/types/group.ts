export interface CreateGroupRequest {
  name: string;
  description?: string;
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  adminId: string;
  createdAt: string;
  updatedAt: string;
  members?: Array<{
    id: string;
    email: string;
  }>;
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